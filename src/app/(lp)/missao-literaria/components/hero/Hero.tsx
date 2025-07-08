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
          JÁ NAS PRIMEIRAS{' '}
          <span className="underline decoration-[#a8dadc] decoration-4">AULAS</span>
        </span>
      </h1>
      <h2 className="text-lg md:text-xl text-[#1D3557] mb-6 max-w-3xl mx-auto font-normal leading-relaxed">
        Você recebe imediatamente no WhatsApp <strong>20 fichas literárias</strong>, <strong> 2 modelos de leiturômetro</strong>, <strong> 2 modelos de tabela</strong> para acompanhar o progresso dos alunos e um <strong>bônus especial</strong> que vou revelar no final dessa página. 
        <br /><div className="my-3 py-2 px-4 bg-yellow-100 rounded-lg inline-block font-semibold text-[#1D3557] border-l-4 border-[#457B9D] shadow-sm">Prático e direto: imprima e use com seus alunos já na próxima aula!</div>
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
