'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { checkPaymentStatus } from '@/app/checkout/actions/payment';
import PixDisplay from './PixDisplay';
import PaymentSuccess from './PaymentSuccess';
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
  const [status, setStatus] = useState(pixData.status);
  const [tentativasConsecutivas, setTentativasConsecutivas] = useState(0);
  const [verificando, setVerificando] = useState(false);
  const ultimaVerificacaoRef = useRef<number>(Date.now());
  const router = useRouter();

  // Estado para armazenar os itens do pedido processados
  const [, setOrderItems] = useState<OrderItem[]>([]);

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
        setVerificando(true);
        ultimaVerificacaoRef.current = agora;

        const resultado = await checkPaymentStatus(transactionId);

        if (resultado.error) {
          console.error(resultado.error);
          setTentativasConsecutivas((prev) => prev + 1);
          setVerificando(false);
          return;
        }

        if (resultado.status && resultado.status !== status) {
          setStatus(resultado.status);
          setTentativasConsecutivas(0);
          setVerificando(false);

          // Se o pagamento foi aprovado
          if (resultado.status === 'approved') {
            // Limpar o intervalo para parar de verificar o status
            clearInterval(timer);

            // Não vamos mais redirecionar para outra página
            // Apenas atualizar o status para mostrar o componente PaymentSuccess
            console.log('Pagamento aprovado! Mostrando tela de sucesso.');
          }
        } else {
          // Se o status não mudou, incrementar contador de tentativas
          setTentativasConsecutivas((prev) => prev + 1);
          setVerificando(false);
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
        setTentativasConsecutivas((prev) => prev + 1);
        setVerificando(false);
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

  // Renderizar o componente com base no status do pagamento
  return (
    <div className="min-h-screen bg-white font-sans text-[#333]">
      <main className="container mx-auto py-6 px-4 max-w-[600px]">
        {status === 'approved' ? (
          <PaymentSuccess
            orderNumber={pixData.order?.id || ''}
            customerName={pixData.order?.customer?.name || 'Cliente'}
            productName={pixData.order?.orderItems?.[0]?.productTitle || 'Produto'}
          />
        ) : (
          <PixDisplay pixData={pixData} verificando={verificando} />
        )}
      </main>
    </div>
  );
}
