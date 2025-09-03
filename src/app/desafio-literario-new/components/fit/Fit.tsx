'use client';

import React from 'react';

const Fit: React.FC = () => {
  return (
    <section id="fit" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1D3557] mb-4">
            IDEAL PARA VOCÊ QUE...
          </h2>
        </div>

        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
          {/* Card 1 */}
          <div className="bg-[#f1faee] rounded-lg p-6 border-2 border-[#457B9D] shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-4 text-center">👩‍🏫</div>
            <h3 className="text-xl font-bold text-[#1D3557] mb-3 text-center">
              É professor do Ensino Fundamental I ou II
            </h3>
            <p className="text-gray-700 text-center">
              Especialmente desenvolvido para alunos do 2º ao 7º ano, com adaptações possíveis para outras séries
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#f1faee] rounded-lg p-6 border-2 border-[#457B9D] shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-4 text-center">😓</div>
            <h3 className="text-xl font-bold text-[#1D3557] mb-3 text-center">
              Está cansado de alunos desinteressados pela leitura
            </h3>
            <p className="text-gray-700 text-center">
              Transforma a relação dos alunos com os livros através da gamificação e competição saudável
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#f1faee] rounded-lg p-6 border-2 border-[#457B9D] shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-4 text-center">⏰</div>
            <h3 className="text-xl font-bold text-[#1D3557] mb-3 text-center">
              Precisa de soluções práticas e prontas para usar
            </h3>
            <p className="text-gray-700 text-center">
              Material completo que não exige criação adicional, economizando seu tempo e energia
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Fit;
