'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

// Componente LazyImage integrado diretamente
type LazyImageProps = ImageProps & {
  placeholderColor?: string;
};

function LazyImage({ placeholderColor = '#f3f4f6', alt, ...props }: LazyImageProps) {
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
const Carrossel = dynamic(() => import('./Carrossel'), {
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
  ssr: false,
});

export default function CarrosselDesafioLiterario() {
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
            src="/images/products/desafio-literario/carrossel/1.webp"
            alt="Missão Literária - Imagem 1"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 700px"
            priority={true}
            className="object-contain"
            placeholder="blur"
            blurDataURL="/images/products/desafio-literario/carrossel/placeholder.webp"
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
            src="/images/products/desafio-literario/carrossel/2.webp"
            alt="Missão Literária - Imagem 2"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 700px"
            loading="lazy"
            className="object-contain"
            placeholder="blur"
            blurDataURL="/images/products/desafio-literario/carrossel/placeholder.webp"
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
            src="/images/products/desafio-literario/carrossel/3.webp"
            alt="Missão Literária - Imagem 3"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 700px"
            loading="lazy"
            className="object-contain"
            placeholder="blur"
            blurDataURL="/images/products/desafio-literario/carrossel/placeholder.webp"
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
            src="/images/products/desafio-literario/carrossel/4.webp"
            alt="Missão Literária - Imagem 4"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 700px"
            loading="lazy"
            className="object-contain"
            placeholder="blur"
            blurDataURL="/images/products/desafio-literario/carrossel/placeholder.webp"
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
            src="/images/products/desafio-literario/carrossel/5.webp"
            alt="Missão Literária - Imagem 5"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 700px"
            loading="lazy"
            className="object-contain"
            placeholder="blur"
            blurDataURL="/images/products/desafio-literario/carrossel/placeholder.webp"
            quality={80}
            placeholderColor="#f0f0f0"
          />
        </div>
      ),
    },
    {
      id: 6,
      content: (
        <div className="relative aspect-[7/10] w-full rounded-md">
          <LazyImage
            src="/images/products/desafio-literario/carrossel/6.webp"
            alt="Missão Literária - Imagem 6"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 700px"
            loading="lazy"
            className="object-contain"
            placeholder="blur"
            blurDataURL="/images/products/desafio-literario/carrossel/placeholder.webp"
            quality={80}
            placeholderColor="#f0f0f0"
          />
        </div>
      ),
    },
    {
      id: 7,
      content: (
        <div className="relative aspect-[7/10] w-full rounded-md">
          <LazyImage
            src="/images/products/desafio-literario/carrossel/7.webp"
            alt="Missão Literária - Imagem 7"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 700px"
            loading="lazy"
            className="object-contain"
            placeholder="blur"
            blurDataURL="/images/products/desafio-literario/carrossel/placeholder.webp"
            quality={80}
            placeholderColor="#f0f0f0"
          />
        </div>
      ),
    },
    {
      id: 8,
      content: (
        <div className="relative aspect-[7/10] w-full rounded-md">
          <LazyImage
            src="/images/products/desafio-literario/carrossel/8.webp"
            alt="Missão Literária - Imagem 8"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 700px"
            loading="lazy"
            className="object-contain"
            placeholder="blur"
            blurDataURL="/images/products/desafio-literario/carrossel/placeholder.webp"
            quality={80}
            placeholderColor="#f0f0f0"
          />
        </div>
      ),
    },
    {
      id: 9,
      content: (
        <div className="relative aspect-[7/10] w-full rounded-md">
          <LazyImage
            src="/images/products/desafio-literario/carrossel/9.webp"
            alt="Missão Literária - Imagem 9"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 700px"
            loading="lazy"
            className="object-contain"
            placeholder="blur"
            blurDataURL="/images/products/desafio-literario/carrossel/placeholder.webp"
            quality={80}
            placeholderColor="#f0f0f0"
          />
        </div>
      ),
    },
    {
      id: 10,
      content: (
        <div className="relative aspect-[7/10] w-full rounded-md">
          <LazyImage
            src="/images/products/desafio-literario/carrossel/10.webp"
            alt="Missão Literária - Imagem 10"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 700px"
            loading="lazy"
            className="object-contain"
            placeholder="blur"
            blurDataURL="/images/products/desafio-literario/carrossel/placeholder.webp"
            quality={80}
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
    <div className="carrossel-projeto space-y-2">
      <Carrossel
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
              activeIndex === index ? 'bg-[#1D3557] w-4' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>{' '}
    </div>
  );
}
