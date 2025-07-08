'use client';

interface CtaButtonProps {
  paymentLink: string;
  text: string;
  className?: string;
}

export default function CtaButton({ paymentLink, text, className = '' }: CtaButtonProps) {
  // Função para pré-carregar o link de checkout quando o mouse passar sobre o botão
  // ou quando o usuário tocar no botão (dispositivos móveis)
  const handleMouseEnter = () => {
    // Usamos requestIdleCallback para executar o prefetch apenas quando o navegador estiver ocioso
    // Isso evita que o prefetch afete a experiência do usuário
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        // Verifica se já existe um link de prefetch para este URL
        const existingPrefetch = document.querySelector(`link[rel="prefetch"][href="${paymentLink}"]`);
        if (!existingPrefetch) {
          const linkPrefetch = document.createElement('link');
          linkPrefetch.rel = 'prefetch';
          linkPrefetch.href = paymentLink;
          linkPrefetch.as = 'document';
          document.head.appendChild(linkPrefetch);
        }
      });
    } else {
      // Fallback para navegadores que não suportam requestIdleCallback
      setTimeout(() => {
        const existingPrefetch = document.querySelector(`link[rel="prefetch"][href="${paymentLink}"]`);
        if (!existingPrefetch) {
          const linkPrefetch = document.createElement('link');
          linkPrefetch.rel = 'prefetch';
          linkPrefetch.href = paymentLink;
          linkPrefetch.as = 'document';
          document.head.appendChild(linkPrefetch);
        }
      }, 200); // Pequeno atraso para não bloquear a renderização
    }
  };

  return (
    <a
      href={paymentLink}
      rel="noopener noreferrer"
      className={`block w-full bg-gradient-to-r from-[#457B9D] to-[#1D3557] hover:from-[#1D3557] hover:to-[#457B9D] text-white text-base sm:text-lg font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden group text-center uppercase ${className}`}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleMouseEnter}
    >
      <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <span className="relative">{text}</span>
    </a>
  );
}
