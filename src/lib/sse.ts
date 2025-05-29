// src/lib/sse.ts
import { z } from 'zod'

/**
 * Schemas Zod para validar IDs e status
 */
const PaymentIdSchema = z.string().uuid()
export type PaymentId = z.infer<typeof PaymentIdSchema>

const PaymentStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'cancelled',
])
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>

/**
 * Cada conexão SSE agora é um writer + timer de keep-alive
 */
interface SSEConnection {
  paymentId: PaymentId
  writer: WritableStreamDefaultWriter<Uint8Array>
  keepAliveTimer: ReturnType<typeof setInterval>
}

/**
 * Mapa em memória de paymentId → conexões SSE
 */
const connections = new Map<PaymentId, Set<SSEConnection>>()

/**
 * Registra uma nova conexão SSE para um dado paymentId
 */
export function registerSSEClient(
  rawPaymentId: unknown,
  writer: WritableStreamDefaultWriter<Uint8Array>
) {
  const paymentId = PaymentIdSchema.parse(rawPaymentId)

  // Headers e formatação já foram tratados no route; aqui só guardamos o writer
  const encoder = new TextEncoder()

  // Monta o objeto de conexão
  const keepAliveTimer = globalThis.setInterval(() => {
    // ping para manter a conexão viva
    writer.write(encoder.encode(`: ping\n\n`))
  }, 30_000)

  const conn: SSEConnection = { paymentId, writer, keepAliveTimer }
  if (!connections.has(paymentId)) {
    connections.set(paymentId, new Set())
  }
  connections.get(paymentId)!.add(conn)

  // Remoção automática quando o client fecha a stream
  writer.closed
    .catch(() => {
      /* swallow error */
    })
    .finally(() => {
      clearInterval(keepAliveTimer)
      removeClient(paymentId, conn)
    })
}

/**
 * Envia um evento de status para todos os clients daquele paymentId
 */
export function broadcastSSE(
  rawPaymentId: unknown,
  rawStatus: unknown
) {
  const paymentId = PaymentIdSchema.parse(rawPaymentId)
  const status = PaymentStatusSchema.parse(rawStatus)
  const conns = connections.get(paymentId)
  if (!conns) {
    console.log('[SSE] Nenhum cliente SSE registrado para paymentId:', paymentId)
    return
  }

  console.log('[SSE] Enviando evento SSE para paymentId:', paymentId, 'status:', status, 'total de conexões:', conns.size)

  const encoder = new TextEncoder()
  const payload = JSON.stringify({ status })
  const message = encoder.encode(
    `event: status\n` +
    `data: ${payload}\n\n`
  )

  for (const conn of conns) {
    console.log('[SSE] Enviando evento para cliente SSE de paymentId:', paymentId)
    conn.writer.write(message).catch(() => {
      // falha ao escrever, remove a conexão
      clearInterval(conn.keepAliveTimer)
      removeClient(paymentId, conn)
    })

    // se for estado final, fecha o writer
    if (status !== 'pending') {
      conn.writer.close().catch(() => {})
      clearInterval(conn.keepAliveTimer)
      conns.delete(conn)
    }
  }

  if (conns.size === 0) {
    connections.delete(paymentId)
  }
}

/**
 * Remove uma conexão específica
 */
function removeClient(paymentId: PaymentId, conn: SSEConnection) {
  const conns = connections.get(paymentId)
  if (!conns) return
  conns.delete(conn)
  if (conns.size === 0) {
    connections.delete(paymentId)
  }
}
