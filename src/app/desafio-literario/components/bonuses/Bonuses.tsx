'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

type BonusItemProps = {
  title: string;
  description: string;
  image: string;
  value: string;
  index: number;
};

type BonusesProps = {
  bonusData: Array<{
    title: string;
    description: string;
    value: number;
    imagePath: string;
  }>;
};

const Bonus: React.FC<BonusItemProps> = ({ title, description, image, value, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      viewport={{ once: true }}
      className="flex flex-col items-center bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100"
    >
      <div className="relative w-full aspect-video">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
          className="rounded-t-lg"
        />
        <div className="absolute top-0 right-0 bg-emerald-600 text-white font-bold py-1 px-3 rounded-bl-lg">
          BÔNUS
        </div>
      </div>
      <div className="p-6 w-full text-center">
        <h3 className="text-xl font-bold text-[#1D3557] mb-2">{title}</h3>
        <p className="text-[#457B9D] mb-4">{description}</p>
        <div className="text-emerald-600 font-bold">
          Valor: <span className="line-through decoration-red-600 decoration-2 mr-2">{value}</span> 
          <span className="text-emerald-700 font-bold">GRÁTIS</span>
        </div>
      </div>
    </motion.div>
  );
};

const Bonuses: React.FC<BonusesProps> = ({ bonusData }) => {
  // Mapear os dados recebidos para o formato esperado pelo componente Bonus
  const bonusItems = bonusData.map(bonus => ({
    title: bonus.title,
    description: bonus.description,
    image: bonus.imagePath,
    value: `R$ ${bonus.value},00`
  }));

  return (
    <section id="bonuses" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1D3557] mb-4">
            BÔNUS EXCLUSIVOS PARA TURBINAR SEUS RESULTADOS
          </h2>
          <p className="text-lg text-[#457B9D] max-w-3xl mx-auto">
            Além do projeto Desafio Literário, você receberá estes 4 bônus especiais <span className="font-bold">no valor total de R$ 54,00</span> para potencializar ainda mais o engajamento dos seus alunos com a leitura:
          </p>
        </div>
        <div className="space-y-8 max-w-3xl mx-auto">
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
