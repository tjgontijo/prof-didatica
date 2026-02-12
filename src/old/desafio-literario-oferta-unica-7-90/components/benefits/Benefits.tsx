'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface BenefitCardProps {
  icon: string;
  title: string;
  description: string;
  delay: number;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ icon, title, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      viewport={{ once: true }}
      className="bg-white rounded-lg shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="text-4xl mb-4 text-center">{icon}</div>
      <h3 className="text-xl font-bold text-[#1D3557] mb-2 text-center">{title}</h3>
      <p className="text-[#457B9D]">{description}</p>
    </motion.div>
  );
};

export default function Benefits() {
  const benefits = [
    {
      icon: '📚',
      title: 'Leitura que Vicia',
      description: 'Transforma a leitura em um jogo que os alunos adoram participar',
      delay: 1,
    },
    {
      icon: '🚀',
      title: 'Aplicação Imediata',
      description: 'Material pronto para usar, sem necessidade de preparação',
      delay: 2,
    },
    {
      icon: '🏆',
      title: 'Resultados Comprovados',
      description: 'Testado e aprovado por mais de 3 mil professores',
      delay: 3,
    },
    {
      icon: '📈',
      title: 'Progresso Visível',
      description: 'Acompanhamento claro do desenvolvimento de cada aluno',
      delay: 4,
    },
  ];

  return (
    <section id="benefits" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1D3557] mb-4">
            O QUE MUDA NA SUA SALA NAS PRÓXIMAS 3 AULAS
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
              delay={benefit.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
