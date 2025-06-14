'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FaCheckCircle } from 'react-icons/fa';
import { PixData } from './getPixData';
import { CgShoppingCart } from 'react-icons/cg';

interface PixDisplayProps {
  pixData: PixData;
}

export default function PixDisplay({ pixData }: PixDisplayProps) {
  const [copiado, setCopiado] = useState(false);

  // Log detalhado dos dados do PIX
  console.log('[PixDisplay] Dados do PIX recebidos:', {
    id: pixData?.id,
    status: pixData?.status,
    qr_code: pixData?.qr_code ? `${pixData.qr_code.substring(0, 20)}...` : 'Ausente',
    qr_code_base64: pixData?.qr_code_base64 ? 'Presente (base64)' : 'Ausente',
    ticket_url: pixData?.ticket_url || 'Ausente',
    expiration_date: pixData?.expiration_date || 'Ausente',
    amount: pixData?.amount,
    orderInfo: pixData?.order ? `ID: ${pixData.order.id}, Status: ${pixData.order.status}` : 'Sem dados do pedido',
    customerInfo: pixData?.order?.customer ? `Nome: ${pixData.order.customer.name}, Telefone: ${pixData.order.customer.phone}` : 'Sem dados do cliente'
  });

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
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100">
            <CgShoppingCart className="text-blue-700 text-xl" />
          </div>
        </div>
        <h2 className="text-lg font-bold text-blue-800">Seu Pedido foi Gerado!</h2>
      </div>

      {/* Instruções de pagamento */}
      <div className="mb-6">
        <p className="text-[15px] font-semibold mb-1 text-blue-800">
          Pague o Pix para finalizar sua compra!
        </p>
        <p className="text-sm text-gray-600">
          Quando o pagamento for aprovado, você receberá no WhatsApp{' '}
          <span className="font-medium">{pixData.order?.customer?.phone || ''}</span> as informações
          de acesso. Fique atento às mensagens recebidas.
        </p>
      </div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1 px-2">
          <span className="text-sm font-semibold text-blue-800">Código Pix</span>
          <span className="text-sm font-bold text-blue-800">
            R$ {pixData.amount?.toFixed(2) || '0.00'}
          </span>
        </div>
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
          <div className="relative">
            <div className="p-4 bg-gray-50 rounded-lg text-sm break-all border border-gray-200 text-gray-800">
              {pixData.qr_code}
            </div>
            <button
              onClick={copiarCodigoPix}
              aria-label="Copiar chave PIX"
              className="w-full py-3 mt-4 bg-[#2c4f71] text-white font-medium rounded-lg hover:bg-[#1d3557] transition-colors"
            >
              Copiar Chave PIX
            </button>
          </div>
          {copiado && (
            <p className="text-blue-800 text-md mt-1 text-center animate-pulse transition-opacity duration-300">
              Código copiado!
            </p>
          )}
        </div>

        {/* Informações adicionais */}
        <div className="w-full bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-blue-500">
              <FaCheckCircle size={18} />
            </div>
            <div>
              <h3 className="font-bold text-blue-800">Instruções</h3>
              <ol className="text-sm text-gray-800 mt-1 space-y-1 list-decimal ml-4">
                <li>Abra o aplicativo do seu banco</li>
                <li>Acesse a área de PIX</li>
                <li>Escaneie o QR Code ou cole o código na opção COPIA e COLA</li>
                <li>Confirme as informações e finalize o pagamento</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Expiração */}
        <p className="text-sm text-gray-800 mt-2">
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

        {/* Código da transação */}
        <div className="text-xs text-gray-700 mt-2 flex items-center justify-between">
          <span>Código da transação: {pixData.id}</span>
        </div>
      </div>
    </div>
  );
}
