"use client";

import { useEffect } from 'react';
import { useAbTest } from '@/contexts/AbTestContext';

type AbTestRendererProps = {
  testId: string;
  fallback?: React.ReactNode;
};

export default function AbTestRenderer({ testId, fallback }: AbTestRendererProps) {
  const { getVariant, trackEvent } = useAbTest();
  const variant = getVariant(testId);
  
  // Rastrear visualização da página
  useEffect(() => {
    if (!variant) return;
    
    // Registrar visualização da página sem restrições
    const timer = setTimeout(() => {
      trackEvent(testId, 'pageview');
    }, 500);
    
    return () => clearTimeout(timer);
  }, [testId, trackEvent, variant]);
  
  if (!variant) {
    return <>{fallback}</>;
  }
  
  const VariantComponent = variant.component;
  return <VariantComponent {...variant.props} testId={testId} />;
}
