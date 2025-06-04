// app/api/payment/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment as MPayment } from 'mercadopago'
import { prisma } from '@/lib/prisma'
import { broadcastSSE } from '@/lib/sse'
import { WebhookOrchestrator } from '@/services/webhook'
import { webhookRateLimit } from '@/lib/rate-limit'
import crypto from 'crypto'

// Função para validar assinatura do webhook
function validateWebhookSignature(
  body: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) {
    return false
  }

  try {
    // Mercado Pago usa HMAC-SHA256
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')
    
    // Remove prefixos como "sha256=" se existirem
    const cleanSignature = signature.replace(/^sha256=/, '')
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(cleanSignature, 'hex')
    )
  } catch (error) {
    console.error('Erro ao validar assinatura do webhook:', error)
    return false
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Verificar rate limiting
    const rateLimitResult = await webhookRateLimit(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
          }
        }
      )
    }

    // 2. Extrair assinatura e validar
    const signature = request.headers.get('x-signature') || request.headers.get('x-hook-secret')
    const bodyText = await request.text()
    
    // Validar assinatura se configurada
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET
    if (webhookSecret) {
      const isValidSignature = validateWebhookSignature(bodyText, signature, webhookSecret)
      if (!isValidSignature) {
        console.error('Assinatura do webhook inválida')
        return NextResponse.json(
          { success: false, error: 'Assinatura inválida' },
          { status: 401 }
        )
      }
    } else {
      console.warn('MERCADOPAGO_WEBHOOK_SECRET não configurado - webhook sem validação')
    }

    const body = JSON.parse(bodyText)

    // Log apenas em desenvolvimento (sem dados sensíveis)
    if (process.env.NODE_ENV === 'development') {
      console.log('Webhook Mercado Pago recebido:', {
        action: body.action,
        paymentId: body.data?.id,
        timestamp: new Date().toISOString()
      })
    }

    // 2. Processa somente created/updated
    if (body.action === 'payment.created' || body.action === 'payment.updated') {
      const paymentId = body.data.id

      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
      })
      const paymentClient = new MPayment(client)
      const paymentInfo = await paymentClient.get({ id: paymentId })

      const status = paymentInfo.status
      const paymentMethodId = paymentInfo.payment_method_id

      console.log(`Pagamento ${paymentId} com status: ${status}`)

      // 3. Verificar idempotência - evitar reprocessamento
      const webhookId = request.headers.get('x-request-id') || `mp-${paymentId}-${body.action}-${Date.now()}`
      
      // Verificar se já processamos este webhook
      const existingWebhook = await prisma.externalWebhookLog.findUnique({
        where: { webhookId }
      }).catch(() => null)

      if (existingWebhook) {
        console.log(`Webhook ${webhookId} já foi processado anteriormente`)
        return NextResponse.json({ success: true, message: 'Already processed' })
      }

      // 4. Registrar webhook recebido (mesmo se falhar depois)
      const webhookLogData = {
        webhookId,
        source: 'mercadopago',
        paymentId: String(paymentId),
        action: body.action,
        payload: JSON.stringify(body),
        headers: JSON.stringify({
          'x-signature': signature,
          'user-agent': request.headers.get('user-agent'),
          'content-type': request.headers.get('content-type')
        })
      }

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
      })

      if (!payment) {
        // Registrar webhook mesmo se pagamento não encontrado
        await prisma.externalWebhookLog.create({
          data: {
            ...webhookLogData,
            success: false,
            errorMsg: 'Pagamento não encontrado no banco de dados'
          }
        })

        console.log(
          `[WEBHOOK] Pagamento com ID ${paymentId} não encontrado no banco de dados. Webhook será ignorado, mas retornando 200 para Mercado Pago.`
        )
        return NextResponse.json({ success: true })
      }

      // 6. Verificar se pagamento já foi processado (status final)
      if (payment.status === 'approved' && status === 'approved') {
        // Registrar webhook duplicado
        await prisma.externalWebhookLog.create({
          data: {
            ...webhookLogData,
            status: status,
            success: true,
            errorMsg: 'Pagamento já estava aprovado - webhook duplicado'
          }
        })

        console.log(`Pagamento ${paymentId} já estava aprovado. Ignorando webhook duplicado.`)
        return NextResponse.json({ success: true, message: 'Payment already approved' })
      }

      // 7. Usar transação para garantir consistência
      await prisma.$transaction(async (tx) => {
        // Capturar status atual pra histórico
        const currentOrderStatus = payment.order?.status || 'PAYMENT_PROCESSING'

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
        })

        // Se aprovado, atualizar pedido e histórico
        if (status === 'approved' && (paymentMethodId === 'pix' || true)) {
          await tx.order.update({
            where: { id: payment.orderId },
            data: {
              status: 'PAID',
              statusUpdatedAt: new Date(),
              paidAmount: paymentInfo.transaction_amount,
            },
          })
          await tx.orderStatusHistory.create({
            data: {
              orderId: payment.orderId,
              previousStatus: currentOrderStatus,
              newStatus: 'PAID',
              notes: `Pagamento confirmado via webhook do Mercado Pago (método: ${paymentMethodId})`,
            },
          })
          console.log(`Pedido ${payment.orderId} marcado como PAGO`)
        } else if (status === 'rejected') {
          await tx.order.update({
            where: { id: payment.orderId },
            data: {
              status: 'CANCELLED',
              statusUpdatedAt: new Date(),
            },
          })
          await tx.orderStatusHistory.create({
            data: {
              orderId: payment.orderId,
              previousStatus: currentOrderStatus,
              newStatus: 'CANCELLED',
              notes: `Pagamento rejeitado pelo Mercado Pago (método: ${paymentMethodId})`,
            },
          })
          console.log(
            `Pedido ${payment.orderId} cancelado devido a pagamento rejeitado`
          )
        }

        // Registrar webhook com sucesso
        await tx.externalWebhookLog.create({
          data: {
            ...webhookLogData,
            status: status,
            success: true,
          }
        })
      })

      // 8. Broadcast SSE para quem estiver conectado
      console.log('[WEBHOOK] Disparando SSE para payment.id:', payment.id, 'status:', status)
      broadcastSSE(payment.id, status)

      // 9. Disparar webhooks do nosso sistema se pagamento aprovado
      if (status === 'approved') {
        try {
          const orchestrator = new WebhookOrchestrator(prisma)
          
          // Cancelar cart reminder se existir
          const activeCartReminder = await prisma.webhookJob.findFirst({
            where: {
              orderId: payment.orderId,
              jobType: 'cart_reminder',
              status: 'active',
            },
          });

          if (activeCartReminder) {
            await orchestrator.cancelCartReminder(activeCartReminder.jobId);
            
            // Marcar como cancelado
            await prisma.webhookJob.update({
              where: { id: activeCartReminder.id },
              data: { 
                status: 'cancelled',
                completedAt: new Date(),
              },
            });
          }

          // Disparar evento order.paid
          await orchestrator.processOrderPaid(payment.orderId);
          
          console.log(`Webhook order.paid disparado para pedido ${payment.orderId}`);
        } catch (webhookError) {
          console.error('Erro ao disparar webhooks internos:', webhookError)
          // Não falhar o webhook principal por erro nos webhooks internos
        }
      }

      return NextResponse.json({ success: true })
    }

    // Ações não relacionadas continuam retornando OK
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao processar webhook do Mercado Pago:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
