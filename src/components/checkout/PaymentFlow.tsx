// src/components/checkout/PaymentFlow.tsx
'use client'

import React from 'react'
import PixDisplay from './PixDisplay'
import PaymentSuccess from './PaymentSuccess'
import { PixData } from './getPixData'
import { usePaymentStatus } from '@/hooks/usePaymentStatus'

interface PaymentFlowProps {
  pixData: PixData
  transactionId: string
  customerName: string
  orderNumber: string
  customerPhone?: string
}

export default function PaymentFlow({
  pixData,
  transactionId,
  customerName,
  orderNumber,
}: PaymentFlowProps) {
  const { status, error } = usePaymentStatus(transactionId)

  // Enquanto estiver pendente, mostra o QR Code
  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-800">
        <main className="container mx-auto py-6 px-4 max-w-[600px]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          <PixDisplay pixData={pixData} />
        </main>
      </div>
    )
  }

  // Quando for aprovado, mostra tela de sucesso
  if (status === 'approved') {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-800">
        <main className="container mx-auto py-6 px-4 max-w-[600px]">
          <PaymentSuccess
            orderNumber={orderNumber}
            customerName={customerName}
          />
        </main>
      </div>
    )
  }

  // Caso seja rejeitado ou cancelado
  const statusMessages = {
    rejected: 'O pagamento foi recusado. Por favor, tente novamente ou entre em contato com o suporte.',
    cancelled: 'O pagamento foi cancelado. Se foi um engano, você pode tentar novamente.'
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <main className="container mx-auto py-6 px-4 max-w-[600px]">
        <div className="p-6 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
          <p className="font-medium">{statusMessages[status] || 'Ocorreu um erro no processamento do pagamento.'}</p>
          <p className="mt-2 text-sm">Código do pedido: {orderNumber}</p>
        </div>
      </main>
    </div>
  )
}