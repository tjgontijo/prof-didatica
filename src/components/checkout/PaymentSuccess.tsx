'use client';

import React from 'react';
import Link from 'next/link';
import { FaCheckCircle, FaWhatsapp } from 'react-icons/fa';

interface PaymentSuccessProps {
  orderNumber: string;
  customerName: string;
  productName: string;
  accessLink?: string;
  whatsappLink?: string;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  orderNumber,
  customerName,
  productName,
}) => {
  const firstName = customerName.split(' ')[0];

  return (
    <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-200">
      {/* Cabeçalho com ícone e título */}
      <div className="flex items-center gap-3 mb-4 p-4 rounded-lg bg-green-50">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100">
            <FaCheckCircle className="text-green-600 text-xl" />
          </div>
        </div>
        <h2 className="text-lg font-medium text-green-700">Pagamento confirmado!</h2>
      </div>

      {/* Mensagem de confirmação */}
      <div className="mb-6">
        <p className="text-[15px] font-medium mb-1">Pedido processado com sucesso!</p>
        <p className="text-sm text-gray-600">
          Olá, <span className="font-medium">{firstName}</span>! Seu pagamento para{' '}
          <span className="font-medium">{productName}</span> foi confirmado com sucesso.
        </p>
      </div>

      <div className="flex flex-col items-center space-y-6">
        {/* Informações do pedido */}
        <div className="w-full bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-green-500">
              <FaCheckCircle size={18} />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Detalhes do pedido</h3>
              <p className="text-sm text-gray-600 mt-1">
                Número do pedido: <span className="font-medium">{orderNumber}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Instruções de suporte */}
        <div className="w-full bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-blue-500">
              <FaCheckCircle size={18} />
            </div>
            <div>
              <h3 className="font-medium text-[#2c4f71]">Suporte</h3>
              <p className="text-sm text-gray-600 mt-1">
                Caso precise de alguma ajuda para ter acesso ao material, basta nos chamar no
                suporte do WhatsApp pelo botão abaixo.
              </p>
            </div>
          </div>
        </div>

        {/* Botão de WhatsApp */}
        <Link
          href="https://wa.me/551148635262"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 bg-[#25D366] text-white font-medium rounded-lg hover:bg-[#1DA851] transition-colors flex items-center justify-center gap-2"
        >
          <FaWhatsapp size={20} />
          Falar com o suporte
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
