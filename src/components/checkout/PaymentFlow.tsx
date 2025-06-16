// src/components/checkout/PaymentFlow.tsx
'use client';

import React from 'react';
import PixDisplay from './PixDisplay';
import PaymentSuccess from './PaymentSuccess';
import { PixData } from './getPixData';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';

interface PaymentFlowProps {
  pixData: PixData;
  transactionId: string;
  customerName: string;
  orderNumber: string;
}

export default function PaymentFlow({
  pixData,
  transactionId,
  customerName,
  orderNumber,
}: PaymentFlowProps) {

  
  const { status, error } = usePaymentStatus(transactionId);

  const statusMessages: Record<'rejected' | 'cancelled', string> = {
    rejected:
      'O pagamento foi recusado. Por favor, tente novamente ou entre em contato com o suporte.',
    cancelled: 'O pagamento foi cancelado. Se foi um engano, você pode tentar novamente.',
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-800">
        <main className="container mx-auto py-6 px-4 max-w-[600px]">
          <div className="p-6 bg-red-50 text-red-800 rounded-lg border border-red-200">
            <p className="font-medium">{error}</p>
            <p className="mt-2 text-sm">Código do pedido: {orderNumber}</p>
          </div>
        </main>
      </div>
    );
  }

  if (status === 'approved') {
    return <PaymentSuccess orderNumber={orderNumber} customerName={customerName} />;
  }

  if (status === 'pending') {
    return <PixDisplay pixData={pixData} />;
  }

  if (status === 'rejected' || status === 'cancelled') {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-800">
        <main className="container mx-auto py-6 px-4 max-w-[600px]">
          <div className="p-6 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
            <p className="font-medium">{statusMessages[status]}</p>
            <p className="mt-2 text-sm">Código do pedido: {orderNumber}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <main className="container mx-auto py-6 px-4 max-w-[600px]">
        <div className="p-6 bg-gray-50 text-gray-800 rounded-lg border border-gray-200">
          <p className="font-medium">Ocorreu um erro no processamento do pagamento.</p>
          <p className="mt-2 text-sm">Código do pedido: {orderNumber}</p>
        </div>
      </main>
    </div>
  );
}
