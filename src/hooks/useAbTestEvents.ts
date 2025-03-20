import { useCallback, useRef, useEffect } from 'react';
import { saveAbTestEvent, saveLastClick, hasRecentClick } from '@/utils/storage';
import { useAbTest } from '@/contexts/AbTestContext';

export function useAbTestEvents(testId: string) {
  const isProcessingClick = useRef(false);
  const { trackEvent, getVariant } = useAbTest();
  
  // Verificar se a variante existe para este teste
  useEffect(() => {
    const variant = getVariant(testId);
    if (!variant) {
      console.warn(`Nenhuma variante ativa encontrada para o teste ${testId}`);
    } else {
      console.log(`Variante ativa para o teste ${testId}:`, variant.id);
    }
  }, [testId, getVariant]);
  
  // Rastrear clique no botão de compra
  const trackPurchaseClick = useCallback((additionalData = {}) => {
    const now = Date.now();
    
    // Verificar se já enviamos um evento de clique recentemente (dentro de 5 segundos)
    if (hasRecentClick(testId) || isProcessingClick.current) {
      console.log('Clique recente detectado, ignorando');
      return;
    }
    
    // Verificar se temos uma variante ativa
    const variant = getVariant(testId);
    if (!variant) {
      console.error(`Não foi possível registrar o clique: nenhuma variante ativa para o teste ${testId}`);
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
        variantId: variant.id,
        eventType: 'initiateCheckout',
        timestamp: now,
        additionalData
      });
      
      console.log('Evento salvo localmente, enviando para o banco de dados...');
      
      // Salvar o evento no banco de dados usando o contexto A/B
      trackEvent(testId, 'initiateCheckout', additionalData);
      
      console.log('Evento de compra registrado com sucesso');
    } catch (error) {
      console.error('Erro ao processar clique:', error);
    } finally {
      // Liberar o processamento após o envio
      setTimeout(() => {
        isProcessingClick.current = false;
      }, 1000);
    }
  }, [testId, trackEvent, getVariant]);
  
  // Rastrear outros eventos personalizados
  const trackCustomEvent = useCallback((eventName: string, additionalData = {}) => {
    // Verificar se temos uma variante ativa
    const variant = getVariant(testId);
    if (!variant) {
      console.error(`Não foi possível registrar o evento ${eventName}: nenhuma variante ativa para o teste ${testId}`);
      return;
    }
    
    try {
      // Salvar o evento localmente
      saveAbTestEvent({
        testId,
        variantId: variant.id,
        eventType: eventName,
        timestamp: Date.now(),
        additionalData
      });
      
      console.log(`Evento ${eventName} salvo localmente, enviando para o banco de dados...`);
      
      // Salvar o evento no banco de dados usando o contexto A/B
      trackEvent(testId, eventName, additionalData);
      
      console.log(`Evento personalizado ${eventName} registrado com sucesso`);
    } catch (error) {
      console.error(`Erro ao registrar evento ${eventName}:`, error);
    }
  }, [testId, trackEvent, getVariant]);
  
  return {
    trackPurchaseClick,
    trackCustomEvent
  };
}
