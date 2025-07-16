import { useRef } from 'react';
import { AbEventType } from '@/lib/abTest';

interface AbTrackingOptions {
  disableAutoViewTracking?: boolean;
}

export function useAbTracking(testName: string, variant: string, _options?: AbTrackingOptions) {  
  const viewEventSent = useRef(false);
  const getVisitorId = (): string => {
    if (typeof document === 'undefined') return 'server';
    
    const cookies = document.cookie.split(';');
    const visitorCookie = cookies.find(cookie => cookie.trim().startsWith('visitor-id='));
    
    if (visitorCookie) {
      return visitorCookie.split('=')[1];
    }
    
    return 'unknown';
  };

  const trackEvent = async (event: AbEventType): Promise<void> => {    
    if (event === 'view' && viewEventSent.current) {
      return;
    }
    
    if (event === 'view') {
      viewEventSent.current = true;
    }
    try {
      const visitorId = getVisitorId();
      
      const normalizedTestName = testName.includes('-') 
        ? testName.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
        : testName;
      
      await fetch('/api/ab-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testName: normalizedTestName,
          variant,
          event,
          visitorId
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
