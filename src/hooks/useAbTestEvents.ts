import { useCallback, useRef } from 'react';
import { useAbTest } from '@/contexts/AbTestContext';

export function useAbTestEvents(testId: string) {
  const { trackEvent } = useAbTest();
  const lastClickTime = useRef(0);
  const isProcessingClick = useRef(false);
  
  // Rastrear clique no botão de compra
  const trackPurchaseClick = useCallback((additionalData = {}) => {
    const now = Date.now();
    
    // Verificar se já enviamos um evento de clique recentemente (dentro de 5 segundos)
    if (now - lastClickTime.current < 5000 || isProcessingClick.current) {
      return;
    }
    
    // Marcar que estamos processando um clique
    isProcessingClick.current = true;
    lastClickTime.current = now;
    
    // Armazenar o último clique para evitar duplicações em navegações rápidas
    const clickKey = `ab_test_purchase_click_${testId}`;
    localStorage.setItem(clickKey, now.toString());
    
    // Enviar o evento
    trackEvent(testId, 'initiateCheckout', additionalData)
      .finally(() => {
        // Liberar o processamento após o envio
        setTimeout(() => {
          isProcessingClick.current = false;
        }, 1000);
      });
  }, [testId, trackEvent]);
  
  // Rastrear outros eventos personalizados
  const trackCustomEvent = useCallback((eventName: string, additionalData = {}) => {
    trackEvent(testId, eventName, additionalData);
  }, [testId, trackEvent]);
  
  return {
    trackPurchaseClick,
    trackCustomEvent
  };
}
