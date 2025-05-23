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
  accessLink,
  whatsappLink,
}) => {
  const firstName = customerName.split(' ')[0];

  return (
    <div className="bg-white rounded-[8px] p-5 mb-6 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#E4F7ED]">
          <FaCheckCircle className="text-[#00A859] text-4xl" />
        </div>
        
        <h2 className="text-[18px] font-bold text-[#333]">
          Pagamento confirmado!
        </h2>
        
        <p className="text-[14px] text-[#666]">
          Olá, <span className="font-bold">{firstName}</span>! Seu pagamento para <span className="font-bold">{productName}</span> foi confirmado com sucesso.
        </p>
        
        <div className="bg-[#F8F9FA] p-4 rounded-[6px] w-full text-left">
          <p className="text-[14px] text-[#666] mb-1">Número do pedido:</p>
          <p className="text-[14px] font-bold text-[#333]">{orderNumber}</p>
        </div>
        
        {accessLink && (
          <Link 
            href={accessLink}
            className="w-full h-12 bg-[#00A859] text-white font-bold rounded-[6px] flex items-center justify-center"
          >
            Acessar meu produto
          </Link>
        )}
        
        {whatsappLink && (
          <Link 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-12 bg-[#25D366] text-white font-bold rounded-[6px] flex items-center justify-center gap-2"
          >
            <FaWhatsapp size={20} />
            Falar com o suporte
          </Link>
        )}
        
        <div className="border-t border-[#EEE] pt-4 mt-4 w-full">
          <p className="text-[12px] text-[#999]">
            Um e-mail com os detalhes da sua compra foi enviado para o seu endereço de e-mail cadastrado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
