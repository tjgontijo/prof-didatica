'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';

// Importação dinâmica dos módulos do Swiper para reduzir o JavaScript
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

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
  autoplay = false, // Desativado por padrão para melhor performance
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
        disableOnInteraction: true,
      }
    : false;

  // Configuração de paginação otimizada
  const paginationConfig = pagination ? { clickable: true } : false;

  // Módulos a serem carregados (carrega apenas os necessários)
  const modules = [];
  if (navigation) modules.push(Navigation);
  if (pagination) modules.push(Pagination);
  if (autoplay) modules.push(Autoplay);

  // Breakpoints otimizados para responsividade
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
    return <div className={`w-full ${className} carrossel-placeholder`}></div>;
  }

  return (
    <div className={`w-full ${className}`}>
      <Swiper
        modules={modules}
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
