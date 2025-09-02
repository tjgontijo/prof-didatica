'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

type BonusProps = {
  title: string;
  description: string;
  image: string;
  value: string;
  index: number;
};

const Bonus: React.FC<BonusProps> = ({ title, description, image, value, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      viewport={{ once: true }}
      className="flex flex-col md:flex-row items-center bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100"
    >
      <div className="relative w-full md:w-1/3 h-48">
        <Image
          src={image}
          alt={title}
          fill
          style={{ objectFit: 'cover' }}
          className="rounded-t-lg md:rounded-l-lg md:rounded-t-none"
        />
        <div className="absolute top-0 right-0 bg-emerald-600 text-white font-bold py-1 px-3 rounded-bl-lg">
          BÔNUS
        </div>
      </div>
      <div className="p-6 w-full md:w-2/3">
        <h3 className="text-xl font-bold text-[#1D3557] mb-2">{title}</h3>
        <p className="text-[#457B9D] mb-4">{description}</p>
        <div className="text-emerald-600 font-bold">
          Valor: <span className="line-through mr-2">{value}</span> 
          <span className="text-emerald-700">GRÁTIS</span>
        </div>
      </div>
    </motion.div>
  );
};

const Bonuses: React.FC = () => {
  const bonusItems = [
    {
      title: "Certificados Personalizáveis",
      description: "Modelos editáveis para premiar os alunos que completarem o desafio",
      image: "/images/products/producao_frases_texto/Producao_frases_texto.webp",
      value: "R$ 27,00"
    },
    {
      title: "Guia de Motivação",
      description: "Estratégias comprovadas para manter os alunos engajados durante todo o desafio",
      image: "/images/products/producao_frases_texto/Producao_frases_texto.webp",
      value: "R$ 37,00"
    },
    {
      title: "Apostila para Produção de Frases e Texto",
      description: "Apostila com 50 páginas para produção textual, perfeita para complementar suas aulas e desenvolver a escrita criativa dos alunos",
      image: "/images/products/producao_frases_texto/Producao_frases_texto.webp",
      value: "R$ 47,00"
    }
  ];

  return (
    <section id="bonuses" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1D3557] mb-4">
            BÔNUS EXCLUSIVOS PARA VOCÊ
          </h2>
          <p className="text-lg text-[#457B9D] max-w-3xl mx-auto">
            Além do kit completo do Desafio Literário, você também recebe estes bônus especiais para potencializar ainda mais seus resultados:
          </p>
        </div>

        <div className="space-y-8 max-w-5xl mx-auto">
          {bonusItems.map((item, index) => (
            <Bonus
              key={index}
              title={item.title}
              description={item.description}
              image={item.image}
              value={item.value}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Bonuses;
