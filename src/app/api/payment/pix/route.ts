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
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
    };
  };
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
      console.error('Erro de validação:', validationResult.error);
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
      console.log('Criação de pagamento PIX iniciada:', {
        orderId: payload.orderId,
        valorTotal: payload.valorTotal,
        timestamp: new Date().toISOString(),
      });
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
    console.log('Iniciando transação para pedido:', payload.orderId);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 4.1 Atualizar status do pedido para PENDING
      const updatedOrder = await tx.order.update({
        where: { id: payload.orderId },
        data: { status: 'PENDING' },
      });

      console.log('Status do pedido atualizado para PENDING:', updatedOrder.id);

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

      console.log('Criando pagamento PIX no Mercado Pago...');

      const mpResponse = (await payment.create({ body: mpPaymentData })) as MercadoPagoResponse;

      console.log('Resposta do Mercado Pago:', {
        id: mpResponse.id,
        status: mpResponse.status,
        paymentMethodId: mpResponse.payment_method_id,
      });

      // 4.3 Criar registro de pagamento no banco
      // Converter o valor para centavos antes de salvar no banco de dados
      const valorEmCentavos = Math.round(payload.valorTotal * 100);
      
      const paymentRecord = await tx.payment.create({
        data: {
          orderId: payload.orderId,
          method: 'pix',
          status: mpResponse.status,
          amount: valorEmCentavos, // Valor convertido para centavos (Int)
          mercadoPagoId: String(mpResponse.id), // Adicionando o ID do Mercado Pago
          rawData: mpResponse,
        },
      });
      
      console.log('Pagamento registrado com mercadoPagoId:', String(mpResponse.id));

      console.log('Pagamento registrado no banco:', paymentRecord.id);
      
      // Disparar evento order.created
      setTimeout(async () => {
        try {
          const webhookService = getWebhookService(prisma);
          const orderCreatedEventHandler = new OrderCreatedEventHandler(prisma);
          const orderCreatedEvent = await orderCreatedEventHandler.createEvent(payload.orderId);
          
          console.log(`Disparando webhook para order.created do pedido ${payload.orderId}`);
          const sentWebhooks = await webhookService.dispatchEvent(orderCreatedEvent);
          console.log(`Webhooks disparados: ${sentWebhooks.length}`);
        } catch (error) {
          console.error(`Erro ao disparar webhook order.created: ${error}`);
        }
      }, 100); // Pequeno delay para garantir que a transação foi concluída

      return {
        success: true,
        paymentId: paymentRecord.id,
        qrCode: mpResponse.point_of_interaction?.transaction_data?.qr_code,
        qrCodeBase64: mpResponse.point_of_interaction?.transaction_data?.qr_code_base64,
        pixCopyPaste: mpResponse.point_of_interaction?.transaction_data?.qr_code,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao processar pagamento PIX:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar pagamento' },
      { status: 500 },
    );
  }
}
