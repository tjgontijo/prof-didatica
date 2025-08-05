'use client';

interface CtaButtonProps {
  paymentLink: string;
  text: string;
  className?: string;
  onClick?: () => void | Promise<void>;
  ariaLabel?: string;
}

export default function CtaButton({ paymentLink, text, className = '', onClick }: CtaButtonProps) {
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      e.preventDefault();
      try {
        await onClick();
        window.location.href = paymentLink;
      } catch (error) {
        console.error('Erro durante o processamento do onClick:', error);
        window.location.href = paymentLink;
      }
    }
  };

  return (
    <a
      href={paymentLink}
      role="button"
      rel="noopener noreferrer"
      className={`block w-full bg-gradient-to-r from-[#457B9D] to-[#1D3557] hover:from-[#1D3557] hover:to-[#457B9D] text-white text-base sm:text-lg font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden group text-center uppercase ${className}`}
      onClick={handleClick}
    >
      <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <span className="relative">{text}</span>
    </a>
  );
}
