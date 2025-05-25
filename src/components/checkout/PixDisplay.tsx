'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FaCopy, FaCheckCircle } from 'react-icons/fa';
import { PixData } from './getPixData';

interface PixDisplayProps {
  pixData: PixData;
  verificando?: boolean;
}

export default function PixDisplay({ pixData, verificando = false }: PixDisplayProps) {
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
    <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-200">
      {/* Cabeçalho com ícone e título */}
      <div className="flex items-center gap-3 mb-4 p-4 rounded-lg bg-blue-50">
        <div className="flex-shrink-0">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="12" fill="#E6EFFF" />
            <path
              d="M12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6Z"
              stroke="#2563EB"
              strokeWidth="2"
            />
            <path
              d="M12 8.5V12L14.5 14.5"
              stroke="#2563EB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-blue-700">Pedido recebido!</h2>
      </div>

      {/* Instruções de pagamento */}
      <div className="mb-6">
        <p className="text-[15px] font-medium mb-1">Pague o Pix para finalizar a compra.</p>
        <p className="text-sm text-gray-600">
          Quando o pagamento for aprovado, você receberá no WhatsApp{' '}
          <span className="font-medium">{pixData.order?.customer?.phone || ''}</span> as informações
          sobre seu(s) produto(s). Fique atento às mensagens recebidas.
        </p>
      </div>

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
          <div className="flex justify-around items-center mb-1">
            <span className="text-sm text-gray-600">Código Pix</span>
            <span className="text-sm font-medium">R$ {pixData.amount?.toFixed(2) || '0.00'}</span>
          </div>
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
                <li>Acesse a área de PIX</li>
                <li>Escaneie o QR Code ou cole o código na opção COPIA e COLA</li>
                <li>Confirme as informações e finalize o pagamento</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Expiração */}
        <p className="text-sm text-[#666] mt-2">
          Este código expira em{' '}
          {pixData.expiration_date
            ? new Date(pixData.expiration_date).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '24 horas'}
        </p>

        {/* Botão de copiar alternativo */}
        <button
          onClick={copiarCodigoPix}
          className="w-full py-3 bg-[#2c4f71] text-white font-medium rounded-lg hover:bg-[#1d3557] transition-colors"
        >
          Copiar código PIX
        </button>

        {/* Código da transação */}
        <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
          <span>Código da transação: {pixData.id}</span>
          {verificando && (
            <span className="flex items-center text-blue-600 animate-pulse">
              <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              Verificando pagamento...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
