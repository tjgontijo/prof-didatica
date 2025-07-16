'use client';

import { useState, useEffect } from 'react';
import CtaButton from './CtaButton';
import { useAbTracking } from '@/hooks/useAbTracking';

interface FloatingCtaProps {
  paymentLink: string;
}

export default function FloatingCta({ paymentLink }: FloatingCtaProps) {
  const { trackConversion } = useAbTracking('missao-literaria', 'b', { disableAutoViewTracking: true });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {    
    const handleScroll = () => {      
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
      
      if (scrollPercentage > 90) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);

    handleScroll();

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
          onClick={() => {            
            trackConversion();
          }}
        />
      </div>
    </div>
  );
}
