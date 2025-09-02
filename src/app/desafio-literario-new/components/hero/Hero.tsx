'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="mt-8 mb-20">
      {/* Cabeçalho principal */}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-4xl font-black tracking-tight text-center mb-4 leading-tight">
          <span className="bg-gradient-to-r from-[#457B9D] to-[#1D3557] bg-clip-text text-transparent drop-shadow-sm">O RECURSO PARA DESPERTAR O AMOR PELA LEITURA</span><br/>
          <span className="text-[#457B9D]">E ENGAJAR SEUS ALUNOS JÁ NAS</span><br/>
          <span className="inline-block mt-1 bg-[#1D3557] text-white px-4 py-1 rounded-md transform -rotate-2">PRIMEIRAS 3 AULAS</span>
        </h1>
      </div>
      {/* Imagem do mockup do kit */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="relative">
          <div className="relative w-full h-[350px] md:h-[500px] overflow-hidden">
            {/* Selo de preço */}
            <div className="absolute top-0 right-0 md:right-10 z-10 bg-green-600 text-white rounded-full w-24 h-24 md:w-32 md:h-32 flex flex-col items-center justify-center transform rotate-12 shadow-lg border-4 border-white ">
              <span className="text-xs font-sans">De <del>R$18</del></span>
              <span className="text-xs md:text-2xl font-medium">por apenas:</span>
              <div className="flex items-baseline">
                <span className="text-xs md:text-2xl font-medium">R$</span>
                <span className="text-xl md:text-3xl font-bold">12</span>
              </div>
            </div>
            <Image
              src="/images/products/desafio-literario/lp/hero_mockup.png"
              alt="Kit Desafio Literário"
              fill
              className="object-contain"
              quality={100}
              priority
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mb-8 text-center">
        <p className="text-lg md:text-xl text-[#1D3557] font-normal leading-relaxed">
          Receba imediatamente no seu WhatsApp o projeto de leitura completo com: <strong>20 fichas literárias</strong>,{" "}
          <strong>3 modelos de leiturômetro</strong> e <strong>2 tabelas de acompanhamento</strong> que despertam o prazer pela leitura e engajam seus alunos em uma jornada literária envolvente.
        </p>
      </div>

      {/* CTA centralizado */}
      <div className="text-center mb-8">
        <Link
          href="#plans"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-4 rounded-lg text-lg inline-block transition-all shadow-lg border-2 border-white relative overflow-hidden group"
        >
          <span className="relative z-10">QUERO ADQUIRIR AGORA!</span>
          <span className="absolute inset-0 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
        </Link>
      </div>
    </section>
  );
}
