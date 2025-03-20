"use client";

import { useEffect, useRef } from 'react';
import { useAbTest } from '@/contexts/AbTestContext';

type AbTestRendererProps = {
  testId: string;
  fallback?: React.ReactNode;
};

export default function AbTestRenderer({ testId, fallback }: AbTestRendererProps) {
  const { getVariant, trackEvent } = useAbTest();
  const variant = getVariant(testId);
  const isTrackingRef = useRef(false);
  
  // Log para depuração
  useEffect(() => {
    console.log(`AbTestRenderer montado para o teste ${testId}`);
    console.log(`Variante selecionada:`, variant ? variant.id : 'nenhuma');
    
    return () => {
      console.log(`AbTestRenderer desmontado para o teste ${testId}`);
    };
  }, [testId, variant]);
  
  // Rastrear visualização da página
  useEffect(() => {
    if (!variant) {
      console.warn(`Não foi possível rastrear pageview: nenhuma variante ativa para o teste ${testId}`);
      return;
    }
    
    if (isTrackingRef.current) {
      console.log(`Pageview já rastreado para o teste ${testId}, variante ${variant.id}`);
      return;
    }
    
    // Marcar que estamos rastreando para evitar duplicatas durante o ciclo de vida do componente
    isTrackingRef.current = true;
    
    console.log(`Preparando para rastrear pageview para o teste ${testId}, variante ${variant.id}`);
    
    // Pequeno debounce para garantir que a página foi carregada completamente
    const timer = setTimeout(() => {
      try {
        console.log(`Rastreando pageview para o teste ${testId}, variante ${variant.id}`);
        trackEvent(testId, 'pageview');
      } catch (error) {
        console.error(`Erro ao rastrear pageview para o teste ${testId}:`, error);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [testId, trackEvent, variant]);
  
  if (!variant) {
    console.warn(`Renderizando fallback para o teste ${testId} (nenhuma variante encontrada)`);
    return <>{fallback}</>;
  }
  
  const VariantComponent = variant.component;
  console.log(`Renderizando variante ${variant.id} para o teste ${testId}`);
  return <VariantComponent {...variant.props} testId={testId} />;
}
