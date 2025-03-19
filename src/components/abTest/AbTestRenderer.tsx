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
  
  // Rastrear visualização da página
  useEffect(() => {
    if (!variant || isTrackingRef.current) return;
    
    // Marcar que estamos rastreando para evitar duplicatas durante o ciclo de vida do componente
    isTrackingRef.current = true;
    
    // Pequeno debounce para garantir que a página foi carregada completamente
    const timer = setTimeout(() => {
      trackEvent(testId, 'pageview');
    }, 300);
    
    return () => clearTimeout(timer);
  }, [testId, trackEvent, variant]);
  
  if (!variant) {
    return <>{fallback}</>;
  }
  
  const VariantComponent = variant.component;
  return <VariantComponent {...variant.props} testId={testId} />;
}
