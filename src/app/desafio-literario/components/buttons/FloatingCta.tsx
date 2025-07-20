'use client';

import { useState, useEffect } from 'react';
import CtaButton from './CtaButton';
import { FaTag, FaClock } from 'react-icons/fa';

interface FloatingCtaProps {
  paymentLink: string;
}

export default function FloatingCta({ paymentLink }: FloatingCtaProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenActivated, setHasBeenActivated] = useState(false);

  useEffect(() => {    
    const handleScroll = () => {      
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
      
      // Uma vez que o usuário rola até 50% da página, ativamos o botão
      if (scrollPercentage > 63) {
        setIsVisible(true);
        setHasBeenActivated(true); // Marca que o botão já foi ativado pelo menos uma vez
      } else if (!hasBeenActivated) {
        // Só esconde o botão se ele nunca foi ativado antes
        setIsVisible(false);
      }
      // Se hasBeenActivated for true, não escondemos mais o botão, independente da posição do scroll
    };
    
    window.addEventListener('scroll', handleScroll);

    // Verificar a posição inicial do scroll
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasBeenActivated]); // Adicionamos hasBeenActivated como dependência

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 py-3 bg-white/95 shadow-2xl backdrop-blur-sm border-t border-gray-200 transition-all duration-300 ease-in-out">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#1D3557]">
          <div className="hidden md:flex items-center gap-2 text-[#e63946] font-medium">
            <FaTag className="text-lg" />
            <span>Economize R$25,00</span>
          </div>
          <div className="flex items-center gap-2 text-[#457B9D] font-medium">
            <FaClock className="text-lg animate-pulse" />
            <span>Oferta por tempo limitado</span>
          </div>
        </div>
        <CtaButton
          paymentLink={paymentLink}
          text="RECEBER NO WHATSAPP"
          className="md:max-w-xs w-full"
        />
      </div>
    </div>
  );
}
