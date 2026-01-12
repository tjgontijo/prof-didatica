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
        <h1 className="text-2xl md:text-4xl font-black tracking-tight text-center text-[#457B9D] mb-4">
          O DESAFIO QUE FAZ A LEITURA VIRAR FEBRE ENTRE OS ALUNOS
        </h1>
        
        <h2 className="text-xl md:text-2xl font-bold tracking-normal text-center bg-yellow-100 px-4 py-3 rounded-md text-[#1D3557] max-w-3xl mx-auto">
          Pronto para imprimir, aplicar e ver até os mais desinteressados entrarem na disputa.
        </h2>
      </div>
      
      
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <p className="text-lg md:text-xl text-[#1D3557] font-normal leading-relaxed">
          Receba imediatamente no seu WhatsApp um kit completo com <strong>20 fichas literárias</strong>,{" "}
          <strong>3 modelos de leiturômetro</strong> e <strong>2 tabelas de acompanhamento</strong> que transformam a leitura em uma divertida competição entre os alunos.
        </p>
        <p className="text-lg text-[#457B9D] font-medium mt-3">
          + <strong>Dois bônus exclusivos!</strong>
        </p>
      </div>     

      
      {/* Texto introdutório para o carrossel */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-[#457B9D] mb-2">VEJA O QUE ESTÁ INCLUINDO NO SEU KIT</h3>
        <div className="h-1 w-24 bg-[#457B9D] mx-auto mb-4 rounded-full"></div>
        <p className="text-lg text-[#1D3557] max-w-2xl mx-auto">Deslize para conhecer o material que já transformou as aulas de leitura de centenas de professores:</p>
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
              {/* Destaque especial - design mais profissional */}
      <div className="max-w-2xl mx-auto my-8">
        <div className="bg-gradient-to-r from-[#f1faee] via-[#a8dadc]/30 to-[#f1faee] py-6 px-4 rounded-lg border border-[#a8dadc] shadow-sm">
          <p className="text-[#1D3557] font-medium text-center">
            <span className="block mb-2 text-[#457B9D] font-bold">TRANSFORME A LEITURA EM UM JOGO DIVERTIDO!</span>
            <strong className="text-[#1D3557] text-lg">Material completo pronto para imprimir</strong> - Sem precisar criar nada do zero
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-3">
            <span className="bg-[#457B9D]/10 text-[#457B9D] text-sm font-medium py-1 px-3 rounded-full">Fácil de aplicar</span>
            <span className="bg-[#457B9D]/10 text-[#457B9D] text-sm font-medium py-1 px-3 rounded-full">Resultados imediatos</span>
            <span className="bg-[#457B9D]/10 text-[#457B9D] text-sm font-medium py-1 px-3 rounded-full">Testado por professores</span>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
