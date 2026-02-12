'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Importação dinâmica do componente Carrossel
const Carrossel = dynamic(
  () => import('../../../desafio-literario/components/carrossel/Carrossel'),
  {
    loading: () => (
      <div className="carrossel-placeholder relative aspect-video w-full bg-gray-200 animate-pulse rounded-md">
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <span className="text-sm">Carregando...</span>
        </div>
      </div>
    ),
    ssr: false,
  }
);

interface CarrosselItem {
  id: number;
  imageSrc: string;
  alt: string;
  legenda: string;
  descricao: string;
}

export default function Demo() {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .swiper-custom-arrows .swiper-button-next,
      .swiper-custom-arrows .swiper-button-prev {
        width: 44px;
        height: 44px;
      }
      .swiper-custom-arrows .swiper-button-next:after,
      .swiper-custom-arrows .swiper-button-prev:after {
        font-size: 20px;
        font-weight: bold;
        color: #457B9D;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const itensCarrossel: CarrosselItem[] = [
    {
      id: 1,
      imageSrc: "https://images.yampi.me/assets/stores/prof-didatica/uploads/images/operacoes-matematicas-em-pixel-art-divertidamente-ii-67032d0b836a6-large.png",
      alt: "Atividade — Alegria",
      legenda: "Kit Completo",
      descricao: "Material completo com 18 folhinhas de atividades abrangendo as 4 operações matemáticas."
    },
    {
      id: 2,
      imageSrc: "https://images.yampi.me/assets/stores/prof-didatica/uploads/images/operacoes-matematicas-em-pixel-art-divertidamente-ii-6704371bdc939-large.jpg",
      alt: "Atividade — Multiplicação",
      legenda: "Desafio de Multiplicação",
      descricao: "Os alunos resolvem as multiplicações para descobrir as cores e preencher os pixels."
    },
    {
      id: 3,
      imageSrc: "https://images.yampi.me/assets/stores/prof-didatica/uploads/images/operacoes-matematicas-em-pixel-art-divertidamente-ii-67032d0b65fbd-large.png",
      alt: "Atividade — Detalhe",
      legenda: "Aprenda Brincando",
      descricao: "Personagens queridos que criam conexão e motivação imediata nos alunos."
    },
    {
      id: 4,
      imageSrc: "https://images.yampi.me/assets/stores/prof-didatica/uploads/images/operacoes-matematicas-em-pixel-art-divertidamente-ii-6704371c43f1d-large.jpg",
      alt: "Atividade — Divisão",
      legenda: "Prática de Divisão",
      descricao: "Operações de divisão integradas ao desenho para tornar o aprendizado leve."
    },
    {
      id: 5,
      imageSrc: "https://images.yampi.me/assets/stores/prof-didatica/uploads/images/operacoes-matematicas-em-pixel-art-divertidamente-ii-67032d0b03a5f-large.png",
      alt: "Atividade — Resultado",
      legenda: "Resultado Encantador",
      descricao: "Veja como ficam os personagens após a resolução correta de todas as operações."
    },
    {
      id: 6,
      imageSrc: "https://images.yampi.me/assets/stores/prof-didatica/uploads/images/operacoes-matematicas-em-pixel-art-divertidamente-ii-670437140748b-large.jpg",
      alt: "Atividade — Subtração",
      legenda: "Operações Diversificadas",
      descricao: "Cada folhinha traz um desafio diferente, mantendo o interesse da turma."
    },
  ];

  const carrosselItems = itensCarrossel.map((item) => ({
    id: item.id,
    content: (
      <div className="flex flex-col items-center w-full">
        <div className="relative aspect-[7/10] w-full h-[500px] rounded-md">
          <Image
            src={item.imageSrc}
            alt={item.alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 700px"
            className="object-contain rounded-md"
            priority={item.id === 1}
            loading={item.id === 1 ? "eager" : "lazy"}
          />
          <div className="absolute top-2 right-2 bg-[#1D3557] text-white px-2 py-1 rounded-md text-sm font-medium">
            {item.id}/6
          </div>
        </div>
      </div>
    ),
  }));

  if (!isClient) {
    return <div className="demo-placeholder h-96"></div>;
  }

  return (
    <section id="demo" className="py-12 px-3 md:py-16 bg-dl-primary-50">
      <div className="container mx-auto px-3 max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-dl-primary-800 mb-4 uppercase">
            Veja o material que você vai receber
          </h2>
        </div>

        <div>
          <Carrossel
            items={carrosselItems}
            slidesPerView={1}
            navigation={true}
            pagination={false}
            autoplay={false}
            loop={true}
            zoom={true}
            className="demo-carrossel swiper-custom-arrows"
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          />

          <div className="flex justify-center gap-1 mt-6">
            {itensCarrossel.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={`Ir para slide ${index + 1}`}
              >
                <span
                  className={`block rounded-full transition-all ${activeIndex === index
                    ? 'bg-[#457B9D] w-4 h-2'
                    : 'bg-gray-300 hover:bg-gray-400 w-2 h-2'
                    }`}
                />
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <h3 className="text-xl font-bold text-dl-primary-500">
              {itensCarrossel[activeIndex].legenda}
            </h3>
            <p className="mt-2 text-gray-700">
              {itensCarrossel[activeIndex].descricao}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
