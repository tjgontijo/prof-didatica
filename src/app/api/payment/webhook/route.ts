// app/api/payment/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment as MPayment } from 'mercadopago'
import { prisma } from '@/lib/prisma'
import { broadcastSSE } from '@/lib/sse'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Extrai assinatura e logs de headers
    const signature =
      request.headers.get('x-signature') ||
      request.headers.get('x-hook-secret')
    const allHeaders = Object.fromEntries(request.headers.entries())

    const body = await request.json()

    console.log('--- Webhook Mercado Pago Recebido ---')
    console.log('Headers:', allHeaders)
    console.log('Assinatura recebida:', signature)
    console.log('Body:', JSON.stringify(body, null, 2))
    console.log('-------------------------------------')

    // 2. Processa somente created/updated
    if (body.action === 'payment.created' || body.action === 'payment.updated') {
      const paymentId = body.data.id

      console.log(
        'process.env.MERCADOPAGO_ACCESS_TOKEN:',
        process.env.MERCADOPAGO_ACCESS_TOKEN
      )
      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
      })
      const paymentClient = new MPayment(client)
      const paymentInfo = await paymentClient.get({ id: paymentId })

      const status = paymentInfo.status
      const externalReference = paymentInfo.external_reference
      const paymentMethodId = paymentInfo.payment_method_id

      console.log(`Pagamento ${paymentId} com status: ${status}`)
      console.log(`Referência externa: ${externalReference}`)
      console.log(`Método de pagamento: ${paymentMethodId}`)

      // 3. Buscar o pagamento existente no DB
      // Garantir que a busca seja sempre por string, independente do tipo recebido
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
        console.log(
          `[WEBHOOK] Pagamento com ID ${paymentId} não encontrado no banco de dados. Webhook será ignorado, mas retornando 200 para Mercado Pago.`
        )
        return NextResponse.json({ success: true })
      }

      // 4. Capturar status atual pra histórico
      const currentOrderStatus =
        payment.order?.status || 'PAYMENT_PROCESSING'

      // 5. Atualizar o registro de pagamento
      const updatedPayment = await prisma.payment.update({
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

      // 6. Broadcast SSE para quem estiver conectado
      console.log('[WEBHOOK] Disparando SSE para payment.id:', updatedPayment.id, 'status:', updatedPayment.status)
      broadcastSSE(updatedPayment.id, updatedPayment.status)
      console.log('[WEBHOOK] Evento SSE enviado para payment.id:', updatedPayment.id)

      // 7. Se aprovado, atualizar pedido e histórico
      if (status === 'approved' && (paymentMethodId === 'pix' || true)) {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            status: 'PAID',
            statusUpdatedAt: new Date(),
            paidAmount: paymentInfo.transaction_amount,
          },
        })
        await prisma.orderStatusHistory.create({
          data: {
            orderId: payment.orderId,
            previousStatus: currentOrderStatus,
            newStatus: 'PAID',
            notes: `Pagamento confirmado via webhook do Mercado Pago (método: ${paymentMethodId})`,
          },
        })
        console.log(`Pedido ${payment.orderId} marcado como PAGO`)
      } else if (status === 'rejected') {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            status: 'CANCELLED',
            statusUpdatedAt: new Date(),
          },
        })
        await prisma.orderStatusHistory.create({
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
