'use client';

import { useEffect } from 'react';

interface CheckoutPreloadProps {
  checkoutDomain: string;
}

/**
 * Componente otimizado que estabelece conexões antecipadas com o domínio de checkout
 * Mantém apenas as otimizações que o Next.js não faz automaticamente:
 * - dns-prefetch e preconnect para domínios externos
 */
export default function CheckoutPreload({ checkoutDomain }: CheckoutPreloadProps) {
  useEffect(() => {
    // Sempre adicionamos preconnect e dns-prefetch, que são leves
    // e não afetam significativamente o desempenho da página
    const preconnectLink = document.createElement('link');
    preconnectLink.rel = 'preconnect';
    preconnectLink.href = `https://${checkoutDomain}`;
    preconnectLink.crossOrigin = 'anonymous';
    document.head.appendChild(preconnectLink);

    const dnsPrefetchLink = document.createElement('link');
    dnsPrefetchLink.rel = 'dns-prefetch';
    dnsPrefetchLink.href = `https://${checkoutDomain}`;
    document.head.appendChild(dnsPrefetchLink);

    // Limpeza ao desmontar o componente
    return () => {
      if (preconnectLink.parentNode) {
        document.head.removeChild(preconnectLink);
      }

      if (dnsPrefetchLink.parentNode) {
        document.head.removeChild(dnsPrefetchLink);
      }
    };
  }, [checkoutDomain]);

  // Este componente não renderiza nada visível
  return null;
}
