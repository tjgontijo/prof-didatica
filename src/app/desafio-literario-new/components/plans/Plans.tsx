'use client';

import { FaCheck, FaLock, FaCheckCircle, FaCreditCard } from 'react-icons/fa';
import { FaArrowDown } from 'react-icons/fa6';
import Image from 'next/image';

// Usando os tipos definidos na página principal
interface PlansProps {
  offerData: {
    originalPrice: number;
    promotionalPrice: number;
    discount: string;
    paymentLink: string;
    basicPaymentLink: string;
  };
  bonusData: Array<{
    title: string;
    description: string;
    value: number;
    imagePath: string;
  }>;
}

export default function Plans({ offerData, bonusData }: PlansProps) {
  return (
    <section id="plans" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1D3557] mb-8 text-center">
          ESCOLHA SEU PLANO DE ACESSO
        </h2>

        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          {/* Plano Básico */}
          <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#1D3557] mb-4 text-center">Plano Básico</h3>

              <div className="flex justify-center mb-6">
                <div className="relative w-40 h-40">
                  <Image
                    src="/images/products/producao_frases_texto/Producao_frases_texto.webp"
                    alt="Desafio Literário"
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-md"
                  />
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-lg font-bold text-[#1D3557]">Preço:</p>
                <p className="text-3xl font-bold text-[#1D3557] mb-2">R$ 12</p>
              </div>

              <div className="mb-6">
                <p className="font-bold text-[#1D3557] mb-2">Inclui:</p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <FaCheck className="text-emerald-600 mr-2" />
                    <span>Desafio Literário</span>
                  </li>
                </ul>
              </div>

              <button
                className="w-full py-3 px-6 bg-emerald-600 text-white font-bold rounded-md hover:bg-emerald-700 transition-colors"
                onClick={() => window.open(offerData.basicPaymentLink, '_blank')}
              >
                QUERO SOMENTE O BÁSICO
              </button>

              <div className="mt-6 text-center">
                <p className="text-red-600 font-bold flex flex-col items-center">
                  Atenção temos uma oferta ainda mais vantajosa pra você. Veja logo abaixo.
                  <FaArrowDown className="mt-2 animate-bounce" />
                </p>
              </div>
            </div>
          </div>

          {/* Plano Completo */}
          <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden border-2 border-emerald-600 relative">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white py-1 px-4 rounded-bl-lg font-bold">
              MAIS VENDIDO
            </div>

            <div className="p-6">

              <h3 className="text-xl font-bold text-[#1D3557] mb-4 text-center">Plano Completo</h3>

              <div className="text-center mb-6">
                <p className="text-lg font-bold text-[#1D3557]">Preço:</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="line-through text-gray-500 text-lg">R$ 88,00</span>
                  <span className="text-3xl font-bold text-[#1D3557]">R$ 20</span>
                </div>
                <p className="text-emerald-600 font-bold mt-1">Você economiza: R$ 68</p>
              </div>

              <div className="mb-6">
                <p className="font-bold text-[#1D3557] mb-2">Inclui:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <FaCheck className="text-emerald-600 mt-1 flex-shrink-0" />
                    <span>20 fichas literárias</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheck className="text-emerald-600 mt-1 flex-shrink-0" />
                    <span>3 modelos de Leiturômetro para gamificação</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheck className="text-emerald-600 mt-1 flex-shrink-0" />
                    <span>2 Tabelas de acompanhamento de leitura</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheck className="text-emerald-600 mt-1 flex-shrink-0" />
                    <span>Guia de aplicação passo a passo</span>
                  </li>

                  {bonusData.map((bonus, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <FaCheck className="text-emerald-600 mt-1 flex-shrink-0" />
                      <span>{bonus.title}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className="w-full py-3 px-6 bg-emerald-600 text-white font-bold rounded-md hover:bg-emerald-700 transition-colors"
                onClick={() => window.open(offerData.paymentLink, '_blank')}
              >
                QUERO O PLANO COMPLETO
              </button>

              <div className="flex justify-center items-center gap-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <FaLock className="mr-1" />
                  <span>Compra segura (SSL)</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="mr-1" />
                  <span>7 dias de garantia</span>
                </div>
                <div className="flex items-center">
                  <FaCreditCard className="mr-1" />
                  <span>PIX/Cartão</span>
                </div>
              </div>

              <p className="text-center text-sm mt-2 text-gray-600">Acesso imediato no WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
