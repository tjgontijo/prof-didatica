import { useRef, useEffect } from 'react';
import { AbEventType } from '@/lib/abTest';
import { initTrackingSession, getTrackingSession } from '@/services/trackingService';

interface AbTrackingOptions {
  disableAutoViewTracking?: boolean;
}

export function useAbTracking(testName: string, variant: string, _options?: AbTrackingOptions) {  
  const viewEventSent = useRef(false);
  
  // Inicializar a sessão de rastreamento quando o hook é montado
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Inicializa ou recupera a sessão de rastreamento com os dados do teste
      // Isso vai ler os cookies definidos pelo middleware e salvar no localStorage
      initTrackingSession(testName, variant);
    }
  }, [testName, variant]);

  const trackEvent = async (event: AbEventType): Promise<void> => {    
    if (event === 'view' && viewEventSent.current) {
      return;
    }
    
    if (event === 'view') {
      viewEventSent.current = true;
    }
    
    try {
      // Obter a sessão de rastreamento do localStorage
      const session = getTrackingSession();
      
      if (!session) {
        console.error('Sessão de rastreamento não encontrada');
        return;
      }
      
      const normalizedTestName = testName.includes('-') 
        ? testName.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
        : testName;
      
      // Extrair os dados relevantes da sessão
      const {
        sessionId,
        visitorId,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmTerm,
        fbclid
      } = session;
      
      await fetch('/api/ab-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testName: normalizedTestName,
          variant,
          event,
          sessionId,
          visitorId,
          utmSource,
          utmMedium,
          utmCampaign,
          utmContent,
          utmTerm,
          fbclid
        })
      });
    } catch (error) {
      console.error('Erro ao rastrear evento A/B:', error);
    }
  };

  // Não dispara o evento de visualização automaticamente
  
  const trackConversion = () => trackEvent('conversion');
  const trackView = () => trackEvent('view');

  return { trackConversion, trackView };
}
