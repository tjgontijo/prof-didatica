'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

type IncludedItemProps = {
  title: string;
  description: string;
  index: number;
};

const IncludedItem: React.FC<IncludedItemProps> = ({ title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="flex items-start gap-4 mb-6"
    >
      <div className="flex-shrink-0 mt-1">
        <CheckCircle className="h-6 w-6 text-emerald-600" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-[#1D3557]">{title}</h3>
        <p className="text-[#457B9D]">{description}</p>
      </div>
    </motion.div>
  );
};

const WhatsIncluded: React.FC = () => {
  const includedItems = [
    {
      title: "20 Fichas Literárias",
      description: "Prontas para imprimir, com campos para registro de leitura e avaliação"
    },
    {
      title: "3 Modelos de Leiturômetro",
      description: "Para acompanhamento visual do progresso de cada aluno"
    },
    {
      title: "2 Tabelas de Acompanhamento",
      description: "Para registro da pontuação e classificação dos alunos"
    },
    {
      title: "Guia de Aplicação",
      description: "Passo a passo para implementar o desafio em sala de aula"
    }
  ];

  return (
    <section id="whats-included" className="py-16 bg-[#f1faee]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1D3557] mb-4">
            O QUE VOCÊ RECEBE NO DESAFIO LITERÁRIO
          </h2>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 border border-gray-100">
          {includedItems.map((item, index) => (
            <IncludedItem
              key={index}
              title={item.title}
              description={item.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatsIncluded;
