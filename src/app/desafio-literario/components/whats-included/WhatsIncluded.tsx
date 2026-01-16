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
    <section id="whats-included" className="py-12 md:py-16 px-3 bg-white">
      <div className="container mx-auto px-3 max-w-3xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-dl-primary-800 mb-4 uppercase">
            O QUE VOCÊ RECEBE NO DESAFIO LITERÁRIO
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
