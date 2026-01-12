'use client';

import Image from 'next/image';

export default function Hero() {
  return (
    <section className="pt-8 pb-12 md:pb-16">
      {/* Cabeçalho principal */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center justify-center mb-4 px-4 py-1 rounded-full bg-dl-primary-100 text-dl-primary-800 text-xs md:text-sm font-semibold uppercase tracking-wide shadow-sm border border-white/60">
          Indicado para Fundamental I e II
        </span>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-center mb-4 leading-tight px-4">
          <span className="text-dl-primary-800">
            Transforme alunos desinteressados em{' '}
          </span>
          <span className="text-dl-warning font-extrabold">
            leitores apaixonados
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mt-4 px-4">
          Sistema completo de gamificação que torna a leitura divertida e engajante.
          <span className="font-bold text-dl-primary-800"> Já aplicável na próxima aula.</span>
        </p>
      </div>

      {/* Imagem do mockup do kit */}
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <div className="relative w-full h-[350px] md:h-[500px] overflow-hidden">
            <Image
              src="/images/products/desafio-literario/lp/hero_mockup.webp"
              alt="Kit Desafio Literário"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
              className="object-contain"
              quality={100}
              priority
            />
          </div>
        </div>
      </div>      
    </section>
  );
}
