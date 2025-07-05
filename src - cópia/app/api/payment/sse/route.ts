import { NextRequest } from 'next/server';
import { z } from 'zod';
import { registerSSEClient } from '@/lib/sse';
import { webhookRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// Aceitar qualquer string como ID de pagamento, já que o MercadoPago usa IDs numéricos
const PaymentIdSchema = z.string().min(1, 'ID de pagamento não pode estar vazio');

export async function GET(req: NextRequest) {
  try {
    // 1. Rate limiting para SSE connections
    const rateLimitResult = await webhookRateLimit(req);
    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Muitas conexões. Tente novamente em alguns minutos.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        },
      );
    }

    // 2. Extrair e validar paymentId da query
    const url = new URL(req.url);
    const rawId = url.searchParams.get('paymentId');

    if (!rawId) {
      return new Response(JSON.stringify({ error: 'paymentId é obrigatório' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const parsed = PaymentIdSchema.safeParse(rawId);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: 'paymentId inválido',
          details: parsed.error.errors,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
    const paymentId = parsed.data;

    // 3. Criar stream de resposta SSE
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // 4. Registrar cliente no nosso gerenciador de SSE
    registerSSEClient(paymentId, writer);

    // 5. Retornar a Response streaming
    return new Response(readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  } catch (error) {
    console.error('Erro ao estabelecer conexão SSE:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
