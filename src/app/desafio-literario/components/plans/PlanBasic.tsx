'use client';

import { FaCheck, FaStar } from 'react-icons/fa';
import { FaChevronCircleDown } from 'react-icons/fa';
import { BsLightningChargeFill } from 'react-icons/bs';
import Image from 'next/image';
import { motion } from 'framer-motion';

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 transform transition-all hover:shadow-2xl">
          {/* Cabeçalho com gradiente */}
          <div className="bg-gradient-to-r from-[#457B9D] to-[#1D3557] p-6 text-white relative overflow-hidden">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BsLightningChargeFill className="text-yellow-300 animate-pulse" />
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
                      <FaCheck className="text-[#457B9D] mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600"><strong>20 fichas literárias</strong> para estimular a leitura</span>
                    </li>
                    <li className="flex items-start p-2 hover:bg-blue-50 rounded-lg transition-colors">
                      <FaCheck className="text-[#457B9D] mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600"><strong>2 modelo de Leiturômetro</strong> para gamificação</span>
                    </li>
                    <li className="flex items-start p-2 hover:bg-blue-50 rounded-lg transition-colors">
                      <FaCheck className="text-[#457B9D] mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600"><strong>Tabela em PDF</strong> para controle de leitura</span>
                    </li>
                    <li className="flex items-start p-2 hover:bg-blue-50 rounded-lg transition-colors">
                      <FaCheck className="text-[#457B9D] mt-1 mr-3 flex-shrink-0" />
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
                    <FaStar className="mr-1" /> {planData.discount}
                  </div>
                </div>



                {/* Botão de compra */}
                <div className="max-w-sm mx-auto">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 px-6 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    onClick={() => window.open(planData.paymentLink, '_blank')}
                  >
                    <span>QUERO APENAS O BÁSICO</span>
                  </motion.button>
                </div>
              </div>

            {/* Separador */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Chamada para o plano completo */}
            <div className="text-center bg-gradient-to-r from-blue-50 to-emerald-50 p-6 rounded-lg">
              <p className="text-xl font-black text-red-600 mb-2 uppercase leading-relaxed">
                Quer ganhar mais recursos exclusivos?
              </p>
              <p className="text-zinc-600 font-bold mb-4">
                Conheça abaixo nosso plano mais vantajoso com vários presentes únicos!
              </p>
              <div className="flex justify-center mt-2">
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                  className="text-red-600"
                >
                  <FaChevronCircleDown size={40} />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
