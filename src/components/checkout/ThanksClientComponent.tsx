'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { checkPaymentStatus } from '@/app/(public)/checkout/actions/payment';
import Image from 'next/image';
import { FaCopy, FaCheckCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { PixData } from './getPixData';

interface ThanksClientComponentProps {
  pixData: PixData;
  transactionId: string;
}

interface OrderItem {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  isOrderBump?: boolean;
  initialPrice?: number;
  specialPrice?: number;
}

export default function ThanksClientComponent({
  pixData,
  transactionId,
}: ThanksClientComponentProps) {
  const [copiado, setCopiado] = useState(false);
  const [status, setStatus] = useState(pixData.status);
  const [passoAPasso, setPasaoAPasso] = useState(false);
  const [tentativasConsecutivas, setTentativasConsecutivas] = useState(0);
  const ultimaVerificacaoRef = useRef<number>(Date.now());
  const router = useRouter();

  // Itens do pedido vindos do backend
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // Carregar dados do pedido
  useEffect(() => {
    console.log('Dados do PIX recebidos:', pixData);

    // Verificar se temos os itens do pedido
    if (pixData.order?.orderItems && pixData.order.orderItems.length > 0) {
      console.log('Itens do pedido encontrados:', pixData.order.orderItems);

      const items = pixData.order.orderItems.map((item) => {
        // Determinar se é um produto principal ou um order bump
        const isOrderBump = item.isOrderBump || false;

        // Preço atual (sempre usar o priceAtTime que é o preço no momento da compra)
        const price = Number(item.priceAtTime);

        // Para order bumps, podemos assumir que o preço inicial era maior (preço com desconto)
        // Isso é apenas para exibição, então vamos simular um preço inicial 30% maior para order bumps
        const initialPrice = isOrderBump ? price * 1.3 : price;

        return {
          id: item.id,
          title: item.productTitle || 'Produto',
          price: price,
          initialPrice: initialPrice,
          specialPrice: price, // Para manter compatibilidade com a exibição
          imageUrl: item.imageUrl || '/images/system/logo_transparent.webp',
          isOrderBump: isOrderBump,
        };
      }) as OrderItem[];

      console.log('Itens processados:', items);
      setOrderItems(items);
    } else {
      // Nenhum item encontrado, exibir array vazio
      console.log('Nenhum item encontrado no pedido');
      setOrderItems([]);
    }
  }, [pixData]);

  // Verificar status do pagamento com intervalo adaptativo
  useEffect(() => {
    const verificarStatus = async () => {
      if (status === 'approved') return; // Se já aprovado, não verifica mais

      // Calcular tempo desde a última verificação
      const agora = Date.now();
      const tempoDesdeUltimaVerificacao = agora - ultimaVerificacaoRef.current;

      // Se a última verificação foi há menos de 1 segundo, não verificar novamente
      if (tempoDesdeUltimaVerificacao < 1000) return;

      try {
        ultimaVerificacaoRef.current = agora;

        const resultado = await checkPaymentStatus(transactionId);

        if (resultado.error) {
          console.error(resultado.error);
          setTentativasConsecutivas((prev) => prev + 1);
          return;
        }

        if (resultado.status && resultado.status !== status) {
          setStatus(resultado.status);
          setTentativasConsecutivas(0);

          // Se o pagamento foi aprovado
          if (resultado.status === 'approved') {
            // Verificar se existe upsellPageUrl
            if (resultado.upsellPageUrl) {
              router.push(resultado.upsellPageUrl);
            } else {
              // Redirecionar para página de agradecimento padrão
              router.push('/payment-success');
            }
          }
        } else {
          // Se o status não mudou, incrementar contador de tentativas
          setTentativasConsecutivas((prev) => prev + 1);
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
        setTentativasConsecutivas((prev) => prev + 1);
      }
    };

    // Verificar imediatamente
    verificarStatus();

    // Definir intervalo adaptativo baseado no número de tentativas consecutivas
    // Quanto mais tentativas sem mudança, maior o intervalo
    let intervalo: number;
    if (tentativasConsecutivas < 5) {
      intervalo = 2000; // 2 segundos iniciais
    } else if (tentativasConsecutivas < 10) {
      intervalo = 5000; // 5 segundos após 5 tentativas
    } else if (tentativasConsecutivas < 20) {
      intervalo = 10000; // 10 segundos após 10 tentativas
    } else {
      intervalo = 30000; // 30 segundos após 20 tentativas
    }

    const timer = setInterval(verificarStatus, intervalo);

    // Limpar intervalo quando o componente for desmontado
    return () => clearInterval(timer);
  }, [status, transactionId, router, tentativasConsecutivas]);

  // Função para copiar código PIX
  const copiarCodigoPix = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#333]">
      {/* Main Content */}
      <main className="container mx-auto py-6 px-4 max-w-[600px]">
        <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-200">
          {/* Cabeçalho com ícone e título */}
          <div
            className={`flex items-center gap-3 mb-4 p-4 rounded-lg ${status === 'approved' ? 'bg-green-50' : 'bg-blue-50'}`}
          >
            <div className="flex-shrink-0">
              {status === 'approved' ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="12" fill="#E6FFE6" />
                  <path
                    d="M8 12L11 15L16 9"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
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
              )}
            </div>
            <h2
              className={`text-lg font-medium ${status === 'approved' ? 'text-green-700' : 'text-blue-700'}`}
            >
              {status === 'approved' ? 'Pagamento aprovado!' : 'Pedido recebido!'}
            </h2>
          </div>

          {/* Instruções de pagamento */}
          <div className="mb-6">
            <p className="text-[15px] font-medium mb-1">Pague o Pix para finalizar a compra.</p>
            <p className="text-sm text-gray-600">
              Quando o pagamento for aprovado, você receberá no WhatsApp{' '}
              <span className="font-medium">{pixData.order?.customer?.phone || ''}</span> as
              informações sobre seu(s) produto(s). Fique atento às mensagens recebidas.
            </p>
          </div>

          {/* Código Pix */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Código Pix</span>
              <span className="text-sm font-medium">R$ {pixData.amount?.toFixed(2) || '0.00'}</span>
            </div>

            {/* QR Code */}
            {pixData.qr_code_base64 && (
              <div className="flex justify-center mb-3">
                <Image
                  src={
                    pixData.qr_code_base64
                      ? `data:image/png;base64,${pixData.qr_code_base64}`
                      : '/images/system/logo_transparent.webp'
                  }
                  alt="QR Code PIX"
                  width={180}
                  height={180}
                  className="border border-gray-200 p-2 rounded"
                  unoptimized={true}
                />
              </div>
            )}

            {/* Código PIX para copiar */}
            <div className="text-xs font-mono break-all bg-gray-50 border border-gray-200 p-3 rounded mb-2 text-gray-700">
              {pixData.qr_code}
            </div>

            {/* Botão de copiar */}
            <button
              onClick={copiarCodigoPix}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {copiado ? <FaCheckCircle /> : <FaCopy />}
              {copiado ? 'Código copiado!' : 'Copiar código Pix'}
            </button>
          </div>

          {/* Instruções passo a passo (Acordeão) */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={() => setPasaoAPasso(!passoAPasso)}
                className="w-full text-sm text-blue-600 font-medium flex items-center justify-between py-2"
              >
                <span>Passo a passo para pagar com Pix</span>
                {passoAPasso ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </div>

            {passoAPasso && (
              <div className="bg-gray-50 p-4 rounded-lg mt-2">
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                      1
                    </div>
                    <div className="text-sm">
                      Abra o aplicativo do seu banco e acesse a área Pix
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                      2
                    </div>
                    <div className="text-sm">
                      Selecione a opção "pagar com código Pix Copia e Cola" e cole o código no
                      espaço indicado no aplicativo
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                      3
                    </div>
                    <div className="text-sm">
                      Após o pagamento, você receberá por email as informações de acesso à sua
                      compra
                    </div>
                  </li>
                </ol>
              </div>
            )}
          </div>

          {/* Resumo da compra */}
          <div className="border-t border-gray-200 pt-4 mt-6">
            <h3 className="font-medium mb-3">Resumo da compra</h3>
            <div className="space-y-3">
              {/* Produto Principal */}
              {orderItems.length > 0 ? (
                <div className="space-y-3">
                  {/* Primeiro item (produto principal) */}
                  {orderItems
                    .filter((item) => !item.isOrderBump)
                    .map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-1">
                        <div className="flex gap-3 items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                            <Image
                              src={item.imageUrl || '/images/system/logo_transparent.webp'}
                              alt={item.title || 'Produto'}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                              unoptimized={true}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/system/logo_transparent.webp';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-[14px] text-[#333]">
                              {item.title.length > 35
                                ? `${item.title.substring(0, 35).trim()}...`
                                : item.title}
                            </p>
                          </div>
                        </div>
                        <span className="text-[14px] font-bold text-[#333]">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(item.price)}
                        </span>
                      </div>
                    ))}

                  {/* Order Bumps */}
                  {orderItems
                    .filter((item) => item.isOrderBump)
                    .map((item) => {
                      const precoEspecial = item.specialPrice || item.price;
                      const precoInicial = item.initialPrice || item.price;

                      return (
                        <div key={item.id} className="flex justify-between items-center py-1">
                          <div className="flex flex-col">
                            <span className="text-[14px] text-[#333]">
                              {item.title.length > 35
                                ? `${item.title.substring(0, 35).trim()}...`
                                : item.title}
                            </span>
                            {precoInicial > precoEspecial && (
                              <span className="text-[10px] text-[#00A859]">
                                Economia de{' '}
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(precoInicial - precoEspecial)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {precoInicial > precoEspecial && (
                              <span className="text-[11px] line-through text-[#999]">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(precoInicial)}
                              </span>
                            )}
                            <span className="text-[14px] text-[#333]">
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(precoEspecial)}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                  {/* Valor Total */}
                  <div className="flex justify-between items-center pt-3 border-t border-[#E5E7EB] mt-2">
                    <span className="text-[14px] font-bold text-[#333]">Total</span>
                    <span className="text-[16px] font-bold text-[#00A859]">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(pixData.amount || 0)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 py-2 text-center">
                  Aguardando confirmação dos itens do pedido...
                </div>
              )}

              {/* Código da transação */}
              <div className="text-xs text-gray-500 mt-2">Código da transação: {transactionId}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
