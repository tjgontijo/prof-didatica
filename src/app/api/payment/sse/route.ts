// src/app/api/events/route.ts
import { NextRequest } from 'next/server'
import { addClient }   from '@/lib/sse'

export async function GET(req: NextRequest) {
  const url       = new URL(req.url)
  const paymentId = url.searchParams.get('paymentId')
  if (!paymentId) {
    return new Response('Missing paymentId', { status: 400 })
  }

  const lastEventId = req.headers.get('Last-Event-ID') ?? undefined

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // registra o cliente SSE e dispara o ping automaticamente
      addClient(paymentId, controller, req.signal, lastEventId)
    },
    cancel() {
      // abort do signal já cuida da limpeza
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type':      'text/event-stream',
      'Cache-Control':     'no-cache',
      Connection:          'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  })
}
