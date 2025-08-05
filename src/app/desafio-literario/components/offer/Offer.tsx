import { FaCheck } from 'react-icons/fa';
import Image from 'next/image';
import OptimizedCountDown from '../countdown/OptimizedCountDown';
import CtaButton from '@/components/buttons/CtaButton';

// Usando os tipos definidos na página principal
interface OfferProps {
  offerData: {
    originalPrice: number;
    promotionalPrice: number;
    discount: string;
    paymentLink: string;
  };
  bonusData: Array<{
    title: string;
    description: string;
    value: number;
    imagePath: string;
  }>;
}

export default function Offer({ offerData, bonusData }: OfferProps) {
  return (
    <section>
      <div className="bg-white rounded-lg shadow-lg py-16 px-8 mb-20 mt-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-8 border-b-2 border-[#a8dadc] pb-3 uppercase text-center">
        Transforme a Leitura dos Seus Alunos com Uma Experiência Divertida e Envolvente
        </h2>
        <div className="text-center mb-6 pt-4">
          <h3 className="text-2xl font-bold text-[#457B9D] uppercase tracking-wider">
            Desafio Literário
          </h3>
          <h4 className="text-lg font-bold text-[#1D3557] tracking-wider">
          Um pacote completo para tornar seus alunos apaixonados por leitura com:
          </h4>
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
              3 modelos de Leiturômetro para gamificação
            </span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f9fa]">
            <FaCheck className="w-5 h-5 text-[#457B9D] mt-0.5 flex-shrink-0" />
            <span className="font-medium text-[#1D3557]">
              2 Tabelas de acompanhamento de leitura
            </span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f9fa]">
            <FaCheck className="w-5 h-5 text-[#457B9D] mt-0.5 flex-shrink-0" />
            <span className="font-medium text-[#1D3557]">
              Guia de aplicação passo a passo
            </span>
          </li>

          <div className="mt-6 mb-4 text-center">
            <span className="text-[#457B9D] font-bold text-xl ">
              + Você também receberá <br /> <span className="bg-yellow-200 px-2 py-1 rounded-md text-[#1D3557]">Dois Bônus Exclusivos</span>
            </span>
          </div>

          {bonusData.map((bonus, index) => (
            <li key={index} className="flex flex-col md:flex-row items-start gap-4 p-4 rounded-lg bg-[#a8dadc]/20 border border-[#a8dadc]">
              <div className="w-full md:w-1/4 flex-shrink-0">
                <div className="relative w-full aspect-[3/4] rounded-md overflow-hidden shadow-md">
                  <Image
                    src={bonus.imagePath}
                    alt={bonus.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-[#1D3557] mb-2 text-lg">{bonus.title}</h4>
                <p className="font-medium text-[#1D3557] text-left mb-3">
                  {bonus.description}
                </p>
                <div className="flex items-center">
                  <span className="text-[#457B9D] font-bold">Valor: </span>
                  <span className="ml-2 line-through text-gray-500 mr-2">R${bonus.value}</span>
                  <span className="bg-[#457B9D] text-white text-xs font-bold py-1 px-2 rounded-full">
                    GRÁTIS
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="text-center mb-6">
          <div className="bg-[#f1faee] p-4 rounded-lg mb-8 mt-6">
            <div className="flex flex-col justify-center items-center gap-4">
              {/* Valor do Desafio row */}
              <div className="flex w-full justify-between items-center">
                <p className="font-bold text-lg text-[#1D3557]">Desafio Literário:</p>
                <p className="font-bold text-lg text-[#1D3557]"><span className="line-through text-gray-500">R${offerData.originalPrice}</span></p>
              </div>

              {/* Valor dos Bônus row */}
              <div className="flex w-full justify-between items-center">
                <p className="font-bold text-lg text-[#1D3557]">Bônus:</p>
                <p className="font-bold text-lg text-[#1D3557]"><span className="line-through text-gray-500">R${bonusData.reduce((acc, bonus) => acc + bonus.value, 0)}</span></p>
              </div>

              {/* Valor Total row */}
              <div className="flex w-full justify-between items-center pt-2 border-t border-[#a8dadc]">
                <p className="font-bold text-xl text-[#1D3557]">Valor Total:</p>
                <p className="font-bold text-xl text-[#1D3557]"><span className="line-through text-gray-500">R${offerData.originalPrice + bonusData.reduce((acc, bonus) => acc + bonus.value, 0)}</span></p>
              </div>
            </div>
            <p className="text-md text-gray-600 mt-4 italic text-center">
              Um projeto validado por professores, aplicado com sucesso em mais de 15 mil alunos, agora disponível com condição especial de volta as férias.
            </p>
          </div>
          <div className="relative inline-block bg-[#f1faee] p-6 rounded-lg border-2 border-[#457B9D] mt-4">
            <span className="absolute -top-4 -right-4 bg-[#E63946] text-white text-sm font-bold py-2 px-4 rounded-full transform rotate-12 shadow-md">
              {offerData.discount}
            </span>
            <div className="flex flex-col items-center">
              <p className="text-sm font-bold text-[#457B9D] mb-1">Apenas</p>
              <span className="text-6xl font-black text-[#1D3557] mb-1">
                R${offerData.promotionalPrice}
              </span>
              <p className="text-xs text-gray-600 italic">
                Aproveite antes que volte para <span className="font-bold">R${offerData.originalPrice}</span>
              </p>
            </div>
          </div>
          <p className="text-sm text-[#E63946] font-bold mt-4">
            Ao total está economizado R${(offerData.originalPrice + bonusData.reduce((acc, bonus) => acc + bonus.value, 0)) - offerData.promotionalPrice} ao adquirir agora!
          </p>
        </div>

        <CtaButton
          paymentLink={offerData.paymentLink}
          text="COMPRAR COM DESCONTO"
        />
        <OptimizedCountDown estoqueInicial={25} estoqueTotal={100} />
      </div>
    </section>
  );
}
