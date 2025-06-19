'use client';

import React from 'react';
import PixDisplay from './PixDisplay';
import PaymentSuccess from './PaymentSuccess';
import { PixData } from './getPixData';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import Image from 'next/image';

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

  const renderContent = () => {
    if (error) {
      return (
        <div className="p-5 bg-red-50 text-red-800 rounded-[8px] border border-red-200 shadow">
          <p className="font-medium">{error}</p>
          <p className="mt-2 text-sm">Código do pedido: {orderNumber}</p>
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
        <div className="p-5 bg-yellow-50 text-yellow-800 rounded-[8px] border border-yellow-200 shadow">
          <p className="font-medium">{statusMessages[status]}</p>
          <p className="mt-2 text-sm">Código do pedido: {orderNumber}</p>
        </div>
      );
    }

    return (
      <div className="p-5 bg-gray-50 text-gray-800 rounded-[8px] border border-gray-200 shadow">
        <p className="font-medium">Ocorreu um erro no processamento do pagamento.</p>
        <p className="mt-2 text-sm">Código do pedido: {orderNumber}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFF9F5] font-sans text-[#333]">
      {/* Header (igual ao checkout) */}
      <header className="w-full bg-[#2c4f71] h-[80px] flex items-center justify-center top-0">
        <Image
          src="/images/system/logo_transparent.webp"
          alt="Logo"
          width={80}
          height={80}
          className="h-auto w-auto max-h-[80px]"
        />
      </header>

      <main className="container mx-auto py-6 px-4 max-w-[480px]">
        <div className="bg-white rounded-[8px] p-5 w-full shadow-xl border border-gray-200 flex flex-col gap-4">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
