'use client';

import FaqItem from './FaqItem';
import CtaButton from '@/components/buttons/CtaButton';

interface FaqProps {
  fullPlanPrice?: number;
  paymentLink?: string;
  bonusValue?: number;
}

export default function Faq({
  fullPlanPrice = 17,
  paymentLink = 'https://seguro.profdidatica.com.br/r/SG7QX68CHY',
  bonusValue = 55
}: FaqProps) {
  const faqItems = [
    // ... (faqItems remained the same)
    {
      question: 'Para qual faixa etária esse material é indicado?',
      answer:
        'O material atende do Ensino Fundamental I ao II. O Plano Básico já vem com atividades prontas focadas no Fundamental I. Para professores do Fundamental II, recomendamos o Plano Completo, pois ele inclui a versão editável que permite alterar todas as continhas e ajustar o nível de dificuldade para turmas mais avançadas.',
    },
    {
      question: 'O material é digital ou físico?',
      answer:
        '100% digital. Assim que a compra é confirmada, você recebe no E-mail o material pronto para baixar e imprimir quantas vezes quiser, com quantas turmas quiser.',
    },
    {
      question: 'Como funciona o Pixel Art Matemático?',
      answer:
        'A criança resolve as operações e cada resultado indica uma cor. Ela pinta o pixel correspondente e, ao terminar, descobre um personagem do Divertidamente II. É como um jogo de descoberta — ela nem percebe que está praticando matemática.',
    },
    {
      question: 'Qual a diferença do Plano Básico para o Completo?',
      answer:
        'O Básico traz as 18 folhinhas prontas em PDF (não editável). O Completo traz tudo do básico + a versão editável do material (você altera as continhas e ajusta a dificuldade) + acesso à Fábrica de Continhas, uma plataforma que gera exercícios infinitos das 4 operações. Você leva R$ {bonusValue} em bônus grátis no plano completo.',
    },
    {
      question: 'O que é a Fábrica de Continhas?',
      answer:
        'É uma plataforma exclusiva onde você escolhe a operação (adição, subtração, multiplicação ou divisão), seleciona o nível de dificuldade, e gera folhas de flashcards prontas para imprimir. Perfeita para reforço semanal, treino em casa e avaliação contínua. Você nunca mais vai precisar criar exercício de matemática do zero.',
    },
    {
      question: 'Posso usar com todas as minhas turmas?',
      answer:
        'Sim! O material é seu para sempre. Imprima quantas cópias quiser, use com quantas turmas precisar. Sem limite nenhum.',
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-3 max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold text-dl-primary-800 mb-8 text-center border-b-2 border-dl-primary-100 pb-3 uppercase">
          Perguntas Frequentes (FAQ)
        </h2>
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <FaqItem key={index} question={item.question} answer={item.answer} />
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-dl-primary-50 to-blue-50 p-6 md:p-8 rounded-lg text-center">
          <h3 className="text-xl md:text-2xl font-bold text-dl-primary-800 mb-4">
            Pronta para ver seus alunos sorrindo na aula de matemática?
          </h3>
          <p className="text-gray-700 mb-6">
            Por R$ {fullPlanPrice}, você leva o material completo + R$ {bonusValue} em bônus grátis.
          </p>
          <div className="max-w-md mx-auto">
            <CtaButton
              paymentLink={paymentLink}
              text="QUERO O PLANO COMPLETO"
              className="!bg-dl-accent hover:!bg-dl-accent-hover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
