import { Check, Star, ChevronDown, Zap } from 'lucide-react';
import Image from 'next/image';
import CtaButton from '@/components/buttons/CtaButton';

// Usando os tipos definidos na página principal
interface PlanBasicProps {
  planData: {
    originalPrice: number;
    promotionalPrice: number;
    discount: string;
    paymentLink: string;
  };
}

export default function PlanBasic({ planData }: PlanBasicProps) {
  return (
    <section id="plans" className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1D3557] mb-3">Escolha o Plano Ideal</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Comece com o plano básico e tenha acesso aos recursos essenciais para transformar a experiência de leitura dos seus alunos.</p>
        </div>
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 transition-all hover:shadow-2xl">
          {/* Cabeçalho com gradiente */}
          <div className="bg-gradient-to-r from-[#457B9D] to-[#1D3557] p-6 text-white relative overflow-hidden">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="text-yellow-300" />
              <h3 className="text-2xl md:text-3xl font-bold text-center">Plano Básico</h3>
            </div>
          </div>

          <div className="p-8">
            {/* Imagem centralizada */}
            <div className="flex justify-center mb-6">
              <div className="relative w-60 h-60 md:w-64 md:h-64">
                <Image
                  src="/images/products/desafio-literario/lp/hero_mockup.webp"
                  alt="Desafio Literário"
                  fill
                  sizes="(max-width: 768px) 240px, 256px"
                  style={{ objectFit: 'contain' }}
                  className="drop-shadow-lg"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="text-center">
               {/* O que está incluído */}
               <div className="mb-8">
               <div className="mt-2 border-t border-blue-200 pt-4"></div>
                  <h4 className="font-bold text-[#1D3557] mb-3 flex items-center max-w-md mx-auto text-left">
                    <span className="inline-block w-2 h-6 bg-[#457B9D] mr-2"></span>
                    O que está incluído:
                  </h4>
                  <ul className="space-y-3 max-w-md mx-auto text-left">
                    <li className="flex items-start p-2 hover:bg-blue-50 rounded-lg transition-colors">
                      <Check className="text-[#457B9D] mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600"><strong>20 fichas literárias</strong> para estimular a leitura</span>
                    </li>
                    <li className="flex items-start p-2 hover:bg-blue-50 rounded-lg transition-colors">
                      <Check className="text-[#457B9D] mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600"><strong>2 modelo de Leiturômetro</strong> para gamificação</span>
                    </li>
                    <li className="flex items-start p-2 hover:bg-blue-50 rounded-lg transition-colors">
                      <Check className="text-[#457B9D] mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600"><strong>Tabela em PDF</strong> para controle de leitura</span>
                    </li>
                    <li className="flex items-start p-2 hover:bg-blue-50 rounded-lg transition-colors">
                      <Check className="text-[#457B9D] mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600"><strong>Acesso por 90 dias</strong></span>
                    </li>
                  </ul>
                </div>

                {/* Preço com destaque */}
                <div className="mb-8 bg-gray-50 p-4 rounded-lg ">
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-medium text-gray-500 line-through decoration-red-600 decoration-2">R$ {planData.originalPrice}</span>
                    <span className="text-5xl font-bold text-[#1D3557] my-1">R$ {planData.promotionalPrice}</span>
                  </div>
                  <div className="mt-3 bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full inline-flex items-center">
                    <Star className="mr-1" /> {planData.discount}
                  </div>
                </div>



                {/* Botão de compra */}
                <div className="max-w-sm mx-auto">
                  <CtaButton
                    paymentLink={planData.paymentLink}
                    text="QUERO APENAS O BÁSICO"
                    className="!bg-emerald-600 hover:!bg-emerald-700 !py-4"
                  />
                </div>
              </div>

            {/* Separador */}
            <div className="my-6"></div>

            {/* Chamada para o plano completo */}
            <div className="text-center bg-gradient-to-r from-blue-50 to-emerald-50 p-6 rounded-lg">
              <p className="text-2xl font-bold text-red-600 mb-2 uppercase leading-relaxed">
                Quer ganhar alguns presentes?
              </p>
              <p className="text-xl text-zinc-600 mb-4">
                Conheça abaixo nosso plano mais vantajoso com vários presentes únicos!
              </p>
              <div className="flex justify-center mt-2">
                <div className="text-red-600 animate-bounce">
                  <ChevronDown size={40} strokeWidth={2} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
