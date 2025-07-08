'use client';

import { useState, useEffect, useRef } from 'react';
import CtaButton from './CtaButton';

interface FloatingCtaProps {
  paymentLink: string;
}

export default function FloatingCta({ paymentLink }: FloatingCtaProps) {
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  useEffect(() => {
    // Elemento "âncora" para determinar quando mostrar o CTA
    const anchorElement = document.createElement('div');
    anchorElement.style.position = 'absolute';
    // Posicionar aproximadamente onde queremos que o CTA apareça
    anchorElement.style.top = '11500px';
    anchorElement.style.height = '1px';
    document.body.appendChild(anchorElement);
    
    // Configurar IntersectionObserver
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Quando o elemento âncora ficar visível, mostrar o CTA
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        } else if (!entries[0].isIntersecting && window.scrollY < 7500) {
          // Se voltar para cima, esconder o CTA
          setIsVisible(false);
        }
      },
      { threshold: 0.1 }
    );
    
    // Observar o elemento
    observerRef.current.observe(anchorElement);
    
    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      document.body.removeChild(anchorElement);
    };
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 py-8 bg-white/90 shadow-2xl backdrop-blur-sm">
      <CtaButton 
        paymentLink={paymentLink} 
        text="Comprar Com Desconto" 
        className="max-w-xs mx-auto"
      />
    </div>
  );
}
