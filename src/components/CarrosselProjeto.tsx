'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import './carrossel/carrossel-projeto-otimizado.css'; 

// Importação dinâmica do componente Carousel para reduzir o JavaScript inicial
const Carousel = dynamic(() => import('./carrossel/Carousel'), {
  loading: () => <div className="carrossel-placeholder"></div>,
  ssr: false
});

export default function CarrosselProjeto() {
  // Estado para controlar a paginação externa
  const [activeIndex, setActiveIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  // Garantir que o componente só seja renderizado no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Array com as imagens do carrossel
  const imagens = [
    {
      id: 1,
      content: (
        <div className="relative aspect-square w-full">
          <Image 
            src="/images/carrossel/2.png" 
            alt="Projeto Literário - Imagem 1"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            priority={true}
            className="object-contain"
          />
        </div>
      ),
    },
    {
      id: 2,
      content: (
        <div className="relative aspect-square w-full">
          <Image 
            src="/images/carrossel/3.png" 
            alt="Projeto Literário - Imagem 2"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            loading="lazy"
            className="object-contain"
          />
        </div>
      ),
    },
    {
      id: 3,
      content: (
        <div className="relative aspect-square w-full">
          <Image 
            src="/images/carrossel/5.png" 
            alt="Projeto Literário - Imagem 3"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            loading="lazy"
            className="object-contain"
          />
        </div>
      ),
    },
    {
      id: 4,
      content: (
        <div className="relative aspect-square w-full">
          <Image 
            src="/images/carrossel/6.png" 
            alt="Projeto Literário - Imagem 4"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            loading="lazy"
            className="object-contain"
          />
        </div>
      ),
    },
    {
      id: 5,
      content: (
        <div className="relative aspect-square w-full">
          <Image 
            src="/images/carrossel/8.png" 
            alt="Projeto Literário - Imagem 5"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            loading="lazy"
            className="object-contain"
          />
        </div>
      ),
    },
    {
      id: 6,
      content: (
        <div className="relative aspect-square w-full">
          <Image 
            src="/images/carrossel/9.png" 
            alt="Projeto Literário - Imagem 6"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            loading="lazy"
            className="object-contain"
          />
        </div>
      ),
    },
    {
      id: 7,
      content: (
        <div className="relative aspect-square w-full">
          <Image 
            src="/images/carrossel/10.png" 
            alt="Projeto Literário - Imagem 7"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            loading="lazy"
            className="object-contain"
          />
        </div>
      ),
    },
    {
      id: 8,
      content: (
        <div className="relative aspect-square w-full">
          <Image 
            src="/images/carrossel/11.png" 
            alt="Projeto Literário - Imagem 8"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            loading="lazy"
            className="object-contain"
          />
        </div>
      ),
    },
  ];

  // Se não estiver no cliente, mostra um placeholder
  if (!isClient) {
    return <div className="carrossel-placeholder"></div>;
  }

  return (
    <div className="carrossel-projeto">
      <Carousel 
        items={imagens} 
        slidesPerView={1}
        navigation={true}
        pagination={false} 
        autoplay={true}
        loop={true}
        className="py-4 carrossel-personalizado"
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      />
      
      {/* Paginação externa */}
      <div className="flex justify-center gap-2 mt-4">
        {imagens.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              activeIndex === index 
                ? 'bg-[#1D3557] w-4' 
                : 'bg-[#A8DADC]'
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
