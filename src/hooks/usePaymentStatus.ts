// usePaymentStatus.ts
'use client';

import { useState, useEffect, useRef } from 'react';
import { z } from 'zod';

// ————— Zod Schema & Type —————
const PaymentStatusSchema = z.enum(['pending', 'approved', 'rejected', 'cancelled']);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

// ————— Hook Implementation —————
export function usePaymentStatus(transactionId: string) {
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 5;

  useEffect(() => {
    if (!transactionId) {
      setError('transactionId inválido');
      return;
    }

    let didFinish = false;
    let es: EventSource | null = null;

    const connect = () => {
      // Abre conexão SSE
      es = new EventSource(`/api/payment/sse?paymentId=${encodeURIComponent(transactionId)}`);

      // Listener para eventos de status
      es.addEventListener('status', (e) => {
        try {
          const payload = JSON.parse(e.data);
          console.log('[FRONTEND][SSE] Evento SSE recebido:', payload);
          const newStatus = PaymentStatusSchema.parse(payload.status);
          setStatus(newStatus);
          console.log('[FRONTEND][SSE] Novo status do pagamento:', newStatus);

          // Se for estado final, fecha conexão e marca conclusão
          if (newStatus !== 'pending') {
            es?.close();
            didFinish = true;
          }
        } catch (err) {
          console.error('Falha na validação do payload SSE:', err);
          setError('Resposta inválida do servidor');
          es?.close();
          didFinish = true;
        }
      });

      // Tratamento de erro / reconexão
      es.onerror = () => {
        es?.close();

        // Se já chegou num estado final, não reconectar
        if (didFinish) return;

        retryCountRef.current += 1;
        if (retryCountRef.current <= maxRetries) {
          // Exponential backoff: 1s, 2s, 4s, ...
          const delay = 1000 * 2 ** (retryCountRef.current - 1);
          setTimeout(connect, delay);
        } else {
          setError('Não foi possível conectar ao servidor de atualizações');
        }
      };
    };

    // Inicia a conexão SSE
    connect();

    // Cleanup ao desmontar componente ou mudar transactionId
    return () => {
      es?.close();
      retryCountRef.current = 0;
    };
  }, [transactionId]); // Apenas reconecta quando transactionId muda

  return { status, error };
}
