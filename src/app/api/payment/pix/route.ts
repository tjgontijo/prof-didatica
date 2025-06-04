import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { WebhookOrchestrator } from '@/services/webhook';
import { paymentRateLimit } from '@/lib/rate-limit';

// Schemas de validação com Zod
const itemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  unit_price: z.number().positive(),
  quantity: z.number().int().positive().max(10),
  picture_url: z.string().url().optional(),
});

const clienteSchema = z.object({
  nome: z.string().min(2).max(100),
  email: z.string().email(),
  telefone: z.string().regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos'),
});

const dadosPedidoSchema = z.object({
  items: z.array(itemSchema).min(1).max(20),
  cliente: clienteSchema,
  valorTotal: z.number().positive(),
  checkoutId: z.string().uuid(),
  orderId: z.string().uuid(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Verificar rate limiting
    const rateLimitResult = await paymentRateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Muitas tentativas de pagamento. Aguarde alguns minutos.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
          }
        }
      );
    }

    // Validar dados recebidos com Zod
    const dados = dadosPedidoSchema.parse(await request.json());

    // Log apenas em desenvolvimento (sem dados sensíveis)
    if (process.env.NODE_ENV === 'development') {
      console.log('Criação de pagamento PIX iniciada:', { 
        orderId: dados.orderId, 
        valorTotal: dados.valorTotal,
        timestamp: new Date().toISOString()
      });
    }

    // Verificar se o pedido existe e está no status correto
    const order = await prisma.order.findUnique({
      where: { id: dados.orderId },
      include: {
        customer: true,
        orderItems: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    if (order.status !== 'DRAFT') {
      return NextResponse.json(
        { success: false, error: 'Pedido não está mais disponível para pagamento' },
        { status: 400 }
      );
    }

    // Usar transação para garantir consistência
    await prisma.$transaction(async (tx) => {
      // Verificar se há novos itens (order bumps) para adicionar
      const existingItemIds = order.orderItems.map((item) => item.productId);
      const newItems = dados.items.filter(
        (item) => !existingItemIds.includes(item.id) && item.id !== order.productId,
      );

      // Criar novos OrderItems para os order bumps selecionados
      if (newItems.length > 0) {
        await Promise.all(
          newItems.map((item) =>
            tx.orderItem.create({
              data: {
                orderId: dados.orderId,
                productId: item.id,
                quantity: item.quantity,
                priceAtTime: item.unit_price,
                isOrderBump: true,
                isUpsell: false,
              },
            }),
          ),
        );
      }

      // Atualizar o status da ordem para PENDING_PAYMENT
      await tx.order.update({
        where: { id: dados.orderId },
        data: {
          status: 'PENDING_PAYMENT',
          statusUpdatedAt: new Date(),
          paidAmount: 0,
        },
      });

      // Registrar a mudança de status na tabela de histórico
      await tx.orderStatusHistory.create({
        data: {
          orderId: dados.orderId,
          previousStatus: order.status,
          newStatus: 'PENDING_PAYMENT',
          notes: 'Iniciado processo de pagamento PIX',
        },
      });
    });

    // Cancelar cart reminder usando nova API
    const orchestrator = new WebhookOrchestrator(prisma);
    
    // Buscar e cancelar cart reminder ativo
    const activeCartReminder = await prisma.webhookJob.findFirst({
      where: {
        orderId: dados.orderId,
        jobType: 'cart_reminder',
        status: 'active',
      },
    });

    if (activeCartReminder) {
      await orchestrator.cancelCartReminder(activeCartReminder.jobId);
      
      // Marcar como cancelado na tabela
      await prisma.webhookJob.update({
        where: { id: activeCartReminder.id },
        data: { 
          status: 'cancelled',
          completedAt: new Date(),
        },
      });
      
      console.log(`Cart reminder cancelado para pedido ${dados.orderId}`);
    }

    // Disparar evento order.created agora que o payment foi iniciado
    await orchestrator.processOrderCreated(dados.orderId);
    console.log(`Evento order.created disparado para pedido ${dados.orderId}`);

    // Configurar o Mercado Pago
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Configuração de pagamento indisponível' },
        { status: 503 }
      );
    }

    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);

    // Preparar dados do telefone
    const telefone = dados.cliente.telefone.replace(/\D/g, '');
    const areaCode = telefone.length === 11 ? telefone.substring(0, 2) : '11';
    const phoneNumber = telefone.length === 11 ? telefone.substring(2) : telefone;

    // Criar o pagamento PIX
    const resultado = await payment.create({
      body: {
        transaction_amount: dados.valorTotal,
        description: `Pedido ${dados.orderId}`,
        payment_method_id: 'pix',
        payer: {
          email: dados.cliente.email,
          first_name: dados.cliente.nome.split(' ')[0],
          last_name: dados.cliente.nome.split(' ').slice(1).join(' ') || dados.cliente.nome.split(' ')[0],
          phone: {
            area_code: areaCode,
            number: phoneNumber,
          },
        },
        additional_info: {
          items: dados.items.map(item => ({
            id: item.id,
            title: item.title,
            description: item.title,
            picture_url: item.picture_url,
            category_id: 'digital_goods',
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
          payer: {
            first_name: dados.cliente.nome.split(' ')[0],
            last_name: dados.cliente.nome.split(' ').slice(1).join(' ') || dados.cliente.nome.split(' ')[0],
            phone: {
              area_code: areaCode,
              number: phoneNumber,
            },
          },
        },
        external_reference: dados.orderId,
      },
    });

    // Salvar o pagamento no banco de dados
    const paymentData = await prisma.payment.create({
      data: {
        orderId: dados.orderId,
        mercadoPagoId: String(resultado.id),
        amount: dados.valorTotal,
        method: 'pix',
        status: resultado.status || 'pending',
        rawData: {
          qrCode: resultado.point_of_interaction?.transaction_data?.qr_code,
          qrCodeBase64: resultado.point_of_interaction?.transaction_data?.qr_code_base64,
          pixCopyPaste: resultado.point_of_interaction?.transaction_data?.qr_code,
          expiresAt: resultado.date_of_expiration,
          mercadoPagoResponse: JSON.parse(JSON.stringify(resultado)),
        },
      },
    });

    console.log(`Pagamento PIX criado: ${paymentData.id}`);

    // Extrair dados do rawData para resposta
    const pixData = paymentData.rawData as Record<string, unknown>;

    // Retornar resposta com dados do PIX
    return NextResponse.json({
      success: true,
      paymentId: paymentData.id,
      mercadoPagoId: resultado.id,
      status: resultado.status,
      qrCode: pixData.qrCode,
      qrCodeBase64: pixData.qrCodeBase64,
      pixCopyPaste: pixData.pixCopyPaste,
      expiresAt: pixData.expiresAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.errors },
        { status: 422 }
      );
    }

    console.error('Erro ao processar pagamento PIX:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
