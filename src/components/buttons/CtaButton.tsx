'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface CtaButtonProps {
  paymentLink: string;
  text: string;
  className?: string;
  onClick?: () => void | Promise<void>;
  ariaLabel?: string;
}

type LoadingStep = 'idle' | 'applying' | 'redirecting';

// Overlay de tela cheia que persiste durante navegação
function FullScreenOverlay({ message }: { message: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-gradient-to-br from-[#1D3557] to-[#457B9D] flex flex-col items-center justify-center"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
      <div className="text-center px-6">
        <div className="mb-6">
          <svg
            className="animate-spin h-12 w-12 text-white mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p
          className="text-white text-xl sm:text-2xl font-bold"
          style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
        >
          {message}
        </p>
        <p className="text-white/70 text-sm mt-3">
          Você será redirecionado em instantes...
        </p>
      </div>
    </div>,
    document.body
  );
}

export default function CtaButton({ paymentLink, text, className = '', onClick, ariaLabel }: CtaButtonProps) {
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('idle');
  const [hasPreloaded, setHasPreloaded] = useState(false);

  // Prefetch no hover - subdomínios podem permitir
  const handleMouseEnter = () => {
    if (!hasPreloaded) {
      // Tenta prefetch (funciona para recursos, pode ajudar com subdomínios)
      const prefetchLink = document.createElement('link');
      prefetchLink.rel = 'prefetch';
      prefetchLink.href = paymentLink;
      prefetchLink.crossOrigin = 'anonymous';
      document.head.appendChild(prefetchLink);

      // DNS prefetch sempre funciona - resolve o DNS antecipadamente
      const dnsLink = document.createElement('link');
      dnsLink.rel = 'dns-prefetch';
      dnsLink.href = new URL(paymentLink).origin;
      document.head.appendChild(dnsLink);

      // Preconnect - estabelece conexão TCP/TLS antecipadamente
      const preconnectLink = document.createElement('link');
      preconnectLink.rel = 'preconnect';
      preconnectLink.href = new URL(paymentLink).origin;
      preconnectLink.crossOrigin = 'anonymous';
      document.head.appendChild(preconnectLink);

      setHasPreloaded(true);
    }
  };

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Previne múltiplos cliques
    if (loadingStep !== 'idle') {
      e.preventDefault();
      return;
    }

    e.preventDefault();

    // Mostra overlay imediatamente
    setLoadingStep('applying');

    // Executa onClick customizado se existir
    if (onClick) {
      try {
        await onClick();
      } catch (error) {
        console.error('Erro durante o processamento do onClick:', error);
      }
    }

    // Aguarda 800ms para dar tempo do usuário ler, depois redireciona
    setTimeout(() => {
      setLoadingStep('redirecting');
      window.location.href = paymentLink;
    }, 800);
  };

  const isDisabled = loadingStep !== 'idle';

  return (
    <>
      {/* Overlay de tela cheia durante loading */}
      {loadingStep !== 'idle' && (
        <FullScreenOverlay message="🎁 Aplicando seu desconto..." />
      )}

      <a
        href={paymentLink}
        role="button"
        rel="noopener noreferrer"
        aria-label={ariaLabel || undefined}
        aria-busy={isDisabled}
        aria-disabled={isDisabled}
        className={`block w-full bg-gradient-to-r from-[#457B9D] to-[#1D3557] hover:from-[#1D3557] hover:to-[#457B9D] text-white text-base sm:text-lg font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-lg transform transition-all duration-300 relative overflow-hidden text-center uppercase ${
          isDisabled
            ? 'opacity-90 cursor-wait pointer-events-none'
            : 'hover:scale-[1.02] hover:shadow-xl group'
        } ${className}`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
      >
        <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <span className="relative flex items-center justify-center gap-2">
          {text}
        </span>
      </a>
    </>
  );
}
