'use client';

interface CtaButtonProps {
  paymentLink: string;
  text: string;
  className?: string;
  onClick?: () => void;
}

export default function CtaButton({
  paymentLink,
  text,
  className = '',
  onClick,
}: CtaButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick();

    // Fallback manual caso target="_blank" não funcione
    const newTab = window.open(paymentLink, '_blank', 'noopener,noreferrer');
    if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
      // Caso a nova aba seja bloqueada, abre na mesma aba
      window.location.href = paymentLink;
    }

    // Previne o comportamento padrão do <a> se for forçado via JS
    e.preventDefault();
  };

  return (
    <a
      href={paymentLink}
      rel="noopener noreferrer"
      target="_blank"
      className={`block w-full bg-gradient-to-r from-[#457B9D] to-[#1D3557] hover:from-[#1D3557] hover:to-[#457B9D] text-white text-base sm:text-lg font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden group text-center uppercase ${className}`}
      onClick={handleClick}
    >
      <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <span className="relative">{text}</span>
    </a>
  );
}
