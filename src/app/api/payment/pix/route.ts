import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { getWebhookService } from '@/services/webhook';
import { OrderCreatedEventHandler } from '@/services/webhook/events/order-created.event';
import { paymentRateLimit } from '@/lib/rate-limit';

// Schema para validação do payload
const paymentSchema = z.object({
  orderId: z.string(),
  valorTotal: z.number().positive(),
  cliente: z.object({
    nome: z.string().min(2),
    email: z.string().email(),
    telefone: z.string().min(11),
  }),
  items: z.array(
    z.object({
      id: z.string(),
      nome: z.string(),
      quantidade: z.number().int().positive(),
      preco: z.number().positive(),
    }),
  ),
});

// Tipo para resposta do Mercado Pago
type MercadoPagoResponse = {
  id: number;
  status: string;
  payment_method_id: string;
  date_of_expiration?: string;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
      ticket_url?: string;
    };
  };
};

// Tipo para dados do PIX que serão armazenados
type PixData = {
  mercadoPagoId: string;
  pixCopyPaste: string;
  qrCodeBase64: string;
  ticket_url: string;
  expiresAt: string;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Verificar rate limiting
    const rateLimitResult = await paymentRateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Muitas tentativas de pagamento. Aguarde alguns minutos.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        },
      );
    }

    // 2. Validar payload
    const dados = await request.json();
    const validationResult = paymentSchema.safeParse(dados);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const payload = validationResult.data;

    if (process.env.NODE_ENV === 'development') {
    }

    // 3. Verificar se o pedido existe e está no status correto
    const order = await prisma.order.findUnique({
      where: { id: payload.orderId },
      include: { orderItems: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Pedido não encontrado' }, { status: 404 });
    }

    if (order.status !== 'DRAFT') {
      return NextResponse.json(
        {
          success: false,
          error: 'Pedido não está no status correto para pagamento',
        },
        { status: 400 },
      );
    }

    // 4. Processar pagamento PIX

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 4.1 Atualizar status do pedido para PENDING
      await tx.order.update({
        where: { id: payload.orderId },
        data: { status: 'PENDING' },
      });

      // 4.2 Criar pagamento PIX via Mercado Pago
      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
      });

      const payment = new Payment(client);
      const telefone = payload.cliente.telefone.replace(/\D/g, '');
      const areaCode = telefone.substring(0, 2);
      const phoneNumber = telefone.substring(2);

      const mpPaymentData = {
        transaction_amount: payload.valorTotal,
        description: `Pedido #${payload.orderId}`,
        payment_method_id: 'pix',
        payer: {
          email: payload.cliente.email,
          first_name: payload.cliente.nome.split(' ')[0],
          last_name:
            payload.cliente.nome.split(' ').slice(1).join(' ') ||
            payload.cliente.nome.split(' ')[0],
          phone: {
            area_code: areaCode,
            number: phoneNumber,
          },
        },
      };

      const mpResponse = (await payment.create({ body: mpPaymentData })) as MercadoPagoResponse;

      // 4.3 Criar registro de pagamento no banco
      // Converter o valor para centavos antes de salvar no banco de dados
      const valorEmCentavos = Math.round(payload.valorTotal * 100);

      // Extrair dados do PIX da resposta do Mercado Pago
      if (!mpResponse.point_of_interaction?.transaction_data) {
        throw new Error('Dados de transação PIX não encontrados na resposta do Mercado Pago');
      }

      const transactionData = mpResponse.point_of_interaction.transaction_data;

      // Verificar se os dados obrigatórios estão presentes
      if (!transactionData.qr_code) {
        throw new Error('QR Code do PIX não encontrado na resposta do Mercado Pago');
      }

      // Verificar se temos os dados necessários do PIX
      if (!transactionData.qr_code) {
        throw new Error('Dados do PIX incompletos: qr_code é obrigatório');
      }

      // Extrair apenas os dados essenciais do PIX
      const pixCopyPaste = transactionData.qr_code;
      const qrCodeBase64 = transactionData.qr_code_base64 || '';
      const ticket_url = transactionData.ticket_url || '';

      // Data de expiração (da resposta do Mercado Pago ou 30 minutos a partir de agora)
      // Formatamos a data para garantir que seja compatível com o validador Zod datetime
      let expiresAt: string;
      if (mpResponse.date_of_expiration) {
        // Converter a data do Mercado Pago para o formato ISO 8601 sem timezone
        const expDate = new Date(mpResponse.date_of_expiration);
        expiresAt = expDate.toISOString();
      } else {
        // Usar data atual + 30 minutos
        expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      }

      // Preparar apenas os dados essenciais do PIX para salvar no banco
      const pixData: PixData = {
        mercadoPagoId: String(mpResponse.id),
        pixCopyPaste,
        qrCodeBase64,
        ticket_url,
        expiresAt,
      };

      const paymentRecord = await tx.payment.create({
        data: {
          orderId: payload.orderId,
          method: 'pix',
          status: mpResponse.status,
          amount: valorEmCentavos, // Valor convertido para centavos (Int)
          mercadoPagoId: String(mpResponse.id), // Adicionando o ID do Mercado Pago
          rawData: pixData, // Salvando apenas os dados essenciais
        },
      });

      // Disparar evento order.created
      setTimeout(async () => {
        try {
          const webhookService = getWebhookService(prisma);
          const orderCreatedEventHandler = new OrderCreatedEventHandler(prisma);
          const orderCreatedEvent = await orderCreatedEventHandler.createEvent(payload.orderId);

          await webhookService.dispatchEvent(orderCreatedEvent);
        } catch {}
      }, 100); // Pequeno delay para garantir que a transação foi concluída

      // Preparar resposta de sucesso com todos os dados necessários
      return {
        success: true,
        message: 'Pagamento PIX criado com sucesso',
        paymentId: paymentRecord.id,
        mercadoPagoId: String(mpResponse.id),
        status: mpResponse.status,
        pixData: {
          mercadoPagoId: String(mpResponse.id),
          pixCopyPaste: pixData.pixCopyPaste,
          qrCodeBase64: pixData.qrCodeBase64,
          ticket_url: pixData.ticket_url,
          expiresAt: pixData.expiresAt,
        },
      };
    });

    // Retornar o resultado da transação com status 201 (Created)
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Erro ao processar pagamento' },
      { status: 500 },
    );
  }
}
