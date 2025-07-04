'use client';

import React, { useState, useEffect, useCallback, Suspense, lazy, memo } from 'react';
import EstoqueECountdown from './components/EstoqueECountdown';
import { FaChevronDown, FaCheck } from 'react-icons/fa';
import Image from 'next/image';

const CarrosselMissaoLiteraria = lazy(() => import('./components/carrossel/Carrossel-Missao-Literaria'));

type CityDisplayProps = Record<string, never>;

const CityDisplay: React.FC<CityDisplayProps> = memo(() => {
  const checkLocalStorage = useCallback((): string => {
    const lead = localStorage.getItem('lead');
    if (lead) {
      try {
        const parsedLead = JSON.parse(lead);
        return parsedLead?.geolocation?.city || 'Valinhos - SP';
      } catch {
        return 'Valinhos - SP';
      }
    }
    return 'Valinhos - SP';
  }, []);

  const [city, setCity] = useState<string>('Valinhos - SP');

  useEffect(() => {
    const initialCheck = checkLocalStorage();
    if (initialCheck) {
      setCity(initialCheck);
    } else {
      const timer = setTimeout(() => {
        const secondCheck = checkLocalStorage();
        if (secondCheck) {
          setCity(secondCheck);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [checkLocalStorage]);

  return <>{city}</>;
});
CityDisplay.displayName = 'CityDisplay';

type Offer = {
  originalPrice: number;
  promotionalPrice: number;
  discount: string;
  paymentLink: string;
};

const offerData: Offer = {
  originalPrice: 17,
  promotionalPrice: 12,
  discount: '30% OFF',
  paymentLink: 'https://seguro.profdidatica.com.br/r/HDJYH7SZJ6?promocode=ML30OFF'  
};

export default function Page() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [hasReachedThreshold, setHasReachedThreshold] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 7500 && !hasReachedThreshold) {
        setHasReachedThreshold(true);
        setIsVisible(true);
      } else if (!hasReachedThreshold) {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasReachedThreshold]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] relative">
      {/* Header */}
      <header className="w-full bg-[#2c4f71] h-[80px] md:h-auto flex items-center justify-center">
        <div className="flex justify-center items-center">
          <Image
            src="/images/system/logo_transparent.webp"
            alt="Prof Didática"
            width={80}
            height={80}
            className="h-auto w-auto max-h-[80px] md:max-h-[80px]"
          />
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-10">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <section className="text-center mb-20">
            <h1 className="text-2xl md:text-3xl font-black mb-6 md:leading-relaxed leading-normal tracking-tight relative text-[#1D3557]">
              <span className="relative z-10">
                CONHEÇA O MÉTODO DE LEITURA QUE FEZ ALUNOS DO{' '}
                <span className="text-[#457B9D] font-extrabold">FUNDAMENTAL 1</span> LEREM{' '}
                <span className="bg-yellow-100 px-1 py-0.5 rounded text-[#1D3557] font-extrabold">
                  3X MAIS
                </span>{' '}
                EM APENAS{' '}
                <span className="underline decoration-[#a8dadc] decoration-4">21 DIAS</span>{' '}
                <span className="block">
                  E DEVOLVEU AOS PROFESSORES O{' '}
                  <span className="text-[#457B9D] animate-pulse font-extrabold">
                    PRAZER EM ENSINAR
                  </span>
                </span>
              </span>
            </h1>
            <h2 className="text-lg md:text-xl text-[#1D3557] mb-6 max-w-3xl mx-auto font-normal leading-relaxed text-left">
              Você recebe imediatamente no WhatsApp 20 fichas literárias, dois modelos de leiturômetro pra
              transformar a leitura em jogo e dois modelos de tabela pra acompanhar tudo. <br />É só
              imprimir e usar com a sua turma hoje mesmo.
            </h2>
            {/* Carrossel de imagens */}
            <div className="w-full max-w-2xl mx-auto mb-0">
              <Suspense fallback={<div>Carregando carrossel...</div>}>
                <CarrosselMissaoLiteraria />
              </Suspense>
            </div>
          </section>

          {/* Problem Section */}
          <section className="bg-white rounded-lg shadow-lg p-8 mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-6 border-b-2 border-[#a8dadc] pb-3 text-center uppercase">
              Você já passou por isso?
            </h2>

            <div className="max-w-2xl mx-auto text-left space-y-6">
              <p className="text-gray-800 text-xl mt-12 mb-6 leading-relaxed">
                Você entra na sala com tudo pronto. O livro foi escolhido com carinho, a atividade
                pensada nos mínimos detalhes. Há uma expectativa silenciosa de que, dessa vez, seus
                alunos se envolvam com a leitura.
              </p>

              <p className="text-gray-800 text-xl leading-relaxed">
                Mas assim que a aula começa, a realidade bate. Metade da turma nem abriu o livro. A
                outra metade finge que leu. E só dois ou três tentam participar.
              </p>

              <p className="text-gray-800 text-xl leading-relaxed">
                Você respira fundo, disfarça a frustração e tenta seguir com a aula. Mas lá dentro,
                vem a mesma sensação de sempre: <strong>o esforço não valeu.</strong>
              </p>

              <div className="flex flex-col items-center mb-8">
                <Image
                  src="/images/products/missao-literaria/lp/prof.webp"                  
                  alt="Professora cansada com turma agitada ao fundo"
                  width={600}
                  height={600}
                  className="max-w-full rounded-lg shadow-md"
                />
                <p className="text-gray-600 italic mt-2 text-center">
                  Às vezes, o que pesa não é a aula. É a sensação de estar sozinha.
                </p>
              </div>

              <p className="text-gray-800 text-xl leading-relaxed">
                Porque não é a primeira vez. Você já tentou de tudo:{' '}
                <span className="font-semibold">leituras em grupo</span>,{' '}
                <span className="font-semibold">resumos</span>,{' '}
                <span className="font-semibold">dinâmicas criativas</span>. Mas no fim, a conexão
                simplesmente não acontece.
              </p>
              <p className="text-gray-800 text-xl leading-relaxed">
                E o que dói de verdade não é a aula que não funcionou. É a dúvida que vem depois:
              </p>
              <blockquote className="border-l-4 border-[#457B9D] text-xl pl-4 font-semibold mb-8 text-gray-800">
                &quot;Será que eu ainda estou fazendo diferença?&quot;
              </blockquote>

              <p className="text-gray-800 text-xl leading-relaxed">
                Porque você ama ensinar. Mas às vezes, no fundo, começa a duvidar se está sendo
                ouvida. Se vale a pena todo o esforço. Se algum aluno vai, de fato, lembrar do que
                você tentou fazer com tanto carinho e cuidado.
              </p>

              <p className="text-gray-800 text-xl leading-relaxed">
                A verdade é que o problema <span className="font-bold">não está em você</span>.
              </p>
              <blockquote className="border-l-4 border-[#457B9D] text-xl pl-4 font-semibold mb-8 text-gray-800">
              O que te faltava não era mais esforço. Era a ferramenta correta!
              </blockquote>

              <p className="text-xl text-[#457B9D] font-bold bg-[#f8f9fa] p-4 rounded-lg text-center">
              Um projeto capaz de transformar a leitura em diversão para seus alunos.
              Onde eles participam porque querem, não porque precisam. 
              E você volta a enxergar o brilho nos olhos das crianças, e a sentir, no fundo, que está fazendo a diferença.
              </p>
            </div>
          </section>

          {/* Solution Section */}
          <section className="bg-white rounded-lg shadow-lg p-8 mb-20">
            <div className="relative mb-10">
              <div className="absolute -top-3 left-4 bg-[#a8dadc] text-[#1D3557] px-4 py-1 rounded-full text-sm font-medium">
                Imagine só...
              </div>
              <h2 className="text-2xl md:text-3xl  text-[#1D3557] p-6 bg-[#f8f9fa] rounded-lg shadow-md border-2 border-dashed border-[#a8dadc]">
                <span className="italic">
                  Seus alunos pedindo pra contar o que leram, disputando pra ser o próximo a
                  apresentar, e você apenas acompanhando tudo com gratidão e leveza.
                </span>
                <span className="absolute -right-2 -bottom-2 text-3xl">💭</span>
              </h2>
            </div>
            <div className="flex flex-col gap-8 items-center mb-6">
              <p className="text-gray-800 text-xl mb-4 leading-relaxed">
                Aquele aluno que dizia que ler é chato, agora chega animado pra mostrar a ficha toda preenchida.
              </p>
              <p className="text-gray-800 text-xl mb-4 leading-relaxed">
                A turma inteira acompanhando a estante de leitura, comemorando cada livro colorido como uma pequena conquista.
              </p>
              <p className="text-gray-800 text-xl mb-4 leading-relaxed">
                E você, sem precisar montar tudo do zero, vendo a leitura acontecer com envolvimento real, e sentindo orgulho por ter feito isso acontecer.
              </p>
            </div>
            <div className="flex flex-col gap-8 items-center mb-6">
              <p className="text-gray-800 text-xl mb-4 leading-relaxed">
                Enquanto isso, seus alunos vão desenvolvendo habilidades que vão além do conteúdo:
              </p>
            </div>

            <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md mb-4">
              <div className="flex flex-rol items-center space-y-3">
                <div className="text-3xl text-[#457B9D] mr-2">📖</div>
                <p className="font-bold text-lg text-[#1D3557] text-left">
                  Criam naturalmente o gosto e o hábito pela leitura
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md mb-4">
              <div className="flex flex-rol items-center space-y-3">
                <div className="text-3xl text-[#457B9D] mr-2">🔍</div>
                <p className="font-bold text-lg text-[#1D3557] text-left">
                  Ampliam vocabulário, interpretação e pensamento crítico
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md mb-4">
              {' '}
              <div className="flex flex-rol items-center space-y-3">
                <div className="text-3xl text-[#457B9D] mr-2">✨</div>
                <p className="font-bold text-lg text-[#1D3557] text-left">
                  Estimulam criatividade e imaginação com histórias envolventes
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md mb-4">
              <div className="flex flex-rol items-center space-y-3">
                <div className="text-3xl text-[#457B9D] mr-2">✏️</div>
                <p className="font-bold text-lg text-[#1D3557] text-left">
                  Aprimoram a escrita de forma natural e conectada com o que leram
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md mb-4">
              <div className="flex flex-rol items-center space-y-3">
                <div className="text-3xl text-[#457B9D] mr-2">🏆</div>
                <p className="font-bold text-lg text-[#1D3557] text-left">
                  Participam de uma competição saudável que os motiva a continuar
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md mb-4">
              <div className="flex flex-rol items-center space-y-3">
                <div className="text-3xl text-[#457B9D] mr-2">🔥</div>
                <p className="font-bold text-lg text-[#1D3557] text-left">
                  Engajam mais nas aulas, com mais autonomia e interesse
                </p>
              </div>
            </div>
          </section>

          {/* Results Section */}
          <section className="bg-white rounded-lg shadow-lg p-8 mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-8 border-b-2 border-[#a8dadc] pb-3 uppercase text-center">
              Resultados comprovados
            </h2>
            <div className="bg-[#f8f9fa] p-6 rounded-lg mb-8">
              <div className="space-y-5">
                <div className="flex gap-3 items-center">
                  <div className="text-xl min-w-[30px]">✅</div>
                  <p className="text-xl text-gray-800 mb-4">
                    <strong>94,57%</strong> dos professores que aplicaram o Projeto Missão Literária relatam que seus alunos passaram a ler mais, inclusive aqueles que diziam não gostar de ler.
                  </p>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="text-xl min-w-[30px]">📈</div>
                  <p className="text-xl text-gray-800 mb-4">
                    O número médio de livros lidos por turma <strong>mais do que triplicou</strong> em apenas um mês após a aplicação do Projeto Missão Literária.
                  </p>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="text-xl min-w-[30px]">🏆</div>
                  <p className="text-xl text-gray-800 mb-4">
                    Uma metodologia prática e testada com sucesso por mais de <strong>8 mil professores</strong>.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#457B9D] text-white p-6 rounded-lg mb-8">
              <h3 className="font-bold text-xl mb-6 text-center border-b border-white pb-3">
                💬 Veja o que estão dizendo:
              </h3>
              <div className="bg-white text-gray-800 p-5 rounded-lg shadow-md mb-4">
                <p className="italic mb-3">
                  &ldquo;SAchei que ia ser só mais uma tentativa. Mas pela primeira vez, vi meus
                  alunos empolgados com leitura. Eu chorei depois da aula..&rdquo;
                </p>
                <p className="text-right font-medium text-[#1D3557]">– Prof. Carla R.</p>
                <p className="text-right text-xs text-gray-500 italic">
                  <CityDisplay />
                </p>
              </div>
              <div className="bg-white text-gray-800 p-5 rounded-lg shadow-md mb-4">
                <p className="italic mb-3">
                  &ldquo;Tenho alunos que nunca pegaram um livro sem reclamar. Depois de duas
                  semanas, começaram a pedir mais. Um até me perguntou quando seria a próxima
                  leitura.&rdquo;
                </p>
                <p className="text-right font-medium text-[#1D3557]">– Prof. Juliana P.</p>
                <p className="text-right text-xs text-gray-500 italic">Marabá - PA</p>
              </div>
              <div className="bg-white text-gray-800 p-5 rounded-lg shadow-md">
                <p className="italic mb-3">
                  &ldquo;Tentava de tudo e ninguém ligava. Mas com as missões, eles começaram a
                  comentar os livros e até competir. Foi como tirar um peso das costas.&rdquo;
                </p>
                <p className="text-right font-medium text-[#1D3557]">– Prof. Renata M.</p>
                <p className="text-right text-xs text-gray-500 italic">Belo Horizonte - MG</p>
              </div>
            </div>
          </section>

          {/* Oferta */}
          <section>
            <div className="bg-white rounded-lg shadow-lg py-16 px-8 mb-20 mt-8">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-8 border-b-2 border-[#a8dadc] pb-3 uppercase text-center">
                Oferta Especial
              </h2>
              <div className="text-center mb-6 pt-4">
                <h3 className="text-2xl font-bold text-[#457B9D] uppercase tracking-wider">
                  Missão Literária
                </h3>
              </div>

              <ul className="space-y-4 mb-8 text-left">
                <li className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f9fa]">
                  <FaCheck className="w-5 h-5 text-[#457B9D] mt-0.5 flex-shrink-0" />
                  <span className="font-medium text-[#1D3557]">
                    20 fichas literárias
                  </span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f9fa]">
                  <FaCheck className="w-5 h-5 text-[#457B9D] mt-0.5 flex-shrink-0" />
                  <span className="font-medium text-[#1D3557]">
                    2 modelos de Leiturômetro para gamificação
                  </span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f9fa]">
                  <FaCheck className="w-5 h-5 text-[#457B9D] mt-0.5 flex-shrink-0" />
                  <span className="font-medium text-[#1D3557]">
                    Guia de aplicação passo a passo
                  </span>
                </li>

                <div className="mt-2 mb-3">
                  <span className="text-[#457B9D] font-semibold">
                    + Você também receberá um Bônus exclusivo:
                  </span>
                </div>

                <li className="flex items-center gap-3 p-3 rounded-lg bg-[#a8dadc]/20">
                  <svg
                    className="w-5 h-5 text-[#457B9D] flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    />
                  </svg>
                  <span className="font-medium text-[#1D3557] text-left">
                    Apostila com 50 páginas para produção textual, perfeita para complementar suas aulas e desenvolver a escrita criativa dos alunos.
                  </span>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-lg bg-[#a8dadc]/20">
                  <svg
                    className="w-5 h-5 text-[#457B9D] flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    />
                  </svg>
                  <span className="font-medium text-[#1D3557] text-left">
                    2 Tabelas de acompanhamento de leitura
                  </span>
                </li>
              </ul>

              <div className="text-center mb-6">
                <p className="text-md text-gray-600 mt-2 italic mb-8">
                  Um projeto validado por professores, aplicado com sucesso em mais de 15 mil alunos, agora disponível com valor procional.
                </p>
                <div className="inline-block relative">
                  <span className="absolute -top-3 -right-10 bg-[#457B9D] text-white text-xs font-bold py-1 px-2 rounded-full transform rotate-12">
                    {offerData.discount}
                  </span>
                  <span className="text-6xl font-black text-[#1D3557]">
                    R${offerData.promotionalPrice}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-2 italic">
                  Aproveite antes que volte para R${offerData.originalPrice}
                </p>
              </div>

              <a
                href={offerData.paymentLink}
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-[#457B9D] to-[#1D3557] hover:from-[#1D3557] hover:to-[#457B9D] text-white text-base sm:text-lg font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden group text-center uppercase"
              >
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative">Quero Meus Alunos Apaixonados por Leitura</span>
              </a>
              <EstoqueECountdown estoqueInicial={11} estoqueTotal={30} />
            </div>
          </section>

          {/* FAQ Section */}
          <section className="bg-white rounded-lg shadow-lg py-8 px-6 mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-8 text-center border-b-2 border-[#a8dadc] pb-3 uppercase">
              Perguntas Frequentes (FAQ)
            </h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              {/* FAQ Item 1 */}
              <div className="border border-[#a8dadc] rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between gap-3 p-4 bg-[#f8f9fa] cursor-pointer">
                    <span className="font-medium text-[#1D3557] text-lg">
                      Para qual faixa etária esse material é indicado?
                    </span>
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      <FaChevronDown className="h-5 w-5 text-[#457B9D]" />
                    </span>
                  </summary>
                  <div className="p-4 bg-white">
                    <p className="text-gray-800">
                      O recurso Missão Literária foi criado especialmente para alunos do Ensino Fundamental I para alunos do 2º ao 5º ano, porém tivemos relatos de professores do fundamental 2 que utilizaram com suceso em suas aulas.
                    </p>
                  </div>
                </details>
              </div>

              {/* FAQ Item 2 */}
              <div className="border border-[#a8dadc] rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between gap-3 p-4 bg-[#f8f9fa] cursor-pointer">
                    <span className="font-medium text-[#1D3557] text-lg">
                      O material é digital ou físico?
                    </span>
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      <FaChevronDown className="h-5 w-5 text-[#457B9D]" />
                    </span>
                  </summary>
                  <div className="p-4 bg-white">
                    <p className="text-gray-800">
                      O material é 100% digital. Assim que a compra é confirmada, você recebe tudo por Whatsapp, pronto para baixar e imprimir quantas vezes quiser.
                    </p>
                  </div>
                </details>
              </div>

              {/* FAQ Item 3 */}
              <div className="border border-[#a8dadc] rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between gap-3 p-4 bg-[#f8f9fa] cursor-pointer">
                    <span className="font-medium text-[#1D3557] text-lg">
                      Preciso de muito tempo para aplicar esse sistema?
                    </span>
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      <FaChevronDown className="h-5 w-5 text-[#457B9D]" />
                    </span>
                  </summary>
                  <div className="p-4 bg-white">
                    <p className="text-gray-800">
                      Não. O recurso foi pensado para facilitar a rotina do professor. Você imprime as fichas, segue o passo a passo e já percebe os alunos mais engajados nos primeiros dias.
                    </p>
                  </div>
                </details>
              </div>

              {/* FAQ Item 4 */}
              <div className="border border-[#a8dadc] rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between gap-3 p-4 bg-[#f8f9fa] cursor-pointer">
                    <span className="font-medium text-[#1D3557] text-lg">
                      Como recebo o material após a compra?
                    </span>
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      <FaChevronDown className="h-5 w-5 text-[#457B9D]" />
                    </span>
                  </summary>
                  <div className="p-4 bg-white">
                    <p className="text-gray-800">
                      Depois do pagamento, você recebe uma mensagem no seu Whatsapp com o link para download do Google Drive. É tudo simples, direto e com acesso imediato.
                    </p>
                  </div>
                </details>
              </div>

              {/* FAQ Item 5 */}
              <div className="border border-[#a8dadc] rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between gap-3 p-4 bg-[#f8f9fa] cursor-pointer">
                    <span className="font-medium text-[#1D3557] text-lg">
                      Posso usar o material com todas as minhas turmas?
                    </span>
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      <FaChevronDown className="h-5 w-5 text-[#457B9D]" />
                    </span>
                  </summary>
                  <div className="p-4 bg-white">
                    <p className="text-gray-800">
                      Sim! Uma vez que baixou o material para seu computador ou celular, você pode usar com todos os seus alunos, durante o ano inteiro, quantas vezes quiser. Não há limite de impressão ou de uso em sala.
                    </p>
                  </div>
                </details>
              </div>

              {/* FAQ Item 6 */}
              <div className="border border-[#a8dadc] rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between gap-3 p-4 bg-[#f8f9fa] cursor-pointer">
                    <span className="font-medium text-[#1D3557] text-lg">
                      Funciona mesmo com turmas mais difíceis ou alunos desmotivados?
                    </span>
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      <FaChevronDown className="h-5 w-5 text-[#457B9D]" />
                    </span>
                  </summary>
                  <div className="p-4 bg-white">
                    <p className="text-gray-800">
                      Sim. O material foi pensado justamente para esse tipo de missão. As atividades despertam curiosidade, envolvem emocionalmente e criam um clima de competição saudável. Mesmo alunos que não gostam de ler acabam participando naturalmente.
                    </p>
                  </div>
                </details>
              </div>

              {/* FAQ Item 7 */}
              <div className="border border-[#a8dadc] rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between gap-3 p-4 bg-[#f8f9fa] cursor-pointer">
                    <span className="font-medium text-[#1D3557] text-lg">
                      E se eu não tiver experiência com projetos assim?
                    </span>
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      <FaChevronDown className="h-5 w-5 text-[#457B9D]" />
                    </span>
                  </summary>
                  <div className="p-4 bg-white">
                    <p className="text-gray-800">
                      Não tem problema. O material vem com um manual de aplicação completo, pensado para quem nunca trabalhou com esse tipo de proposta. Você não precisa adaptar nada nem inventar atividades. É só seguir o que está pronto.
                    </p>
                  </div>
                </details>
              </div>
            </div>
          </section>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-[#2c4f71] py-4 text-center text-white">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} Prof Didática - Todos os direitos reservados</p>
        </div>
      </footer>
      {/* Botão Fixo */}
      {isVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 py-8 bg-white/90 shadow-2xl backdrop-blur-sm">
          <a
            href={offerData.paymentLink}
            rel="noopener noreferrer"
            className="block w-full max-w-xs mx-auto text-white px-4 py-2 rounded-xl shadow-xl hover:scale-105 transition-all duration-300 text-center text-sm font-semibold uppercase
            bg-gradient-to-r from-[#457B9D] to-[#1D3557] 
            animate-gradient-x 
            bg-[length:200%_auto] 
            hover:bg-[position:right_center]"
          >
            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative">Comprar Com Desconto</span>
          </a>
        </div>
      )}
    </div>
  );
}
