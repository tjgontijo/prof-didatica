'use client';

import Image from 'next/image';
import CtaButton from '@/components/buttons/CtaButton';
import { useState, useEffect } from 'react';

export default function Results() {
  // Depoimentos fixos para hidratação consistente
  const [testimonials, setTestimonials] = useState([1, 2, 3, 4]);

  // Randomiza apenas no cliente após montagem
  useEffect(() => {
    const totalTestimonials = 14;
    const numberOfTestimonials = 4;
    const allIndexes = Array.from({ length: totalTestimonials }, (_, i) => i + 1);

    // Embaralha e pega os primeiros 4
    const shuffled = allIndexes.sort(() => Math.random() - 0.5);
    setTestimonials(shuffled.slice(0, numberOfTestimonials));
  }, []);

  return (
    <section className="bg-dl-bg-lavender py-12 px-3 md:py-16">
      <div className="container mx-auto px-3 max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold text-dl-primary-800 mb-8 border-b-2 border-dl-primary-100 pb-3 uppercase text-center">
          Resultados comprovados
        </h2>
      <h3 className="font-bold text-xl text-gray-800 mb-6 text-center pb-3">
        💬 Veja o que estão dizendo:
      </h3>

      <div className="flex flex-col gap-6 items-center">
        {/* Exibe 4 depoimentos aleatórios */}
        {testimonials.map((testimonialNumber: number) => {
          const imageNumber = testimonialNumber.toString().padStart(2, '0');
          return (
            <div key={imageNumber} className="w-full max-w-md">
              <Image
                src={`/images/products/missao-literaria/depoimentos/${imageNumber}.webp`}
                alt={`Depoimento ${testimonialNumber} de professor(a) sobre o Missão Literária`}
                width={400}
                height={0}
                sizes="(max-width: 768px) 100vw, 400px"
                style={{ width: '100%', height: 'auto' }}
                className="rounded-lg shadow-md"
                loading="lazy"
              />
            </div>
          );
        })}
      </div>

      {/* Frase instigante para antecipar a seção de oferta */}
      <div className="mt-12 mb-6 max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] p-1 rounded-xl shadow-lg">
          <div className="bg-white p-5 rounded-lg">
            <p className="text-center text-xl md:text-2xl font-bold text-[#1D3557]">
              Chegou a hora de ter acesso ao{' '}
              <span className="text-[#e63946] font-extrabold">mesmo material</span> e transformar
              seus alunos em{' '}
              <span className="text-[#e63946] font-extrabold">leitores apaixonados!</span>
            </p>
            <div className="flex justify-center mt-4">
              <svg
                className="w-12 h-12 text-[#457B9D] animate-bounce"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M15.707 4.293a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L10 8.586l4.293-4.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>

            {/* CTA Button */}
            <div className="mt-0 max-w-md mx-auto">              
                <CtaButton
                  paymentLink="https://seguro.profdidatica.com.br/r/D6B9TPX140"
                  text="COMPRAR AGORA"
                  className="shadow-[0_0_15px_rgba(70,123,157,0.5)] border-2 border-white"
                />
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
