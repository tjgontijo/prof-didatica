'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Importações de estilos do Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface CarouselProps {
  items: {
    id: string | number;
    content: ReactNode;
  }[];
  slidesPerView?: number;
  spaceBetween?: number;
  autoplay?: boolean;
  loop?: boolean;
  navigation?: boolean;
  pagination?: boolean;
  className?: string;
  onSlideChange?: (swiper: SwiperType) => void;
}

export default function Carousel({
  items,
  slidesPerView = 1,
  spaceBetween = 30,
  autoplay = true,
  loop = true,
  navigation = true,
  pagination = true,
  className = '',
  onSlideChange,
}: CarouselProps) {
  const [mounted, setMounted] = useState(false);

  // Só renderiza o Swiper no lado do cliente para evitar erros de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  // Configuração de autoplay otimizada
  const autoplayConfig = autoplay
    ? {
        delay: 3000,
        disableOnInteraction: false,
      }
    : false;

  // Configuração de paginação otimizada
  const paginationConfig = pagination ? { clickable: true } : false;

  // Breakpoints otimizados
  const breakpoints = {
    640: {
      slidesPerView: Math.min(2, slidesPerView),
    },
    768: {
      slidesPerView: Math.min(3, slidesPerView),
    },
    1024: {
      slidesPerView: slidesPerView,
    },
  };

  if (!mounted) {
    // Renderiza um placeholder até que o componente seja montado no cliente
    return (
      <div className={`w-full ${className} bg-gray-100 animate-pulse`} 
           style={{ height: '300px' }}>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={spaceBetween}
        slidesPerView={slidesPerView}
        navigation={navigation}
        pagination={paginationConfig}
        loop={loop}
        autoplay={autoplayConfig}
        breakpoints={breakpoints}
        onSlideChange={onSlideChange}
        className="mySwiper"
      >
        {items.map((item) => (
          <SwiperSlide key={item.id}>{item.content}</SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
