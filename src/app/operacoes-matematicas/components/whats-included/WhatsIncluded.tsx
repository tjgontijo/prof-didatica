import React from 'react';
import { CheckCircle } from 'lucide-react';

type IncludedItemProps = {
  title: string;
  description: string;
};

const IncludedItem: React.FC<IncludedItemProps> = ({ title, description }) => {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="flex-shrink-0 mt-1">
        <CheckCircle className="h-6 w-6 text-dl-accent" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-dl-primary-800">{title}</h3>
        <p className="text-dl-primary-500">{description}</p>
      </div>
    </div>
  );
};

const WhatsIncluded: React.FC = () => {
  const includedItems = [
    {
      title: "18 Folhinhas em Pixel Art",
      description: "Com os 9 personagens do Divertidamente II: Alegria, Tristeza, Medo, Raiva, Nojinho, Inveja, Ansiedade, Tédio e Vergonha"
    },
    {
      title: "4 Operações Contempladas",
      description: "Adição, subtração, multiplicação e divisão em cada atividade"
    },
    {
      title: "Níveis Progressivos de Dificuldade",
      description: "Das operações mais simples até desafios com números na ordem de milhar"
    },
    {
      title: "Gabarito Completo para o Professor",
      description: "Arquivo separado com todas as respostas para conferência rápida"
    }
  ];

  return (
    <section id="whats-included" className="py-12 md:py-16 px-3 bg-white">
      <div className="container mx-auto px-3 max-w-3xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-dl-primary-800 mb-4 uppercase">
            O QUE VOCÊ RECEBE NO PIXEL ART MATEMÁTICO
          </h2>
        </div>

        <div>
          {includedItems.map((item, index) => (
            <IncludedItem
              key={index}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatsIncluded;
