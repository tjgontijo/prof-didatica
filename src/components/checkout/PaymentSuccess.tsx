'use client';

import React from 'react';
import Link from 'next/link';
import { FaCheckCircle, FaWhatsapp } from 'react-icons/fa';
import Image from 'next/image';

interface PaymentSuccessProps {
  orderNumber: string;
  customerName: string;
  accessLink?: string;
  whatsappLink?: string;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ orderNumber, customerName }) => {
  const firstName = customerName.split(' ')[0];

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
        {/* Container Principal */}
        <div className="bg-white rounded-[8px] p-5 my-[16px] md:my-[24px] w-full flex flex-col gap-6 shadow-xl border border-gray-200">
          {/* Cabeçalho com ícone e título */}
          <div className="flex items-center gap-3 mb-4 p-4 rounded-lg bg-blue-50">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100">
                <FaCheckCircle className="text-blue-700 text-xl" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-blue-800">Pagamento confirmado!</h2>
          </div>

          {/* Mensagem de confirmação */}
          <div className="mb-6">
            <p className="text-[15px] font-semibold mb-1 text-blue-800">
              Pedido processado com sucesso!
            </p>
            <p className="text-sm text-gray-600">
              Olá, <span className="font-medium">{firstName}</span>! Seu pagamento foi confirmado com
              sucesso.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-6">
            {/* Informações do pedido */}
            <div className="w-full bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-blue-500">
                  <FaCheckCircle size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-blue-800">Detalhes do pedido</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Número do pedido: <span className="font-medium">{orderNumber}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Instruções de suporte */}
            <div className="w-full bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-blue-500">
                  <FaCheckCircle size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-blue-800">Suporte</h3>
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
              className="w-full py-3 bg-[#2c4f71] text-white font-medium rounded-lg hover:bg-[#1d3557] transition-colors flex items-center justify-center gap-2"
            >
              <FaWhatsapp size={20} />
              Falar com o suporte
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;
