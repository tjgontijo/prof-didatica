'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FaCopy } from 'react-icons/fa';

interface RespostaPix {
  id: string;
  status: string;
  qr_code: string;
  qr_code_base64: string;
  ticket_url: string;
  expiration_date: string;
  amount?: number;
}

interface PaymentQrCodeProps {
  respostaPix: RespostaPix;
}

const PaymentQrCode: React.FC<PaymentQrCodeProps> = ({ respostaPix }) => {
  const [copiado, setCopiado] = useState(false);

  // Função para copiar código PIX
  const copiarCodigoPix = () => {
    if (respostaPix?.qr_code) {
      navigator.clipboard.writeText(respostaPix.qr_code);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }
  };

  if (!respostaPix) return null;

  return (
    <div className="bg-white rounded-[8px] p-5 mb-6 text-center">
      <h2 className="text-[16px] font-bold text-[#333] mb-4 border-b pb-2">Pagamento PIX</h2>

      {respostaPix.amount && (
        <div className="mb-4 text-center">
          <p className="text-lg font-bold text-[#1D3557]">
            Valor:{' '}
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              respostaPix.amount,
            )}
          </p>
        </div>
      )}

      <div className="flex flex-col items-center space-y-4">
        {respostaPix.qr_code_base64 && (
          <div className="p-4 bg-white border rounded-lg">
            <Image
              src={`data:image/png;base64,${respostaPix.qr_code_base64}`}
              alt="QR Code PIX"
              width={192}
              height={192}
              className="w-48 h-48"
              unoptimized={true}
            />
          </div>
        )}

        <div className="w-full">
          <p className="text-sm text-[#666] mb-2">Copie o código PIX:</p>
          <div className="relative">
            <div className="p-3 bg-gray-100 rounded-lg text-xs break-all">
              {respostaPix.qr_code}
            </div>
            <button
              onClick={copiarCodigoPix}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#1D3557] hover:text-[#457B9D]"
              title="Copiar código PIX"
            >
              <FaCopy size={16} />
            </button>
          </div>
          {copiado && <p className="text-green-600 text-xs mt-1">Código copiado!</p>}
        </div>

        <p className="text-sm text-[#666]">
          O código PIX expira em{' '}
          {respostaPix.expiration_date
            ? new Date(respostaPix.expiration_date).toLocaleString('pt-BR')
            : '30 minutos'}
        </p>

        {respostaPix.ticket_url && (
          <a
            href={respostaPix.ticket_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1D3557] underline hover:text-[#457B9D] text-sm"
          >
            Visualizar ticket completo
          </a>
        )}
      </div>
    </div>
  );
};

export default PaymentQrCode;
