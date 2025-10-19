'use client';

import FaqItem from './FaqItem';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';

interface FaqProps {
  planData: {
    paymentLink: string;
  };
}

export default function Faq({ planData }: FaqProps) {
  const faqItems = [
    {
      question: 'Para qual faixa etária esse material é indicado?',
      answer:
        'O Projeto Desafio Literário foi criado especialmente para alunos do Ensino Fundamental I para alunos do 2º ao 7º ano.',
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
        'Não tem problema. O material vem com um manual de aplicação completo, pensado para quem nunca trabalhou com esse tipo de proposta. Você não precisa adaptar nada nem inventar atividades. É só seguir o que está pronto.',
    },
  ];

  return (
    <section className="bg-white rounded-lg shadow-lg py-8 px-6 mb-20">
      <h2 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-8 text-center border-b-2 border-[#a8dadc] pb-3 uppercase">
        Perguntas Frequentes (FAQ)
      </h2>
      <div className="space-y-4 max-w-3xl mx-auto">
        {faqItems.map((item, index) => (
          <FaqItem key={index} question={item.question} answer={item.answer} />
        ))}
      </div>

      {/* CTA direcionando para o plano completo */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-emerald-50 p-8 rounded-lg max-w-3xl mx-auto text-center">
        <h3 className="text-xl md:text-2xl font-bold text-[#1D3557] mb-4">
          Pronto para transformar a experiência de leitura dos seus alunos?
        </h3>
        <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
          O Desafio Literário é a solução completa que vai engajar seus alunos e tornar a leitura uma atividade prazerosa e divertida.
        </p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block"
        >
          <a
            href={planData.paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white font-bold bg-emerald-700 hover:bg-emerald-800 px-8 py-4 rounded-lg transition-colors shadow-lg"
          >
            COMPRAR AGORA <FaArrowRight />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
