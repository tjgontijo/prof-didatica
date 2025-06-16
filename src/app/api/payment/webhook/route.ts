// app/api/payment/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment as MPayment } from 'mercadopago';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { broadcastSSE } from '@/lib/sse';

import { webhookRateLimit } from '@/lib/rate-limit';
import { getWebhookService } from '@/services/webhook';
import { OrderPaidEventHandler } from '@/services/webhook/events/order-paid.event';


export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Verificar rate limiting
    const rateLimitResult = await webhookRateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
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

    // 2. Extrair o corpo da requisição
    const bodyText = await request.text();
    
    // Validação de assinatura removida para simplificar o MVP


    const body = JSON.parse(bodyText);

    // 2. Processa somente created/updated
    if (body.action === 'payment.created' || body.action === 'payment.updated') {
      const paymentId = body.data.id;

      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
      });
      const paymentClient = new MPayment(client);
      const paymentInfo = await paymentClient.get({ id: paymentId });

      const status = paymentInfo.status;
      const paymentMethodId = paymentInfo.payment_method_id;



      // 3. Verificar idempotência - evitar reprocessamento
      const webhookId =
        request.headers.get('x-request-id') || `mp-${paymentId}-${body.action}-${Date.now()}`;

      // Verificar se já processamos este webhook
      const existingWebhook = await prisma.externalWebhookLog
        .findUnique({
          where: { webhookId },
        })
        .catch(() => null);

      if (existingWebhook) {

        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      // 4. Registrar webhook recebido (mesmo se falhar depois)
      const webhookLogData = {
        webhookId,
        source: 'mercadopago',
        paymentId: String(paymentId),
        action: body.action,
        payload: JSON.stringify(body),
        headers: JSON.stringify({
          'user-agent': request.headers.get('user-agent'),
          'content-type': request.headers.get('content-type'),
        }),
      };

      // 5. Buscar o pagamento existente no DB
      const payment = await prisma.payment.findFirst({
        where: { mercadoPagoId: String(paymentId) },
        include: {
          order: {
            include: {
              checkout: true,
            },
          },
        },
      });

      if (!payment) {
        // Registrar webhook mesmo se pagamento não encontrado
        await prisma.externalWebhookLog.create({
          data: {
            ...webhookLogData,
            success: false,
            errorMsg: 'Pagamento não encontrado no banco de dados',
          },
        });

        return NextResponse.json({ success: true });
      }

      // 6. Verificar se pagamento já foi processado (status final)
      if (payment.status === 'approved' && status === 'approved') {
        // Registrar webhook duplicado
        await prisma.externalWebhookLog.create({
          data: {
            ...webhookLogData,
            status: status,
            success: true,
            errorMsg: 'Pagamento já estava aprovado - webhook duplicado',
          },
        });


        return NextResponse.json({ success: true, message: 'Payment already approved' });
      }

      // 7. Usar transação para garantir consistência
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Capturar status atual pra histórico
        const currentOrderStatus = payment.order?.status || 'PENDING';

        // Atualizar o registro de pagamento
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: status,
            paidAt:
              status === 'approved' && paymentInfo.date_approved
                ? new Date(paymentInfo.date_approved)
                : status === 'approved'
                  ? new Date()
                  : undefined,
          },
        });

        // Se aprovado, atualizar pedido e histórico
        if (status === 'approved' && (paymentMethodId === 'pix' || true)) {
          await tx.order.update({
            where: { id: payment.orderId },
            data: {
              status: 'PAID',
              statusUpdatedAt: new Date(),
              paidAmount: paymentInfo.transaction_amount,
            },
          });
          await tx.orderStatusHistory.create({
            data: {
              orderId: payment.orderId,
              previousStatus: currentOrderStatus,
              newStatus: 'PAID',
              notes: `Pagamento confirmado via webhook do Mercado Pago (método: ${paymentMethodId})`,
            },
          });

          // Disparar webhook para order.paid após a transação
          setTimeout(async () => {
            try {
              const webhookService = getWebhookService(prisma);
              const orderPaidEventHandler = new OrderPaidEventHandler(prisma);
              const orderPaidEvent = await orderPaidEventHandler.createEvent(payment.orderId);
              await webhookService.dispatchEvent(orderPaidEvent);

            } catch (error) {
              console.error(`Erro ao disparar webhook order.paid: ${error}`);
            }
          }, 100); // Pequeno delay para garantir que a transação foi concluída
        } else if (status === 'rejected') {
          await tx.order.update({
            where: { id: payment.orderId },
            data: {
              status: 'CANCELLED',
              statusUpdatedAt: new Date(),
            },
          });
          await tx.orderStatusHistory.create({
            data: {
              orderId: payment.orderId,
              previousStatus: currentOrderStatus,
              newStatus: 'CANCELLED',
              notes: `Pagamento rejeitado pelo Mercado Pago (método: ${paymentMethodId})`,
            },
          });

        }

        // Registrar webhook com sucesso
        await tx.externalWebhookLog.create({
          data: {
            ...webhookLogData,
            status: status,
            success: true,
          },
        });
      });

      // 8. Broadcast SSE para quem estiver conectado

      broadcastSSE(payment.id, status);

      // Pagamento processado com sucesso


      return NextResponse.json({ success: true });
    }

    // Ações não relacionadas continuam retornando OK
    return NextResponse.json({ success: true });
  } catch (error) {

    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
