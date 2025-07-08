import { FaCheck } from 'react-icons/fa';
import OptimizedCountDown from '../countdown/OptimizedCountDown';
import CtaButton from '../buttons/CtaButton';

type Offer = {
  originalPrice: number;
  promotionalPrice: number;
  discount: string;
  paymentLink: string;
};

const offerData: Offer = {
  originalPrice: 17,
  promotionalPrice: 12,
  discount: '30% OFF',
  paymentLink: 'https://seguro.profdidatica.com.br/r/HDJYH7SZJ6?promocode=ML30OFF'  
};

export default function Offer() {
  return (
    <section>
      <div className="bg-white rounded-lg shadow-lg py-16 px-8 mb-20 mt-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-8 border-b-2 border-[#a8dadc] pb-3 uppercase text-center">
          Oferta Especial
        </h2>
        <div className="text-center mb-6 pt-4">
          <h3 className="text-2xl font-bold text-[#457B9D] uppercase tracking-wider">
            Missão Literária
          </h3>
        </div>

        <ul className="space-y-4 mb-8 text-left">
          <li className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f9fa]">
            <FaCheck className="w-5 h-5 text-[#457B9D] mt-0.5 flex-shrink-0" />
            <span className="font-medium text-[#1D3557]">
              20 fichas literárias
            </span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f9fa]">
            <FaCheck className="w-5 h-5 text-[#457B9D] mt-0.5 flex-shrink-0" />
            <span className="font-medium text-[#1D3557]">
              2 modelos de Leiturômetro para gamificação
            </span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f9fa]">
            <FaCheck className="w-5 h-5 text-[#457B9D] mt-0.5 flex-shrink-0" />
            <span className="font-medium text-[#1D3557]">
              Guia de aplicação passo a passo
            </span>
          </li>

          <div className="mt-2 mb-3">
            <span className="text-[#457B9D] font-semibold">
              + Você também receberá um Bônus exclusivo:
            </span>
          </div>

          <li className="flex items-center gap-3 p-3 rounded-lg bg-[#a8dadc]/20">
            <svg
              className="w-5 h-5 text-[#457B9D] flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
            <span className="font-medium text-[#1D3557] text-left">
              Apostila com 50 páginas para produção textual, perfeita para complementar suas aulas e desenvolver a escrita criativa dos alunos.
            </span>
          </li>
          <li className="flex items-center gap-3 p-3 rounded-lg bg-[#a8dadc]/20">
            <svg
              className="w-5 h-5 text-[#457B9D] flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
            <span className="font-medium text-[#1D3557] text-left">
              2 Tabelas de acompanhamento de leitura
            </span>
          </li>
        </ul>

        <div className="text-center mb-6">
          <p className="text-md text-gray-600 mt-2 italic mb-8">
            Um projeto validado por professores, aplicado com sucesso em mais de 15 mil alunos, agora disponível com valor procional.
          </p>
          <div className="inline-block relative">
            <span className="absolute -top-3 -right-10 bg-[#457B9D] text-white text-xs font-bold py-1 px-2 rounded-full transform rotate-12">
              {offerData.discount}
            </span>
            <span className="text-6xl font-black text-[#1D3557]">
              R${offerData.promotionalPrice}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-2 italic">
            Aproveite antes que volte para R${offerData.originalPrice}
          </p>
        </div>

        <CtaButton 
          paymentLink={offerData.paymentLink}
          text="Quero Meus Alunos Apaixonados por Leitura"
        />
        <OptimizedCountDown estoqueInicial={11} estoqueTotal={30} />
      </div>
    </section>
  );
}
