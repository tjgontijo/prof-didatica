'use client';

import { useState, useEffect } from 'react';
import CtaButton from './CtaButton';

interface FloatingCtaProps {
  paymentLink: string;
}

export default function FloatingCta({ paymentLink }: FloatingCtaProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Função para verificar a posição de scroll e mostrar/esconder o CTA
    const handleScroll = () => {
      // Calcula a porcentagem de scroll da página
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
      
      // Mostrar o CTA quando o usuário rolar mais de 30% da página
      if (scrollPercentage > 90) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    
    // Adicionar event listener para scroll
    window.addEventListener('scroll', handleScroll);
    
    // Verificar posição inicial
    handleScroll();
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 py-4 bg-white/95 shadow-2xl backdrop-blur-sm border-t border-gray-200">
      <div className="container mx-auto px-4">
        <CtaButton 
          paymentLink={paymentLink} 
          text="Comprar Com Desconto" 
          className="max-w-xs mx-auto"
        />
      </div>
    </div>
  );
}
