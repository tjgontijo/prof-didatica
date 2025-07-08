'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const CarrosselMissaoLiteraria = dynamic(
  () => import('../carrossel/Carrossel-Missao-Literaria'),
  {
    loading: () => (
      <div className="w-full h-56 flex items-center justify-center bg-gray-100 rounded-lg animate-pulse">
        <div className="w-8 h-8 border-4 border-[#457B9D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    ),
    ssr: false
  }
);

export default function Hero() {
  return (
    <section className="text-center mt-6 mb-20">
      <h1 className="text-2xl md:text-3xl font-black mb-6 md:leading-relaxed leading-normal tracking-tight relative text-[#1D3557]">
        <span className="relative z-10">
          CONHEÇA O PROJETO DE LEITURA QUE FEZ ALUNOS DO{' '}
          <span className="text-[#457B9D] font-extrabold">FUNDAMENTAL 1</span> LEREM{' '}
          <span className="bg-yellow-100 px-1 py-0.5 rounded text-[#1D3557] font-extrabold">
            3X MAIS LIVROS E TEXTOS
          </span>{' '}
          EM MENOS DE{' '}
          <span className="underline decoration-[#a8dadc] decoration-4">5 AULAS</span>
        </span>
      </h1>
      <h2 className="text-lg md:text-xl text-[#1D3557] mb-6 max-w-3xl mx-auto font-normal leading-relaxed">
        Você recebe imediatamente no WhatsApp 20 fichas literárias, dois modelos de leiturômetro pra
        transformar a leitura em uma competição saudável em sala, dois modelos de tabela pra acompanhar tudo e um bônus especial que vou revelar no final dessa página. 
        <br />Prático e direto: imprima e use com seus alunos já na próxima aula.
        <br />Veja abaixo uma amostra do material:
      </h2>      
      <div className="w-full max-w-2xl mx-auto mb-0">
        <Suspense fallback={
          <div className="w-full h-56 flex items-center justify-center bg-gray-100 rounded-lg animate-pulse">
            <div className="w-8 h-8 border-4 border-[#457B9D] border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <CarrosselMissaoLiteraria />
        </Suspense>
      </div>
    </section>
  );
}
