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

  // Evita erros de hidratação com SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`w-full ${className}`}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={spaceBetween}
        slidesPerView={slidesPerView}
        navigation={navigation}
        pagination={pagination ? { clickable: true } : false}
        loop={loop}
        autoplay={
          autoplay
            ? {
                delay: 3000,
                disableOnInteraction: false,
              }
            : false
        }
        breakpoints={{
          640: {
            slidesPerView: Math.min(2, slidesPerView),
          },
          768: {
            slidesPerView: Math.min(3, slidesPerView),
          },
          1024: {
            slidesPerView: slidesPerView,
          },
        }}
        onSlideChange={onSlideChange}
        className="mySwiper"
      >
        {items.map((item) => (
          <SwiperSlide key={item.id}>
            {item.content}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
