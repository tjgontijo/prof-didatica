'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

// Componente LazyImage integrado diretamente
type LazyImageProps = ImageProps & {
  placeholderColor?: string;
};

function LazyImage({
  placeholderColor = '#f3f4f6',
  alt,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Se não estiver no cliente, retorna um placeholder
  if (!isClient) {
    return (
      <div
        className="animate-pulse rounded-xl"
        style={{
          backgroundColor: placeholderColor,
          width: '100%',
          height: '100%',
          position: 'relative',
          borderRadius: '12px',
        }}
        aria-label={alt}
      />
    );
  }

  return (
    <>
      {!isLoaded && (
        <div
          className="animate-pulse rounded-xl"
          style={{
            backgroundColor: placeholderColor,
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            borderRadius: '12px',
            zIndex: 1,
          }}
        />
      )}
      <Image
        alt={alt}
        {...props}
        onLoad={() => setIsLoaded(true)}
        style={{
          ...props.style,
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          zIndex: 2,
          borderRadius: '12px',
        }}
        className={`rounded-xl ${props.className || ''}`}
      />
    </>
  );
}

// Importação dinâmica do componente Carousel para reduzir o JavaScript inicial
const Carousel = dynamic(() => import('./Carousel'), {
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
          <LazyImage 
            src="/images/carrossel/1.webp" 
            alt="Projeto Literário - Imagem 1"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            priority={true}
            className="object-contain"
            placeholderColor="#f0f0f0"
          />
        </div>
      ),
    },
    {
      id: 2,
      content: (
        <div className="relative aspect-square w-full">
          <LazyImage 
            src="/images/carrossel/2.webp" 
            alt="Projeto Literário - Imagem 2"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            loading="lazy"
            className="object-contain"
            placeholderColor="#f0f0f0"
          />
        </div>
      ),
    },
    {
      id: 3,
      content: (
        <div className="relative aspect-square w-full">
          <LazyImage 
            src="/images/carrossel/3.webp" 
            alt="Projeto Literário - Imagem 3"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            loading="lazy"
            className="object-contain"
            placeholderColor="#f0f0f0"
          />
        </div>
      ),
    },
    {
      id: 4,
      content: (
        <div className="relative aspect-square w-full">
          <LazyImage 
            src="/images/carrossel/4.webp" 
            alt="Projeto Literário - Imagem 4"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            loading="lazy"
            className="object-contain"
            placeholderColor="#f0f0f0"
          />
        </div>
      ),
    },
    {
      id: 5,
      content: (
        <div className="relative aspect-square w-full">
          <LazyImage 
            src="/images/carrossel/5.webp" 
            alt="Projeto Literário - Imagem 5"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            loading="lazy"
            className="object-contain"
            placeholderColor="#f0f0f0"
          />
        </div>
      ),
    },
    {
      id: 6,
      content: (
        <div className="relative aspect-square w-full">
          <LazyImage 
            src="/images/carrossel/6.webp" 
            alt="Projeto Literário - Imagem 6"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            loading="lazy"
            className="object-contain"
            placeholderColor="#f0f0f0"
          />
        </div>
      ),
    },
    {
      id: 7,
      content: (
        <div className="relative aspect-square w-full">
          <LazyImage 
            src="/images/carrossel/7.webp" 
            alt="Projeto Literário - Imagem 7"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            loading="lazy"
            className="object-contain"
            placeholderColor="#f0f0f0"
          />
        </div>
      ),
    },
    {
      id: 8,
      content: (
        <div className="relative aspect-square w-full">
          <LazyImage 
            src="/images/carrossel/8.webp" 
            alt="Projeto Literário - Imagem 8"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            loading="lazy"
            className="object-contain"
            placeholderColor="#f0f0f0"
          />
        </div>
      ),
    },
    {
      id: 9,
      content: (
        <div className="relative aspect-square w-full">
          <LazyImage 
            src="/images/carrossel/9.webp" 
            alt="Projeto Literário - Imagem 9"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            loading="lazy"
            className="object-contain"
            placeholderColor="#f0f0f0"
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
        autoplay={false}
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
