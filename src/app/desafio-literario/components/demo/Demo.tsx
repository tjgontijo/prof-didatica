'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Importação dinâmica do componente Carrossel
const Carrossel = dynamic(
  () => import('../carrossel/Carrossel'),
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

// Tipo para os itens do carrossel com legenda
interface CarrosselItem {
  id: number;
  imageSrc: string;
  alt: string;
  legenda: string;
  descricao: string;
}

export default function Demo() {
  // Adicionar estilos CSS para reduzir o tamanho das setas de navegação
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .swiper-custom-arrows .swiper-button-next,
      .swiper-custom-arrows .swiper-button-prev {
        width: 30px;
        height: 30px;
      }
      .swiper-custom-arrows .swiper-button-next:after,
      .swiper-custom-arrows .swiper-button-prev:after {
        font-size: 16px;
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

  // Garantir que o componente só seja renderizado no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Dados do carrossel com legendas
  const itensCarrossel: CarrosselItem[] = [
    {
      id: 1,
      imageSrc: "/images/products/desafio-literario/carrossel/1.webp",
      alt: "Projeto Desafio Literário",
      legenda: "Projeto Desafio Literário",
      descricao: "Projeto desenvolvido para estimular e incentivar a leitura entre os alunos."
    },
    {
      id: 2,
      imageSrc: "/images/products/desafio-literario/carrossel/2.webp",
      alt: "Ficha Literária 01",
      legenda: "Ficha Literária 01",
      descricao: "Exemplo de uma Ficha Literária que estimula o aluno a se recordar dos personagens principais, o que ele aprendeu sobre a historia e treinar a ordem alfabetica"
    },   
    {
      id: 6,
      imageSrc: "/images/products/desafio-literario/carrossel/6.webp",
      alt: "Ficha Literária 20",
      legenda: "Ficha Literária 20",
      descricao: "Exemplo de uma Ficha Literária que trata sobre antônimos, estimula a imaginação com desenhos  e também com sugestões do que que ele poderia dar de dica para um dos personagens do livro."
    },
    {
      id: 7,
      imageSrc: "/images/products/desafio-literario/carrossel/7.webp",
      alt: "Leiturômetro - Modelo 01",
      legenda: "Leiturômetro - Modelo 01",
      descricao: "Exemplo de Leiturômetro que mostra o progresso do aluno em uma leitura."
    },
    {
      id: 8,
      imageSrc: "/images/products/desafio-literario/carrossel/8.webp",
      alt: "Leiturômetro - Modelo 02",
      legenda: "Leiturômetro - Modelo 02",
      descricao: "Exemplo de Leiturômetro que mostra o progresso do aluno em uma leitura."
    },
    {
      id: 9,
      imageSrc: "/images/products/desafio-literario/carrossel/9.webp",
      alt: "Leiturômetro - Modelo 03",
      legenda: "Leiturômetro - Modelo 03",
      descricao: "Exemplo de Leiturômetro que mostra o progresso do aluno em uma leitura."
    },
    {
      id: 10,
      imageSrc: "/images/products/desafio-literario/carrossel/10.webp",
      alt: "Tabela em PDF para acompanhar o progresso do aluno",
      legenda: "Tabela em PDF para acompanhar o progresso do aluno",
      descricao: "Exemplo de Tabela em PDF para acompanhar o progresso do aluno."
    },
  ];

  // Transformar os itens para o formato aceito pelo componente Carrossel
  const carrosselItems = itensCarrossel.map((item) => ({
    id: item.id,
    content: (
      <div className="flex flex-col items-center">
        <div className="relative aspect-[7/10] w-full rounded-md">
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
            {item.id}/10
          </div>
        </div>
      </div>
    ),
  }));

  // Se não estiver no cliente, mostra um placeholder
  if (!isClient) {
    return <div className="demo-placeholder h-96"></div>;
  }

  return (
    <section id="demo" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1D3557] mb-4">
            VEJA UMA AMOSTRA DOS MATERIAIS QUE VOCÊ VAI RECEBER
          </h2>
          <p className="text-xl text-[#457B9D] max-w-3xl mx-auto">
          Enviado para o seu WhatsApp pronto para imprimir e aplicar já na sua próxima aula
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Carrossel
            items={carrosselItems}
            slidesPerView={1}
            navigation={true}
            pagination={false}
            autoplay={true}
            loop={true}
            className="demo-carrossel swiper-custom-arrows"
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          />

          {/* Paginação personalizada com pontinhos */}
          <div className="flex justify-center gap-2 mt-6">
            {itensCarrossel.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeIndex === index
                    ? 'bg-[#457B9D] w-4'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Legenda atual */}
          <div className="mt-8 text-center">
            <h3 className="text-xl font-bold text-[#457B9D]">
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
