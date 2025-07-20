'use client';

import { useState, useEffect } from 'react';
import { FaTag, FaClock, FaWhatsapp } from 'react-icons/fa';

interface FloatingCtaProps {
  paymentLink: string;
}

export default function FloatingCta({ paymentLink }: FloatingCtaProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenActivated, setHasBeenActivated] = useState(false);

  // Inicializa o estado do botão com base na posição inicial do scroll
  useEffect(() => {
    // Verificar a posição inicial do scroll quando o componente é montado
    const initialCheck = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
      
      if (scrollPercentage > 63) {
        setIsVisible(true);
        setHasBeenActivated(true);
      }
    };
    
    // Executar verificação inicial
    initialCheck();
  }, []);

  // Monitorar o scroll para atualizar o estado do botão
  useEffect(() => {    
    const handleScroll = () => {      
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
      
      // Uma vez que o usuário rola até 40% da página, ativamos o botão
      if (scrollPercentage > 40) {
        setIsVisible(true);
        setHasBeenActivated(true); // Marca que o botão já foi ativado pelo menos uma vez
      } else if (!hasBeenActivated) {
        // Só esconde o botão se ele nunca foi ativado antes
        setIsVisible(false);
      }
      // Se hasBeenActivated for true, o botão permanece visível
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
      <div className="container max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#1D3557]">
          <div className="hidden md:flex items-center gap-2 text-[#e63946] font-medium">
            <FaTag className="text-lg" />
            <span>Economize R$20,00</span>
          </div>
          <div className="flex items-center gap-2 text-[#457B9D] font-medium">
            <FaClock className="text-lg animate-pulse" />
            <span>Oferta por tempo limitado</span>
          </div>
        </div>
        <a
          href={paymentLink}
          rel="noopener noreferrer"
          target="_blank"
          className="block w-full md:max-w-xs bg-gradient-to-r from-[#457B9D] to-[#1D3557] hover:from-[#1D3557] hover:to-[#457B9D] text-white text-base sm:text-lg font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden group text-center uppercase"
        >
          <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="relative flex items-center justify-center gap-2">
            COMPRAR COM DESCONTO
          </span>
        </a>
      </div>
    </div>
  );
}
