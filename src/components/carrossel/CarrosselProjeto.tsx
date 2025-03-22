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
const Carousel = dynamic(() => import('./carousel'), {
  loading: () => (
    <div 
      className="carrossel-placeholder relative aspect-[7/10] w-full bg-gray-200 animate-pulse rounded-md"
      aria-label="Carregando carrossel"
    >
      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
        <span className="text-sm">Carregando...</span>
      </div>
    </div>
  ),
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
    
  const imagens = [
    {
      id: 1,
      content: (
        <div className="relative aspect-[7/10] w-full rounded-md">
          <LazyImage 
            src="/images/carrossel/1.webp" 
            alt="Projeto Literário - Imagem 1"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 700px"
            priority={true}
            className="object-contain"
            placeholder="blur"
            blurDataURL="/images/carrossel/1-placeholder.webp"
            quality={80}
            placeholderColor="#f0f0f0"
          />
        </div>
      ),
    },
    {
      id: 2,
      content: (
        <div className="relative aspect-[7/10] w-full rounded-md">
          <LazyImage 
            src="/images/carrossel/2.webp" 
            alt="Projeto Literário - Imagem 2"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 700px"
            loading="lazy"
            className="object-contain"
            placeholder="blur"
            blurDataURL="/images/carrossel/2-placeholder.webp"
            quality={80}
            placeholderColor="#f0f0f0"
          />
        </div>
      ),
    },
    {
      id: 3,
      content: (
        <div className="relative aspect-[7/10] w-full rounded-md">
          <LazyImage 
            src="/images/carrossel/3.webp" 
            alt="Projeto Literário - Imagem 3"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 700px"
            loading="lazy"
            className="object-contain"
            placeholder="blur"
            blurDataURL="/images/carrossel/3-placeholder.webp"
            quality={80}
            placeholderColor="#f0f0f0"
          />
        </div>
      ),
    },
    {
      id: 4,
      content: (
        <div className="relative aspect-[7/10] w-full rounded-md">
          <LazyImage 
            src="/images/carrossel/4.webp" 
            alt="Projeto Literário - Imagem 4"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 700px"
            loading="lazy"
            className="object-contain"
            placeholder="blur"
            blurDataURL="/images/carrossel/4-placeholder.webp"
            quality={80}
            placeholderColor="#f0f0f0"
          />
        </div>
      ),
    },
    {
      id: 5,
      content: (
        <div className="relative aspect-[7/10] w-full rounded-md">
          <LazyImage 
            src="/images/carrossel/5.webp" 
            alt="Projeto Literário - Imagem 5"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 700px"
            loading="lazy"
            className="object-contain"
            placeholder="blur"
            blurDataURL="/images/carrossel/5-placeholder.webp"
            quality={80}
            placeholderColor="#f0f0f0"
          />
        </div>
      )
    }
  ];

  // Se não estiver no cliente, mostra um placeholder
  if (!isClient) {
    return <div className="carrossel-placeholder"></div>;
  }

  return (
    <div className="carrossel-projeto space-y-2">
      <Carousel 
        items={imagens} 
        slidesPerView={1}
        navigation={false}
        pagination={false} 
        autoplay={true}
        loop={true}
        className="carrossel-personalizado"
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      />
      
      {/* Paginação externa */}
      <div className="flex justify-center gap-2">
        {imagens.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              activeIndex === index 
                ? 'bg-[#1D3557] w-4' 
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>    </div>
  );
}
