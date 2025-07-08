'use client';

interface CtaButtonProps {
  paymentLink: string;
  text: string;
  className?: string;
}

export default function CtaButton({ paymentLink, text, className = '' }: CtaButtonProps) {

  const handleMouseEnter = () => {
    if ('requestIdleCallback' in window) {      
      type IdleCallbackHandle = number;
      type IdleCallbackOptions = {
        timeout: number;
      };
      type IdleCallbackFn = (deadline: {
        didTimeout: boolean;
        timeRemaining: () => number;
      }) => void;
      
      interface WindowWithRequestIdleCallback {
        requestIdleCallback: (callback: IdleCallbackFn, options?: IdleCallbackOptions) => IdleCallbackHandle;
      }
      
      ((window as unknown) as WindowWithRequestIdleCallback).requestIdleCallback((_deadline) => {        
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
      setTimeout(() => {
        const existingPrefetch = document.querySelector(`link[rel="prefetch"][href="${paymentLink}"]`);
        if (!existingPrefetch) {
          const linkPrefetch = document.createElement('link');
          linkPrefetch.rel = 'prefetch';
          linkPrefetch.href = paymentLink;
          linkPrefetch.as = 'document';
          document.head.appendChild(linkPrefetch);
        }
      }, 200);
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
