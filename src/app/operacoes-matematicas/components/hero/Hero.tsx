'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="mt-8 mb-20">
      {/* Tag de urgência */}
      {/* <div className="bg-[#1D3557] text-white py-2 px-4 rounded-lg max-w-max mx-auto mb-4 animate-pulse">
        <p className="text-sm md:text-base font-medium flex items-center">
          <span className="mr-2">🔥</span> Material exclusivo por tempo limitado
        </p>
      </div> */}

      {/* Cabeçalho principal */}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-4xl font-black tracking-tight text-center mb-2 leading-tight">
          <span className="bg-gradient-to-r from-[#457B9D] to-[#1D3557] bg-clip-text text-transparent drop-shadow-sm">
            ACABE COM O "EU ODEIO MATEMÁTICA"
          </span>
        </h1>
        <h2 className="text-xl md:text-2xl font-bold text-center mb-4">
          <span className="inline-block mt-1 bg-[#1D3557] text-white px-4 py-1 rounded-md transform -rotate-2">
            COM PIXEL ART DO FILME <br />DIVERTIDAMENTE II
          </span>
        </h2>
      </div>

      {/* Imagem do mockup do kit */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="relative">
          <div className="relative w-full h-[350px] md:h-[500px] overflow-hidden">
            {/* Selo de preço */}
            <div className="absolute top-0 right-0 md:right-10 z-10 bg-[#457B9D] text-white rounded-full w-24 h-24 md:w-32 md:h-32 flex flex-col items-center justify-center transform rotate-12 shadow-lg border-4 border-white">
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
              src="/images/products/operacoes-matematicas/lp/hero_mockup.webp"
              alt="Kit Operações Matemáticas em Pixel Art"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
              className="object-contain"
              quality={100}
              priority
            />
          </div>
        </div>
      </div>

      {/* Texto persuasivo */}
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <p className="text-lg md:text-xl text-[#1D3557] font-normal leading-relaxed mb-4">
          Transforme as <strong>4 operações básicas</strong> em uma experiência mágica onde cada cálculo correto revela personagens amados do <strong>Divertidamente II</strong>.
        </p>
        <p className="text-lg md:text-xl text-[#1D3557] font-normal leading-relaxed">
          Receba <strong>hoje mesmo</strong> no seu WhatsApp este material exclusivo que une <strong>aprendizado matemático</strong> com <strong>inteligência emocional</strong> pronto para imprimir e usar na sua próxima aula!
        </p>
      </div>

      {/* CTA centralizado */}
      <div className="text-center mb-2">
        <Link
          href="#plans"
          className="hover:bg-[#457B9D] bg-[#1D3557] text-white font-bold py-4 px-10 md:px-12 rounded-lg text-lg inline-block transition-all shadow-lg border-2 border-white relative overflow-hidden group"
        >
          <span className="relative z-10">QUERO ADQUIIR AGORA!</span>
          <span className="absolute inset-0 bg-[#457B9D] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
        </Link>
      </div>

      {/* Microcopy */}
      <div className="text-center">
        <p className="text-sm text-gray-600">Envio imediato após a compra</p>
      </div>
    </section>
  );
}
