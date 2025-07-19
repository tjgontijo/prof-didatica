'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const CarrosselMissaoLiteraria = dynamic(() => import('../carrossel/Carrossel-Desafio-Literario'), {
  loading: () => (
    <div className="w-full h-56 flex items-center justify-center bg-gray-100 rounded-lg animate-pulse">
      <div className="w-8 h-8 border-4 border-[#457B9D] border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
  ssr: false,
});

export default function Hero() {
  return (
    <section className="mt-8 mb-20">
      {/* Cabeçalho principal */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-black md:leading-relaxed leading-normal tracking-tight relative text-[#1D3557]">
          <span className="relative z-10">
            CONHEÇA O DESAFIO DE LEITURA QUE FEZ ALUNOS DO{' '}
            <span className="text-[#457B9D] font-extrabold">FUNDAMENTAL 1</span> LEREM{' '}
            <span className="bg-yellow-100 px-1 py-0.5 rounded text-[#1D3557] font-extrabold">
              3X MAIS LIVROS E TEXTOS
            </span>{' '}
            JÁ NAS PRIMEIRAS{' '}
            <span className="underline decoration-[#a8dadc] decoration-4">SEMANAS</span> SEM QUE VOCÊ TENHA QUE MONTAR NADA
          </span>
        </h1>
      </div>
      
      
      <div className="max-w-3xl mx-auto mb-6 text-center">
        <p className="text-lg md:text-xl text-[#1D3557] font-normal leading-relaxed">
          Você recebe imediatamente no WhatsApp <strong>20 fichas literárias</strong>,{' '}
          <strong>3 modelos de leiturômetro</strong>, <strong>2 modelos de tabela</strong> para
          acompanhar o progresso dos alunos e um <strong>bônus especial</strong> que vou revelar no
          final dessa página.
        </p>
      </div>
      
      {/* Destaque especial - design mais profissional */}
      <div className="max-w-2xl mx-auto my-8">
        <div className="bg-gradient-to-r from-[#f1faee] via-[#a8dadc]/30 to-[#f1faee] py-4 text-center">
          <p className="text-[#1D3557] font-medium">
            <em>Prático e direto:</em> <strong className="text-[#457B9D]">imprima e use com seus alunos já na próxima aula!</strong>
          </p>
        </div>
      </div>
      
      {/* Texto introdutório para o carrossel */}
      <div className="text-center mb-6">
        <p className="text-lg text-[#1D3557]">Veja abaixo uma amostra do material:</p>
      </div>
      
      {/* Carrossel de imagens */}
      <div className="w-full max-w-2xl mx-auto">
        <Suspense
          fallback={
            <div className="w-full h-56 flex items-center justify-center bg-gray-100 rounded-lg animate-pulse">
              <div className="w-8 h-8 border-4 border-[#457B9D] border-t-transparent rounded-full animate-spin"></div>
            </div>
          }
        >
          <CarrosselMissaoLiteraria />
        </Suspense>
      </div>
    </section>
  );
}
