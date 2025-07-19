'use client';

import { useEffect } from 'react';

interface CheckoutPreloadProps {
  checkoutDomain: string;
  paymentLink: string;
}

export default function CheckoutPreload({ checkoutDomain, paymentLink }: CheckoutPreloadProps) {
  useEffect(() => {
    // Verifica se estamos em ambiente de desenvolvimento ou produção
    const isDevelopment =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

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

    // Função para adicionar prefetch do documento completo
    // Só será executada em produção ou quando o usuário rolar a página
    const addFullPrefetch = () => {
      // Verifica se já existe um prefetch para este URL
      const existingPrefetch = document.querySelector(
        `link[rel="prefetch"][href="${paymentLink}"]`,
      );
      if (existingPrefetch) return;

      // Adiciona o prefetch
      const prefetchLink = document.createElement('link');
      prefetchLink.rel = 'prefetch';
      prefetchLink.href = paymentLink;
      prefetchLink.as = 'document';
      document.head.appendChild(prefetchLink);

      // Armazena a referência para limpeza posterior
      return prefetchLink;
    };

    // Variável para armazenar a referência ao link de prefetch
    let prefetchLinkRef: HTMLLinkElement | undefined;

    // Em produção, adicionamos o prefetch quando o usuário rola 50% da página
    let handleScroll: (() => void) | null = null;

    if (!isDevelopment) {
      handleScroll = () => {
        // Calcula a porcentagem da página que foi rolada
        const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);

        // Se o usuário rolou mais de 50% da página
        if (scrolled > 0.5) {
          prefetchLinkRef = addFullPrefetch();
          // Remove o listener após adicionar o prefetch
          if (handleScroll) {
            window.removeEventListener('scroll', handleScroll);
          }
        }
      };

      // Adiciona o listener de scroll
      window.addEventListener('scroll', handleScroll);
    }

    // Configura os listeners para os botões CTA
    setTimeout(() => {
      // Encontra todos os links que apontam para o domínio de checkout
      const ctaButtons = document.querySelectorAll(`a[href*="${checkoutDomain}"]`);

      // Adiciona eventos para cada botão CTA
      ctaButtons.forEach((button) => {
        // Em produção, adicionamos prefetch no hover
        // Em desenvolvimento, apenas reforçamos o preconnect
        button.addEventListener(
          'mouseover',
          () => {
            if (!isDevelopment) {
              // Em produção, fazemos o prefetch completo
              prefetchLinkRef = addFullPrefetch();
            } else {
              // Em desenvolvimento, apenas reforçamos o preconnect
              const warmupLink = document.createElement('link');
              warmupLink.rel = 'preconnect';
              warmupLink.href = `https://${checkoutDomain}`;
              warmupLink.crossOrigin = 'anonymous';
              document.head.appendChild(warmupLink);

              // Removemos após um curto período
              setTimeout(() => {
                if (warmupLink.parentNode) {
                  document.head.removeChild(warmupLink);
                }
              }, 3000);
            }
          },
          { once: true },
        ); // Só executa uma vez por botão
      });
    }, 1000);

    // Limpeza ao desmontar o componente
    return () => {
      if (preconnectLink.parentNode) {
        document.head.removeChild(preconnectLink);
      }

      if (dnsPrefetchLink.parentNode) {
        document.head.removeChild(dnsPrefetchLink);
      }

      if (prefetchLinkRef?.parentNode) {
        document.head.removeChild(prefetchLinkRef);
      }

      // Remover listener de scroll se estiver em produção
      if (!isDevelopment && handleScroll) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [checkoutDomain, paymentLink]);

  // Este componente não renderiza nada visível
  return null;
}
