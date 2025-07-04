'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { FaCheckCircle, FaWhatsapp } from 'react-icons/fa';
import Image from 'next/image';
import { usePurchase } from '@/modules/tracking/hooks/usePurchase';

interface PaymentSuccessProps {
  orderNumber: string;
  customerName: string;
  accessLink?: string;
  whatsappLink?: string;
  // Dados necessários para o evento Purchase
  transactionId: string;
  orderValue?: number;
  products?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
  }>;
  customerEmail?: string;
  customerPhone?: string;
  eventId?: string;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  orderNumber,
  customerName,
  transactionId,
  orderValue = 0,
  products = [],
  customerEmail,
  customerPhone,
  eventId,
}) => {
  const firstName = customerName.split(' ')[0];
  const purchase = usePurchase();
  
  // Disparar o evento Purchase quando o componente for montado
  useEffect(() => {
    // Verificar se já disparamos o evento para evitar duplicação
    const storageKey = `purchaseEventFired_${transactionId}`;
    const alreadyFired = localStorage.getItem(storageKey);
    
    if (alreadyFired) {
      console.log('[Tracking] Evento Purchase já foi disparado para esta transação');
      return;
    }
    
    // Preparar os dados do evento Purchase
    const purchaseData = {
      value: orderValue,
      currency: 'BRL',
      content_ids: products.map(product => product.id),
      content_type: 'product',
      contents: products.map(product => ({
        id: product.id,
        quantity: product.quantity,
        item_price: product.price,
      })),
      num_items: products.reduce((total, product) => total + product.quantity, 0),
      transaction_id: transactionId,
      eventId,
      customer: {
        email: customerEmail,
        phone: customerPhone,
        firstName: firstName,
        lastName: customerName.split(' ').slice(1).join(' '),
      },
    };
    
    // Disparar o evento Purchase
    purchase(purchaseData);
    
    // Marcar como disparado para evitar duplicação
    localStorage.setItem(storageKey, 'true');
  }, [transactionId, orderValue, products, customerEmail, customerPhone, customerName, firstName, purchase, eventId]);
  

  return (
    <div className="min-h-screen bg-[#FFF9F5] font-sans text-[#333]">
      {/* Header */}
      <header className="w-full bg-[#2c4f71] h-[80px] flex items-center justify-center top-0">
        <Image
          src="/images/system/logo_transparent.webp"
          alt="Logo"
          width={80}
          height={80}
          className="h-auto w-auto max-h-[80px]"
        />
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6 px-4 max-w-[480px]">
        <div className="bg-white rounded-[8px] p-5 my-[16px] md:my-[24px] w-full flex flex-col gap-6 shadow-xl border border-gray-200">
          {/* Alerta de sucesso */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-100">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100">
              <FaCheckCircle className="text-green-700 text-xl" />
            </div>
            <h2 className="text-lg font-bold text-green-800">Pagamento confirmado!</h2>
          </div>

          {/* Mensagem de boas-vindas */}
          <div>
            <p className="text-[15px] font-semibold mb-1 text-green-800">
              Pedido processado com sucesso!
            </p>
            <p className="text-sm text-gray-700">
              Olá, <span className="font-medium">{firstName}</span>! Seu pagamento foi confirmado.
            </p>
          </div>

          {/* Detalhes do pedido */}
          <div className="w-full bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-green-600">
                <FaCheckCircle size={18} />
              </div>
              <div>
                <h3 className="font-bold text-green-800">Detalhes do pedido</h3>
                <p className="text-sm text-gray-700 mt-1">
                  Número do pedido: <span className="font-medium">{orderNumber}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Suporte */}
          <div className="w-full bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-green-600">
                <FaCheckCircle size={18} />
              </div>
              <div>
                <h3 className="font-bold text-green-800">Suporte</h3>
                <p className="text-sm text-gray-700 mt-1">
                  Caso precise de alguma ajuda para acessar o material, chame no WhatsApp abaixo.
                </p>
              </div>
            </div>
          </div>

          {/* Botão de WhatsApp */}
          <Link
            href="https://wa.me/551148635262"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-[#2c4f71] text-white font-medium rounded-lg hover:bg-[#1d3557] transition-colors flex items-center justify-center gap-2"
          >
            <FaWhatsapp size={20} />
            Falar com o suporte
          </Link>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;
