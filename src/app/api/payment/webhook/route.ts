// app/api/payment/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { MercadoPagoConfig, Payment as MPayment } from 'mercadopago'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { broadcastSSE } from '@/lib/sse'
import { webhookRateLimit } from '@/lib/rate-limit'
import { getWebhookService } from '@/modules/webhook'
import { OrderPaidEventHandler } from '@/modules/webhook/events/order-paid.event'

// 1) validação do payload do Mercado Pago
const WebhookSchema = z.object({
  action: z.enum(['payment.created', 'payment.updated']),
  data: z.object({
    id: z.union([z.string(), z.number()]).transform(v => String(v)),
  }),
})
type WebhookPayload = z.infer<typeof WebhookSchema>

// 2) helpers de resposta
function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status })
}
function handleError(e: unknown) {
  const msg = e instanceof Error ? e.message : 'Erro interno'
  return json({ success: false, error: msg }, 500)
}

// 3) endpoint de webhook
export async function POST(request: NextRequest) {
  try {
    // rate limit
    const rl = await webhookRateLimit(request)
    if (!rl.success) {
      return json({ success: false, error: 'rate limit exceeded' }, 429)
    }

    // ler e validar corpo
    const rawText = await request.text()
    const raw = JSON.parse(rawText)
    const { action, data: { id: paymentId } }: WebhookPayload = WebhookSchema.parse(raw)

    // só processa created ou updated
    if (action !== 'payment.created' && action !== 'payment.updated') {
      return json({ success: true })
    }

    // idempotência
    const webhookId = request.headers.get('x-request-id') || `mp-${paymentId}-${action}`
    const seen = await prisma.externalWebhookLog.findUnique({
      where: { webhookId },
    }).catch(() => null)
    if (seen) {
      return json({ success: true, message: 'já processado' })
    }

    // base para criar log
    const logBase = {
      webhookId,
      source: 'mercadopago',
      paymentId,
      action,
      payload: rawText,
      headers: JSON.stringify({
        'user-agent': request.headers.get('user-agent'),
        'content-type': request.headers.get('content-type'),
      }),
    }

    // buscar pagamento no nosso banco
    const payment = await prisma.payment.findFirst({
      where: { mercadoPagoId: paymentId },
      include: {
        order: {
          include: {
            customer: true,
            trackingSession: true,
            orderItems: true,
          },
        },
      },
    })
    if (!payment) {
      await prisma.externalWebhookLog.create({
        data: { ...logBase, success: false, errorMsg: 'pagamento não encontrado' },
      })
      return json({ success: true })
    }

    // transação: atualiza payment, order, histórico e registra log
    const { status: finalStatus } = await prisma.$transaction<{ status: string }>(
      async (tx: Prisma.TransactionClient) => {
        // reconectar com Mercado Pago
        const client = new MercadoPagoConfig({
          accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
        })
        const mp = new MPayment(client)
        const info = await mp.get({ id: paymentId })

        if (!info.status) throw new Error('status ausente no retorno do MP')

        const status = info.status
        const amount = info.transaction_amount
        const dateApproved = info.date_approved

        // atualiza payment
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status,
            paidAt:
              status === 'approved'
                ? dateApproved
                  ? new Date(dateApproved)
                  : new Date()
                : undefined,
          },
        })

        // se aprovado, atualiza order e histórico
        if (status === 'approved') {
          const prev = payment.order?.status || 'PENDING'
          await tx.order.update({
            where: { id: payment.orderId },
            data: {
              status: 'PAID',
              paidAmount: amount,
              statusUpdatedAt: new Date(),
            },
          })
          await tx.orderStatusHistory.create({
            data: {
              orderId: payment.orderId,
              previousStatus: prev,
              newStatus: 'PAID',
              notes: 'pagamento aprovado via PIX',
            },
          })
        }

        // registra webhook
        await tx.externalWebhookLog.create({
          data: { ...logBase, status, success: true },
        })

        return { status }
      }
    )

    // Gerar eventId consistente para o evento Purchase
    const eventId = `purchase_${paymentId}`
    
    // SSE com eventId para o frontend
    const map: Record<string, 'approved' | 'pending' | 'cancelled'> = {
      approved: 'approved',
      rejected: 'cancelled',
      in_process: 'pending',
      in_mediation: 'pending',
      cancelled: 'cancelled'
    }
    broadcastSSE(payment.id, map[finalStatus] ?? 'pending', { eventId })

    // disparar evento Purchase pro Meta Ads
    if (finalStatus === 'approved' && payment.order?.trackingSession?.sessionId) {
      const sessionId = payment.order.trackingSession.sessionId
      const payload = {
        trackingSessionId: sessionId,
        eventName: 'Purchase',
        eventId,
        customData: {
          value: payment.order.paidAmount,
          currency: 'BRL',
          content_ids: payment.order.orderItems.map(i => i.productId),
          content_type: 'product',
          contents: payment.order.orderItems.map(i => ({
            id: i.productId,
            quantity: i.quantity,
            item_price: i.priceAtTime,
          })),
          order_id: payment.order.id,
          num_items: payment.order.orderItems.length,
        },
        customer: {
          email: payment.order.customer.email,
          phone: payment.order.customer.phone,
          firstName: payment.order.customer.name.split(' ')[0],
          lastName: payment.order.customer.name.split(' ').slice(1).join(' '),
        },
      }

      await fetch(
        `${process.env.APP_URL || 'http://localhost:3000'}/api/tracking/event`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payload }),
        }
      )
    }

    // disparar webhook interno order.paid
    setTimeout(async () => {
      try {
        const svc = getWebhookService(prisma)
        const handler = new OrderPaidEventHandler(prisma)
        const evt = await handler.createEvent(payment.orderId)
        await svc.dispatchEvent(evt)
      } catch {
        // sem erro visível
      }
    }, 100)

    return json({ success: true })
  } catch (e) {
    return handleError(e)
  }
}
