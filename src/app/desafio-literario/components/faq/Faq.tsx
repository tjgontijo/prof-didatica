'use client';

import FaqItem from './FaqItem';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';

const PAYMENT_LINK_FULL = 'https://seguro.profdidatica.com.br/r/D6B9TPX140';

export default function Faq() {
  const faqItems = [
    {
      question: 'Para qual faixa etária esse material é indicado?',
      answer:
        'O recurso Desafio Literário foi criado especialmente para alunos do Ensino Fundamental I para alunos do 2º ao 7º ano.',
    },
    {
      question: 'O material é digital ou físico?',
      answer:
        'O material é 100% digital. Assim que a compra é confirmada, você recebe tudo por Whatsapp, pronto para baixar e imprimir quantas vezes quiser.',
    },
    {
      question: 'Preciso de muito tempo para aplicar esse sistema?',
      answer:
        'Não. O recurso foi pensado para facilitar a rotina do professor. Você imprime as fichas, segue o passo a passo e já percebe os alunos mais engajados nos primeiros dias.',
    },
    {
      question: 'Como recebo o material após a compra?',
      answer:
        'Depois do pagamento, você recebe uma mensagem no seu Whatsapp com o link para download do Google Drive. É tudo simples, direto e com acesso imediato.',
    },
    {
      question: 'Posso usar o material com todas as minhas turmas?',
      answer:
        'Sim! Uma vez que baixou o material para seu computador ou celular, você pode usar com todos os seus alunos, durante o ano inteiro, quantas vezes quiser. Não há limite de impressão ou de uso em sala.',
    },
    {
      question: 'Funciona mesmo com turmas mais difíceis ou alunos desmotivados?',
      answer:
        'Sim. O material foi pensado justamente para esse tipo de missão. As atividades despertam curiosidade, envolvem emocionalmente e criam um clima de competição saudável. Mesmo alunos que não gostam de ler acabam participando naturalmente.',
    },
    {
      question: 'E se eu não tiver experiência com projetos assim?',
      answer:
        'Não tem problema. O material vem com um guia de aplicação completo, pensado para quem nunca trabalhou com esse tipo de proposta. Você não precisa adaptar nada nem inventar atividades. É só seguir o que está pronto.',
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

        {/* CTA direcionando para o plano completo */}
        <div className="mt-12 bg-gradient-to-r from-dl-primary-50 to-blue-50 p-6 md:p-8 rounded-lg text-center">
          <h3 className="text-xl md:text-2xl font-bold text-dl-primary-800 mb-4">
            Pronto para transformar a experiência de leitura dos seus alunos?
          </h3>
          <p className="text-gray-700 mb-6">
            O Desafio Literário é a solução completa que vai engajar seus alunos e tornar a leitura uma atividade prazerosa e divertida.
          </p>
          <motion.a
            href={PAYMENT_LINK_FULL}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 text-white font-bold bg-dl-accent hover:bg-dl-accent-hover px-8 py-4 rounded-lg transition-colors shadow-lg cursor-pointer no-underline"
          >
            COMPRAR AGORA <FaArrowRight />
          </motion.a>
        </div>
      </div>
    </section>
  );
}
