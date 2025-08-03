'use client';
import { useEffect } from 'react';

interface Elev8TrackingScriptProps {
  pixelId: string;
}

export const Elev8TrackingScript = ({ pixelId }: Elev8TrackingScriptProps) => {
  useEffect(() => {
    // Verifica se o script já foi carregado
    if (document.getElementById('elev8-tracking-script')) {
      console.log('Script de tracking Elev8 já carregado');
      return;
    }

    // Função para garantir que o script seja carregado apenas uma vez
    const loadElev8TrackingScript = () => {
      // Cria o elemento script
      const script = document.createElement('script');
      script.id = 'elev8-tracking-script';
      script.src = 'https://cdn.elev8.com.br/tracking.min.js';
      script.async = true;
      
      // Adiciona o atributo pixel-id - IMPORTANTE: o script busca este atributo
      script.setAttribute('pixel-id', pixelId);
      
      // Adiciona logs para monitorar o carregamento
      script.onload = () => {
        console.log('Script de tracking Elev8 carregado com sucesso');
        
        // Verifica se o script inicializou corretamente
        if (window.trackingDebug) {
          console.log('Tracking debug disponível:', window.trackingDebug);
        }
      };
      
      script.onerror = (error) => {
        console.error('Erro ao carregar script de tracking Elev8:', error);
      };
      
      // Adiciona o script ao documento
      document.head.appendChild(script);
    };

    // Verifica se o DOM está pronto antes de carregar o script
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadElev8TrackingScript);
    } else {
      loadElev8TrackingScript();
    }

    // Função de limpeza
    return () => {
      document.removeEventListener('DOMContentLoaded', loadElev8TrackingScript);
    };
  }, [pixelId]); // Dependência no pixelId para recarregar se mudar

  return null;
};

// Adiciona a declaração de tipo para a propriedade trackingDebug no objeto window
declare global {
  interface Window {
    trackingDebug?: {
      getUTMParams: () => Record<string, string>;
      getOriginalUTMParams: () => Record<string, string>;
      clearUTMParams: () => void;
      getUserData: () => Record<string, unknown>;
      sendTestEvent: (event: string, data?: Record<string, unknown>) => Promise<unknown>;
      getLogs: () => unknown[];
      enableDebug: () => string;
      disableDebug: () => string;
      isDebugEnabled: () => boolean;
    };
    UTMManager?: {
      params: Map<string, string>;
      originalParams: Map<string, string>;
      getParamValue: (param: string) => string | null;
      getAllParams: () => Record<string, string>;
      getOriginalParams: () => Record<string, string>;
      buildURLWithParams: (url: string) => string;
      setParam: (key: string, value: string) => void;
      clearParams: () => void;
    };
    UTMDOMManager?: {
      processLink: (element: HTMLElement) => void;
      processForm: (element: HTMLFormElement) => void;
      processIframe: (element: HTMLIFrameElement) => void;
    };
    fbq?: (type: "track" | "trackCustom", eventName: string, data?: Record<string, string | number | undefined>) => void;
    pixelId?: string | null;
    __eventSent?: Record<string, boolean>;
    __utmLogs?: unknown[];
    external_id?: string;
    sha256?: (input: string) => string;
  }
}

export default Elev8TrackingScript;
