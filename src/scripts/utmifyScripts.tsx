'use client';

import Script from 'next/script';
import { useEffect } from 'react';

// Declaração de tipos para as propriedades globais
declare global {
  interface Window {
    pixelId: string;
    sha256: (input: string) => string;
    utmify?: {
      track: (eventName: string, eventData?: Record<string, unknown>) => void;
      init?: (config?: Record<string, unknown>) => void;
    };
  }
}

export function UtmifyScripts() {
  useEffect(() => {
    // Define o pixel ID globalmente quando o componente montar
    window.pixelId = '67c070919d1ed74e56ee2eda';
    
    // Verificar se os scripts foram carregados corretamente
    const checkInterval = setInterval(() => {
      if (document.getElementById('utmify-pixel-script') && 
          document.getElementById('utmify-utms-script')) {
        clearInterval(checkInterval);
      }
    }, 2000);

    return () => clearInterval(checkInterval);
  }, []);

  return (
    <>
      {/* Script SHA-256 */}
      <Script
        id="sha256-script"
        src="https://cdn.jsdelivr.net/npm/js-sha256/src/sha256.min.js"
        strategy="afterInteractive"
        onLoad={() => console.log('SHA-256 script carregado')}
        onError={(e) => console.error('Erro ao carregar o script SHA-256:', e)}
      />
      
      {/* Script UTMify UTMs */}
      <Script
        id="utmify-utms-script"
        src="https://cdn.utmify.com.br/scripts/utms/latest.js"
        strategy="afterInteractive"
        data-utmify-prevent-subids="true"
        onLoad={() => console.log('UTMify UTMS Script carregado')}
        onError={(e) => console.error('Erro ao carregar o script UTMify UTMs:', e)}
      />
      
      {/* Script UTMify Pixel */}
      <Script
        id="utmify-pixel-script"
        src="https://cdn.utmify.com.br/scripts/pixel/pixel.js"
        strategy="afterInteractive"
        onLoad={() => console.log('UTMify Pixel Script carregado')}
        onError={(e) => console.error('Erro ao carregar o script UTMify Pixel:', e)}
      />
    </>
  );
}

export default UtmifyScripts;
