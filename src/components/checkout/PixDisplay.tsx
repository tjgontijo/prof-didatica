'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FaCopy, FaCheckCircle } from 'react-icons/fa';
import { PixData } from './getPixData';

interface PixDisplayProps {
  pixData: PixData;
}

export default function PixDisplay({ pixData }: PixDisplayProps) {
  const [copiado, setCopiado] = useState(false);

  // Função para copiar código PIX
  const copiarCodigoPix = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* QR Code */}
      {pixData.qr_code_base64 && (
        <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
          <Image
            src={`data:image/png;base64,${pixData.qr_code_base64}`}
            alt="QR Code PIX"
            width={220}
            height={220}
            className="w-[220px] h-[220px]"
            unoptimized={true}
          />
        </div>
      )}

      {/* Código PIX */}
      <div className="w-full">
        <p className="text-sm text-[#666] mb-2 text-center font-medium">Código Pix</p>
        <div className="relative">
          <div className="p-4 bg-gray-50 rounded-lg text-sm font-mono break-all border border-gray-200">
            {pixData.qr_code}
          </div>
          <button
            onClick={copiarCodigoPix}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#2c4f71] hover:text-[#457B9D] bg-white rounded-full shadow-sm border border-gray-200"
            title="Copiar código PIX"
          >
            {copiado ? (
              <FaCheckCircle size={18} className="text-green-500" />
            ) : (
              <FaCopy size={18} />
            )}
          </button>
        </div>
        {copiado && <p className="text-green-600 text-xs mt-1 text-center">Código copiado!</p>}
      </div>

      {/* Informações adicionais */}
      <div className="w-full bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="mt-1 text-blue-500">
            <FaCheckCircle size={18} />
          </div>
          <div>
            <h3 className="font-medium text-[#2c4f71]">Instruções</h3>
            <ol className="text-sm text-gray-600 mt-1 space-y-1 list-decimal ml-4">
              <li>Abra o aplicativo do seu banco</li>
              <li>Escolha a opção PIX</li>
              <li>Escaneie o QR Code ou cole o código</li>
              <li>Confirme as informações e finalize o pagamento</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Expiração */}
      <p className="text-sm text-[#666] mt-2">
        O código PIX expira em{' '}
        {pixData.expiration_date
          ? new Date(pixData.expiration_date).toLocaleString('pt-BR')
          : '30 minutos'}
      </p>

      {/* Botão para copiar código */}
      <button
        onClick={copiarCodigoPix}
        className="w-full py-3 bg-[#2c4f71] text-white font-medium rounded-lg hover:bg-[#1d3557] transition-colors"
      >
        Copiar código PIX
      </button>

      {/* Link para ticket */}
      {pixData.ticket_url && (
        <a
          href={pixData.ticket_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#2c4f71] underline hover:text-[#457B9D] text-sm"
        >
          Visualizar ticket completo
        </a>
      )}
    </div>
  );
}
