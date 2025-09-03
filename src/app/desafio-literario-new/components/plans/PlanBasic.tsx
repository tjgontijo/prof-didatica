'use client';

import { FaCheck, FaStar } from 'react-icons/fa';
import { FaArrowDown } from 'react-icons/fa6';
import { BsLightningChargeFill } from 'react-icons/bs';
import Image from 'next/image';
import Link from 'next/link';
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
                  src="/images/products/desafio-literario/lp/hero_mockup.png"
                  alt="Desafio Literário"
                  fill
                  style={{ objectFit: 'contain' }}
                  className="drop-shadow-lg"
                />
              </div>
            </div>
            <div className="text-center">
               {/* O que está incluído */}
               <div className="mb-8">
                  <h4 className="font-bold text-[#1D3557] mb-3 flex  items-center justify-center">
                    <span className="inline-block w-2 h-6 bg-[#457B9D] mr-2"></span>
                    O que está incluído:
                  </h4>
                  <ul className="space-y-3 max-w-md mx-auto text-left">
                    <li className="flex items-start p-2 hover:bg-blue-50 rounded-lg transition-colors">
                      <FaCheck className="text-emerald-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600"><strong>20 fichas literárias</strong></span>
                    </li>
                    <li className="flex items-start p-2 hover:bg-blue-50 rounded-lg transition-colors">
                      <FaCheck className="text-emerald-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600"><strong>1 modelo de Leiturômetro</strong></span>
                    </li>
                    <li className="flex items-start p-2 hover:bg-blue-50 rounded-lg transition-colors">
                      <FaCheck className="text-emerald-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600"><strong>1 Tabela de acompanhamento</strong></span>
                    </li>
                    <li className="flex items-start p-2 hover:bg-blue-50 rounded-lg transition-colors">
                      <FaCheck className="text-emerald-600 mt-1 mr-3 flex-shrink-0" />
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

                {/* Imagem de compra segura */}
                <div className="mt-4 flex justify-center">
                  <Image
                    src="/images/system/compra-segura.png"
                    alt="Compra Segura"
                    width={300}
                    height={60}
                    className="max-w-full"
                  />
                </div>
              </div>

            {/* Separador */}
            <div className="border-t border-gray-200 my-8"></div>

            {/* Chamada para o plano completo */}
            <div className="text-center bg-gradient-to-r from-blue-50 to-emerald-50 p-6 rounded-lg">
              <p className="text-lg font-medium text-[#1D3557] mb-2">
                Quer mais recursos e bônus exclusivos?
              </p>
              <p className="text-emerald-700 font-bold mb-4">
                Conheça nosso plano completo com 4 bônus exclusivos!
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="#plan-full"
                  className="inline-flex items-center gap-2 text-white font-bold bg-[#1D3557] hover:bg-[#2A4A6D] px-6 py-3 rounded-lg transition-colors shadow-md"
                >
                  Ver plano completo <FaArrowDown className="animate-bounce" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
