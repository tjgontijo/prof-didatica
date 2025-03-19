import { useCallback, useRef } from 'react';
import { saveAbTestEvent, saveLastClick, hasRecentClick } from '@/utils/storage';

export function useAbTestEvents(testId: string) {
  const isProcessingClick = useRef(false);
  
  // Rastrear clique no botão de compra
  const trackPurchaseClick = useCallback((additionalData = {}) => {
    const now = Date.now();
    
    // Verificar se já enviamos um evento de clique recentemente (dentro de 5 segundos)
    if (hasRecentClick(testId) || isProcessingClick.current) {
      console.log('Clique recente detectado, ignorando');
      return;
    }
    
    // Marcar que estamos processando um clique
    isProcessingClick.current = true;
    
    // Salvar o timestamp do último clique
    saveLastClick(testId, now);
    
    try {
      // Salvar o evento localmente
      saveAbTestEvent({
        testId,
        variantId: localStorage.getItem(`ab_test_variant_${testId}`) || 'unknown',
        eventType: 'initiateCheckout',
        timestamp: now,
        additionalData
      });
      
      console.log('Evento de compra registrado com sucesso');
    } catch (error) {
      console.error('Erro ao processar clique:', error);
    } finally {
      // Liberar o processamento após o envio
      setTimeout(() => {
        isProcessingClick.current = false;
      }, 1000);
    }
  }, [testId]);
  
  // Rastrear outros eventos personalizados
  const trackCustomEvent = useCallback((eventName: string, additionalData = {}) => {
    try {
      // Salvar o evento localmente
      saveAbTestEvent({
        testId,
        variantId: localStorage.getItem(`ab_test_variant_${testId}`) || 'unknown',
        eventType: eventName,
        timestamp: Date.now(),
        additionalData
      });
      
      console.log(`Evento ${eventName} registrado com sucesso`);
    } catch (error) {
      console.error('Erro ao rastrear evento personalizado:', error);
    }
  }, [testId]);
  
  return {
    trackPurchaseClick,
    trackCustomEvent
  };
}
