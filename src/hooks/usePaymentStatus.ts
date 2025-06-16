// usePaymentStatus.ts
'use client';

import { useState, useEffect, useRef } from 'react';

// ————— Zod Type —————
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

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
          const data = JSON.parse(e.data);
          const newStatus = data.status;
          setStatus(newStatus);

          // Se for estado final, fecha conexão e marca conclusão
          if (newStatus !== 'pending') {
            es?.close();
            didFinish = true;
          }
        } catch {
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
