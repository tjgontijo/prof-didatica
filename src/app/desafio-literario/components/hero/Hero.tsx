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
            <div className="flex items-baseline">            
              <span className="text-xs md:text-md">De&nbsp;</span>
              <span className="text-xs md:text-md line-through decoration-red-600 decoration-2">R$</span>
              <span className="text-xl md:text-2xl font-bold line-through decoration-red-600 decoration-2">18</span>
            </div>
            <span className="text-xs md:text-md font-medium">por apenas:</span>
            <div className="flex items-baseline">
              <span className="text-xs md:text-md font-medium">R$</span>
              <span className="text-xl md:text-2xl font-bold">12</span>
            </div>
            </div>
            <Image
              src="/images/products/desafio-literario/lp/hero_mockup.png"
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

      <div className="max-w-3xl mx-auto mb-8 text-center">
        <p className="text-xl md:text-xl text-[#1D3557] font-normal leading-relaxed">
          Receba imediatamente no seu <strong>WhatsApp</strong> o <strong>Projeto de Leitura</strong> completo com: <strong>20 Fichas Literárias</strong>,{" "}
          <strong>3 modelos de Leiturômetro</strong>, <strong>2 Tabelas de Acompanhamento</strong> e mais <strong>4 Bônus complementares</strong> que vão despertar o prazer pela leitura e engajar seus alunos em uma jornada literária envolvente e divertida.
        </p>
      </div>

      {/* CTA centralizado */}
      <div className="text-center mb-8">
        <Link
          href="#plans"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-10 md:px-12 rounded-lg text-lg inline-block transition-all shadow-lg border-2 border-white relative overflow-hidden group"
        >
          <span className="relative z-10">QUERO ADQUIRIR AGORA!</span>
          <span className="absolute inset-0 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
        </Link>
      </div>
    </section>
  );
}
