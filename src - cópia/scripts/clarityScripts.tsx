'use client';

import Script from 'next/script';
import { useEffect } from 'react';

declare global {
  interface Window {
    clarity?: {
      q?: unknown[];
      (method: string, ...args: unknown[]): void;
    };
  }
}

export function ClarityScript() {
  useEffect(() => {
    const clarityCheckInterval = setInterval(() => {
      if (window.clarity) {
        clearInterval(clarityCheckInterval);
      }
    }, 2000);

    return () => clearInterval(clarityCheckInterval);
  }, []);

  return (
    <>
      <Script
        id="clarity-script"
        strategy="afterInteractive"
        onLoad={() => console.log('Script do Clarity carregado via Next.js Script')}
        onError={(e) => console.error('Erro ao carregar o script do Clarity:', e)}
      >
        {`
          try {
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "mh4561h8va");
            console.log("Código do Clarity executado");
          } catch (err) {
            console.error("Erro na execução do script do Clarity:", err);
          }
        `}
      </Script>
    </>
  );
}
