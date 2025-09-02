'use client';

import React from 'react';
import Link from 'next/link';
import { FaClock, FaShieldAlt } from 'react-icons/fa';

const CtaUrgency: React.FC = () => {
  return (
    <section id="cta-urgency" className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto rounded-xl overflow-hidden shadow-lg">
          <div className="bg-[#1D3557] p-8 md:p-10 text-white">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                ADQUIRA HOJE E APLIQUE NA PRÓXIMA AULA
              </h2>
              <p className="text-lg md:text-xl">
                Material enviado imediatamente + guia passo a passo
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
              <div className="flex items-center gap-3">
                <FaClock className="text-2xl text-white" />
                <span className="text-base">Acesso imediato</span>
              </div>

              <div className="flex items-center gap-3">
                <FaShieldAlt className="text-2xl text-white" />
                <span className="text-base">Garantia de 7 dias</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-white text-[#1D3557] font-bold py-2 px-4 rounded-md mb-4 text-sm">
                Lote com desconto ativo hoje
              </div>

              <Link href="#plans">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-md text-lg md:text-xl transition-colors duration-200">
                  GARANTIR MEU ACESSO COM DESCONTO
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaUrgency;
