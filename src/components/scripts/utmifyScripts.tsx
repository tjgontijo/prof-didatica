'use client';
import { useEffect } from 'react';

export const UtmifyScripts = () => {
  useEffect(() => {
    const loadSha256Script = () => {
      return new Promise<string>((resolve, reject) => {
        if (typeof window.sha256 === 'function') {
          console.log('SHA-256 já estava carregado anteriormente');
          resolve('SHA-256 já carregado');
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/js-sha256/src/sha256.min.js';
        script.async = true;
        script.crossOrigin = 'anonymous'; // Adiciona cross-origin para melhor rastreamento

        script.onload = () => {
          console.log('SHA-256 script carregado com sucesso');
          resolve('SHA-256 carregado');
        };

        script.onerror = (error) => {
          console.error('Erro detalhado no carregamento do SHA-256:', error);
          reject('Erro ao carregar SHA-256');
        };

        // Log adicional para rastrear quando o script está sendo adicionado
        console.log('Adicionando script SHA-256 ao documento');
        document.head.appendChild(script);
      });
    };

    const loadUtmifyScripts = () => {
      if (!document.getElementById('utmify-pixel-script')) {
        const pixelScript = document.createElement('script');
        pixelScript.id = 'utmify-pixel-script';
        pixelScript.async = true;
        pixelScript.defer = true;
        pixelScript.src = 'https://cdn.utmify.com.br/scripts/pixel/pixel.js';

        // Adiciona log para rastrear carregamento do pixel script
        pixelScript.onload = () => console.log('UTMify Pixel Script carregado');
        pixelScript.onerror = (error) => console.error('Erro no UTMify Pixel Script:', error);

        document.head.appendChild(pixelScript);
      }

      if (!document.getElementById('utmify-utms-script')) {
        const utmsScript = document.createElement('script');
        utmsScript.id = 'utmify-utms-script';
        utmsScript.async = true;
        utmsScript.defer = true;
        utmsScript.src = 'https://cdn.utmify.com.br/scripts/utms/latest.js';
        utmsScript.setAttribute('data-utmify-prevent-subids', 'true');

        // Adiciona log para rastrear carregamento do UTMS script
        utmsScript.onload = () => console.log('UTMify UTMS Script carregado');
        utmsScript.onerror = (error) => console.error('Erro no UTMify UTMS Script:', error);

        document.head.appendChild(utmsScript);
      }

      // Define o pixel ID globalmente
      window.pixelId = '67c070919d1ed74e56ee2eda';
    };

    const loadScripts = async () => {
      try {
        await Promise.all([loadSha256Script(), loadUtmifyScripts()]);
      } catch (error) {
        console.error('Erro ao carregar scripts:', error);
      }
    };

    loadScripts();

    // Limpeza do observer
    return () => {
      // observer.disconnect();
    };
  }, []);

  return null;
};

export default UtmifyScripts;
