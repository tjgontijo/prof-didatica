import Image from 'next/image';
import CtaButton from '@/components/buttons/CtaButton';
import { FaArrowRight } from 'react-icons/fa';

interface ResultsProps {
  paymentLink: string;
}

export default function Results({ paymentLink }: ResultsProps) {
  return (
    <section className="bg-white rounded-lg shadow-lg p-8 mb-20">
      <h2 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-8 border-b-2 border-[#a8dadc] pb-3 uppercase text-center">
        Resultados comprovados
      </h2>
      <h3 className="font-bold text-xl text-gray-800 mb-6 text-center pb-3">
        💬 Veja o que estão dizendo:
      </h3>

      <div className="flex flex-col gap-6 items-center">
        {/* Prints de WhatsApp e comentários do Instagram em formato vertical */}
        {[...Array(14)].map((_, index) => {
          const imageNumber = (index + 1).toString().padStart(2, '0');
          return (
            <div key={imageNumber} className="w-full max-w-md">
              <Image
                src={`/images/products/missao-literaria/depoimentos/${imageNumber}.webp`}
                alt={`Depoimento ${index + 1} de professor(a) sobre o Missão Literária`}
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
            <div className="flex justify-center mt-3">
              <svg
                className="w-8 h-8 text-[#457B9D] animate-bounce"
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
            <div className="mt-8 max-w-md mx-auto">
              <div className="relative">
                <CtaButton
                  paymentLink={paymentLink}
                  text="QUERO TRANSFORMAR MEUS ALUNOS EM LEITORES"
                  className="shadow-[0_0_15px_rgba(70,123,157,0.5)] border-2 border-white"
                />
                <div className="absolute -top-3 -right-3 bg-[#e63946] text-white text-xs font-bold py-1 px-3 rounded-full shadow-md transform rotate-3">
                  OFERTA ESPECIAL
                </div>
              </div>
              <p className="text-center text-sm text-[#457B9D] mt-3 font-medium flex items-center justify-center gap-1">
                Receba agora mesmo no WhatsApp<FaArrowRight className="ml-1" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
