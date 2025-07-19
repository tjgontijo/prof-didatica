'use client';

import { useCallback, useEffect, useState } from 'react';
import { buildUrlWithTracking } from '@/services/trackingService';

interface CtaButtonProps {
  paymentLink: string;
  text: string;
  className?: string;
  onClick?: () => void;
}

export default function CtaButton({ paymentLink, text, className = '', onClick }: CtaButtonProps) {
  // Estado para armazenar o link de pagamento com UTMs
  const [finalPaymentLink, setFinalPaymentLink] = useState(paymentLink);
  
  // Função para obter os parâmetros UTM e fbclid do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Usar o serviço de rastreamento para construir o link com os parâmetros UTM
        const linkWithTracking = buildUrlWithTracking(paymentLink);
        setFinalPaymentLink(linkWithTracking);
      } catch (error) {
        console.error('Erro ao processar parâmetros de rastreamento:', error);
        setFinalPaymentLink(paymentLink);
      }
    }
  }, [paymentLink]);
  
  // Função para prefetch do link de pagamento
  const prefetchLink = useCallback(() => {
    try {
      // Verificar se o link já foi pré-carregado
      const existingPrefetch = document.querySelector(
        `link[rel="prefetch"][href="${finalPaymentLink}"]`,
      );
      if (!existingPrefetch) {
        const linkPrefetch = document.createElement('link');
        linkPrefetch.rel = 'prefetch';
        linkPrefetch.href = finalPaymentLink;
        linkPrefetch.as = 'document';
        document.head.appendChild(linkPrefetch);
      }
    } catch (error) {
      console.error('Erro ao pré-carregar o link:', error);
    }
  }, [finalPaymentLink]);

  // Prefetch do link quando o componente é montado
  useEffect(() => {
    // Usar setTimeout para não bloquear a renderização inicial
    const timer = setTimeout(() => {
      prefetchLink();
    }, 1000);

    return () => clearTimeout(timer);
  }, [prefetchLink]);

  // Manipulador de clique
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      e.preventDefault();
      onClick();
      setTimeout(() => {
        window.location.href = finalPaymentLink;
      }, 100);
    }
  };

  return (
    <a
      href={finalPaymentLink}
      rel="noopener noreferrer"
      target="_blank"
      className={`block w-full bg-gradient-to-r from-[#457B9D] to-[#1D3557] hover:from-[#1D3557] hover:to-[#457B9D] text-white text-base sm:text-lg font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden group text-center uppercase ${className}`}
      onMouseEnter={prefetchLink}
      onTouchStart={prefetchLink}
      onClick={onClick ? handleClick : undefined}
    >
      <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <span className="relative">{text}</span>
    </a>
  );
}
