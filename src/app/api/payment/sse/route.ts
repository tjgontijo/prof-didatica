// pages/api/payment/sse.ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { registerSSEClient } from '@/lib/sse'

export const dynamic = 'force-dynamic'

const PaymentIdSchema = z.string().uuid()

export async function GET(req: NextRequest) {
  // 1. Extrair e validar paymentId da query
  const url = new URL(req.url)
  const rawId = url.searchParams.get('paymentId')
  const parsed = PaymentIdSchema.safeParse(rawId)
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'paymentId inválido' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
  const paymentId = parsed.data

  // 2. Criar stream de resposta SSE
  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()

  // 3. Registrar cliente no nosso gerenciador de SSE
  registerSSEClient(paymentId, writer)

  // 4. Retornar a Response streaming
  return new Response(readable, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}

