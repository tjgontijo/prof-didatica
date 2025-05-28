// src/hooks/usePaymentStatus.ts
'use client'

import { useEffect, useState } from 'react'

export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

interface SSEMessage {
  type: string
  status?: PaymentStatus
  updatedAt?: string
  // Adicione outros campos específicos que podem vir na mensagem
  [key: string]: string | PaymentStatus | undefined
}

export function usePaymentStatus(paymentId: string): { 
  status: PaymentStatus
  error: string | null 
  lastEventId?: string
} {
  const [status, setStatus] = useState<PaymentStatus>('pending')
  const [error, setError] = useState<string | null>(null)
  const [lastEventId, setLastEventId] = useState<string>('')

  useEffect(() => {
    if (!paymentId) {
      console.error('No paymentId provided to usePaymentStatus')
      return
    }

    let reconnectAttempts = 0
    const maxReconnectAttempts = 5
    let eventSource: EventSource | null = null
    let reconnectTimeout: NodeJS.Timeout

    const connect = () => {
      const url = `/api/payment/sse?paymentId=${encodeURIComponent(paymentId)}`
      console.log(`Connecting to SSE: ${url}`)
      eventSource = new EventSource(url)

      eventSource.onopen = () => {
        console.log('SSE connection opened')
        reconnectAttempts = 0
      }

      eventSource.onmessage = (event: MessageEvent) => {
        try {
          console.log('SSE message received:', event.data)
          
          if (event.data === ':ping') {
            console.log('SSE ping received')
            return
          }

          const data: SSEMessage = JSON.parse(event.data)
          setLastEventId(event.lastEventId || '')

          if (data.status) {
            console.log('Status updated:', data.status)
            setStatus(data.status)
            
            // Fecha a conexão se o pagamento for concluído
            if (data.status !== 'pending') {
              console.log('Payment finalized, closing SSE connection')
              eventSource?.close()
            }
          }
        } catch (err) {
          console.error('Error processing SSE message:', err)
          setError('Erro ao processar a mensagem do servidor')
        }
      }

      eventSource.onerror = (err: Event) => {
        console.error('SSE error:', err)
        eventSource?.close()
        
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
          console.log(`Reconnecting in ${delay}ms... (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`)
          
          reconnectTimeout = setTimeout(() => {
            reconnectAttempts++
            connect()
          }, delay)
        } else {
          setError('Não foi possível conectar ao servidor de atualizações')
        }
      }
    }

    connect()

    return () => {
      console.log('Cleaning up SSE connection')
      clearTimeout(reconnectTimeout)
      eventSource?.close()
    }
  }, [paymentId])

  return { status, error, lastEventId }
}