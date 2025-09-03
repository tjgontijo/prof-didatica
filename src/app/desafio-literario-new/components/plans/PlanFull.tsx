'use client';

import { FaCheck, FaArrowRight, FaShieldAlt, FaStar, FaGem } from 'react-icons/fa';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Usando os tipos definidos na página principal
interface PlanFullProps {
  planData: {
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

export default function PlanFull({ planData, bonusData }: PlanFullProps) {
  return (
    <section id="plan-full" className="py-16 bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-4 max-w-3xl">

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-white rounded-xl shadow-xl overflow-hidden border-2 border-emerald-600 transform transition-all hover:shadow-2xl">

          {/* Cabeçalho com gradiente */}
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-500 text-white font-bold py-1 px-4 transform rotate-45 translate-x-8 translate-y-3 shadow-md">
              MAIS VENDIDO
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaGem className="text-yellow-300 animate-pulse" />
              <h3 className="text-2xl md:text-3xl font-bold text-center">Plano Completo</h3>
            </div>
            <p className="text-center opacity-90 mt-2">Acesso a todos os recursos + bônus exclusivos</p>
          </div>

          <div className="p-8">
            {/* Layout de coluna única */}
            <div className="flex flex-col items-center">
              {/* Imagem centralizada */}
              <div className="flex justify-center mb-6">
                <div className="relative w-64 h-64">
                  <Image
                    src="/images/products/desafio-literario/lp/mockup_full.png"
                    alt="Desafio Literário"
                    fill
                    style={{ objectFit: 'contain' }}
                    className="drop-shadow-lg"
                  />
                </div>
              </div>
              
              {/* Conteúdo em coluna única */}
              <div className="w-full text-center">

                    {/* O que está incluído */}
                    <div className="mb-8">
                  <h4 className="font-bold text-emerald-800 mb-3 flex items-center max-w-md mx-auto text-left">
                    <span className="inline-block w-2 h-6 bg-emerald-700 mr-2"></span>
                    O que está incluído:
                  </h4>
                  <ul className="space-y-3 max-w-md mx-auto text-left">
                    <li className="flex items-start p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                      <FaCheck className="text-emerald-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600"><strong>20 fichas literárias</strong> para acompanhamento de leitura</span>
                    </li>
                    <li className="flex items-start p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                      <FaCheck className="text-emerald-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600"><strong>3 modelos de Leiturômetro</strong> para gamificação</span>
                    </li>
                    <li className="flex items-start p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                      <FaCheck className="text-emerald-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600"><strong>2 Tabelas de acompanhamento</strong> de leitura</span>
                    </li>
                    <li className="flex items-start p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                      <FaCheck className="text-emerald-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600"><strong>Guia de aplicação</strong> passo a passo</span>
                    </li>
                    <li className="flex items-start p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                      <FaCheck className="text-emerald-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600"><strong>Acesso vitalício</strong> após a confirmação do pagamento</span>
                    </li>
                    
                    {/* Bônus com destaque especial */}
                    <li className="mt-2 border-t border-emerald-100 pt-4">
                      <p className="font-bold text-emerald-800 mb-2 flex items-center">
                        <FaGem className="text-yellow-500 mr-2" /> Bônus Exclusivos:
                      </p>
                      <ul className="space-y-3">
                        {bonusData.map((bonus, index) => (
                          <li key={index} className="flex items-start p-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                            <FaCheck className="text-emerald-600 mt-1 mr-3 flex-shrink-0" />
                            <span className="text-gray-600"><strong>{bonus.title}</strong></span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </div>

                {/* Preço com destaque */}
                <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-medium text-gray-500 line-through decoration-red-600 decoration-2">R$ {planData.originalPrice}</span>
                    <span className="text-5xl font-bold text-emerald-800 my-1">R$ {planData.promotionalPrice}</span>
                  </div>
                  <div className="mt-3 bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full inline-flex items-center">
                    <FaStar className="mr-1" /> {planData.discount}
                  </div>
                </div>

            

                {/* Botão de compra */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 px-6 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  onClick={() => window.open(planData.paymentLink, '_blank')}
                >
                  <span>QUERO O PLANO COMPLETO</span>
                  <FaArrowRight className="animate-pulse" />
                </motion.button>

                {/* Informações de segurança - imagem única */}
                <div className="mt-4 flex justify-center">
                  <Image src="/images/system/compra-segura.png" alt="Compra Segura" width={300} height={60} className="max-w-full" />
                </div>
                
                <p className="text-center text-sm mt-4 text-gray-600">Acesso imediato no WhatsApp</p>
              </div>
            </div>
            
            {/* Separador */}
            <div className="border-t border-gray-200 my-8"></div>
            
            {/* Selo de garantia */}
            <div className="text-center bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-lg max-w-md mx-auto">
              <div className="flex flex-col items-center justify-center gap-4 mb-4">
                <div className="bg-white p-4 rounded-full shadow-md">
                  <FaShieldAlt className="text-4xl text-emerald-700" />
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-bold text-emerald-800 mb-1">Garantia de 7 dias</h4>
                  <p className="text-gray-600">Se você não ficar satisfeito com o material, devolvemos seu dinheiro sem burocracia.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
