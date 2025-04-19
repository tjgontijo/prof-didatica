'use client'


import React, { useState, useEffect, useCallback, Suspense, lazy, memo } from 'react';
import EstoqueECountdown from '@/components/EstoqueECountdown';
import { FaChevronDown, FaCheck } from 'react-icons/fa';
import Image from 'next/image';

// Lazy load do CarrosselProjeto
const CarrosselProjeto = lazy(() => import('@/components/carrossel/CarrosselProjeto'));

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

export default function Page() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [hasReachedThreshold, setHasReachedThreshold] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 2000 && !hasReachedThreshold) {
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
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-10">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <section className="text-center mb-20">
            <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tight relative text-[#1D3557] uppercase">
              <span className="relative z-10">
                Transforme seus alunos em <span className="text-[#457B9D] animate-pulse">leitores entusiasmados</span> <span className='underline'>com missões prontas</span>,<span className="text-[#1D3557]"> para aplicar.</span>
              </span>
            </h1>
            <h2 className="text-lg md:text-xl text-[#1D3557] mb-6 max-w-3xl mx-auto font-normal leading-relaxed text-center">
              Aplique missões literárias prontas para engajar até os alunos que mais reclamam de ler. Economize tempo, traga leveza para a sua rotina e veja sua turma lendo mais e com entusiasmo.
            </h2>
            <div className="mx-auto text-left">
              <p className="text-md text-[#1D3557] italic my-4 text-left">
                Você vai receber diretamente no seu WhatsApp e E-mail:
              </p>
            </div>           
            <div className="grid grid-cols-1 gap-4 max-w-xl mx-auto text-left mb-8">
              {[
                { icon: '📚', text: '20 missões literárias envolventes' },
                { icon: '📊', text: '2 modelos de Leitômetro para gamificação' },
                { icon: '📈', text: '2 Tabelas de acompanhamento de leitura' },
                { icon: '📋', text: 'Guia de aplicação passo a passo' }
              ].map((item, index) => (
                <div key={index} className="bg-[#f8f9fa] rounded-lg p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="text-xl opacity-80">{item.icon}</div>
                  <span className="text-[#1D3557] font-medium">{item.text}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#1D3557] italic my-4">
              Veja abaixo uma amostra de como são as missões literárias:
            </p>
            {/* Carrossel de imagens */}
            <div className="w-full max-w-2xl mx-auto mb-0">
  <Suspense fallback={<div>Carregando carrossel...</div>}>
    <CarrosselProjeto />
  </Suspense>
</div>
            <div className="bg-white rounded-lg shadow-lg py-16 px-8 mb-20 mt-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-8 border-b-2 border-[#a8dadc] pb-3 uppercase text-center">
              Oferta Especial
            </h2>
              <div className="text-center mb-6 pt-4">
                <h3 className="text-2xl font-bold text-[#457B9D] uppercase tracking-wider">Missão Literária</h3>
              </div>
              
              <ul className="space-y-4 mb-8 text-left">
                <li className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f9fa]">
                  <FaCheck className="w-5 h-5 text-[#457B9D] mt-0.5 flex-shrink-0" />
                  <span className="font-medium text-[#1D3557]">20 missões literárias envolventes</span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f9fa]">
                  <FaCheck className="w-5 h-5 text-[#457B9D] mt-0.5 flex-shrink-0" />
                  <span className="font-medium text-[#1D3557]">2 modelos de Leitômetro para gamificação</span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f9fa]">
                  <FaCheck className="w-5 h-5 text-[#457B9D] mt-0.5 flex-shrink-0" />
                  <span className="font-medium text-[#1D3557]">2 Tabelas de acompanhamento de leitura</span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f9fa]">
                  <FaCheck className="w-5 h-5 text-[#457B9D] mt-0.5 flex-shrink-0" />
                  <span className="font-medium text-[#1D3557]">Guia de aplicação passo a passo</span>
                </li>

                <div className="mt-2 mb-3">
                  <span className="text-[#457B9D] font-semibold">+ Você também receberá um Bônus exclusivo:</span>
                </div>
                
                <li className="flex items-center gap-3 p-3 rounded-lg bg-[#a8dadc]/20">
                  <svg className="w-5 h-5 text-[#457B9D] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
                  </svg>
                  <span className="font-medium text-[#1D3557] text-left">Apostila com 50 páginas para produção textual, perfeita para complementar suas aulas e desenvolver a escrita criativa dos alunos.</span>
                </li>               
              </ul>

              <div className="text-center mb-6">
              <p className="text-md text-gray-600 mt-2 italic mb-8">Um projeto validado por professores, aplicado com sucesso em mais de 8 mil alunos, agora disponível por menos do que um lanche na cantina.</p>
                <div className="inline-block relative">                
                  <span className="absolute -top-3 -right-10 bg-[#457B9D] text-white text-xs font-bold py-1 px-2 rounded-full transform rotate-12">30% OFF</span>
                  <span className="text-6xl font-black text-[#1D3557]">R$12</span>
                </div>
                <p className="text-xs text-gray-600 mt-2 italic">
                  Aproveite antes que volte para R$17
                </p>
              </div>

              <a 
                href="https://seguro.profdidatica.com.br/r/HDJYH7SZJ6?promocode=PL40OFF"                
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-[#457B9D] to-[#1D3557] hover:from-[#1D3557] hover:to-[#457B9D] text-white text-base sm:text-lg font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden group text-center uppercase"
              >
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative">
                Quero meus alunos apaixonados pela leitura
                </span>
              </a>
              <EstoqueECountdown 
                estoqueInicial={12} 
                estoqueTotal={30} 
              />
              </div>
          </section>
         
          {/* Problem Section */}
          <section className="bg-white rounded-lg shadow-lg p-8 mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-6 border-b-2 border-[#a8dadc] pb-3 text-center uppercase">
              O que ninguém vê por trás de uma sala desmotivada
            </h2>
            
            <div className="max-w-2xl mx-auto text-left space-y-6">
              <p className="text-gray-800 text-xl mt-12 mb-6 leading-relaxed">
                Você entra na sala com tudo pronto.           
                O livro foi escolhido com carinho, a atividade pensada nos mínimos detalhes.              
                Há uma expectativa silenciosa de que, dessa vez, seus alunos se envolvam com a leitura.
              </p>

              <p className="text-gray-800 text-xl leading-relaxed">
                Mas assim que a aula começa, a realidade bate.              
                Metade da turma nem abriu o livro.
                A outra metade finge que leu.              
                E só dois ou três tentam participar.
              </p>

              <p className="text-gray-800 text-xl leading-relaxed">
                Você respira fundo, disfarça a frustração e tenta seguir com a aula.
                Mas lá dentro, vem a mesma sensação de sempre: <strong>o esforço não valeu.</strong> 
              </p>

              <div className="flex flex-col items-center mb-8">
                <Image 
                  src="/images/lp/prof.webp" 
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
                Porque não é a primeira vez.
                Você já tentou de tudo: <span className="font-semibold">leituras em grupo</span>, <span className="font-semibold">resumos</span>, <span className="font-semibold">dinâmicas criativas</span>.
                Mas no fim, a conexão simplesmente não acontece.
              </p>
              <p className="text-gray-800 text-xl leading-relaxed">              
                E o que dói de verdade não é a aula que não funcionou.
                É a dúvida que vem depois:
              </p>
              <blockquote className="border-l-4 border-[#457B9D] text-xl pl-4 font-semibold mb-8 text-gray-800">
                &quot;Será que eu ainda estou fazendo diferença?&quot;
              </blockquote>

              
              <p className="text-gray-800 text-xl leading-relaxed">
                Porque você ama ensinar.              
                Mas às vezes, no fundo, começa a duvidar se está sendo ouvida.              
                Se vale a pena todo o esforço.              
                Se algum aluno vai, de fato, lembrar do que você tentou fazer com tanto cuidado.
              </p>

              <p className="text-gray-800 text-xl leading-relaxed">
                A verdade é que o problema <span className="font-bold">não está em você</span>.
                E a solução não está em tentar mais uma atividade aleatória, sozinha.
              </p>

              <p className="text-xl text-[#457B9D] font-bold bg-[#f8f9fa] p-4 rounded-lg text-center">
                ✨ O que faltava era um sistema leve, pronto e motivador, que torne a leitura parte da rotina com significado.
                Um caminho onde o aluno se sente envolvido e o professor… realizado.
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
            <span className="italic">Seus alunos pedindo pra contar o que leram, disputando pra ser o próximo a apresentar, e você apenas acompanhando tudo com gratidão e leveza.</span>
            <span className="absolute -right-2 -bottom-2 text-3xl">💭</span>
          </h2>
        </div>
            <div className="flex flex-col gap-8 items-center mb-6">
                <p className="text-gray-800 text-xl mb-4 leading-relaxed">
                Aquele aluno que dizia que ler é chato, agora chega animado pra mostrar a ficha preenchida.
                </p>
                <p className="text-gray-800 text-xl mb-4 leading-relaxed">
                A turma inteira acompanhando a estante de leitura, comemorando cada livro colorido como uma pequena conquista.
                </p>
                <p className="text-gray-800 text-xl mb-4 leading-relaxed">
                E você, sem precisar montar tudo do zero, vendo a leitura acontecer com envolvimento real, e sentindo orgulho por ter feito isso acontecer.
                </p>
              <div className="bg-gradient-to-br from-[#457B9D] to-[#1D3557] p-4 rounded-lg shadow-lg">
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-white rounded-full p-2 shadow-md">
                    <span className="text-2xl">👩‍🏫</span>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-2xl mb-2 text-center">
                      De professor para professor
                    </p>
                    <p className="text-white font-medium text-xl text-center">
                      Esse sistema já mudou a minha realidade e a de centenas de colegas que hoje veem seus alunos lendo com vontade.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
         {/* Benefícios Section */}
<section className="bg-white rounded-lg shadow-lg p-8 mb-20">
  <h2 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-8 border-b-2 border-[#a8dadc] pb-3 uppercase text-center">
    Benefícios para seus alunos
  </h2>

  <div className="grid grid-cols-1 gap-6 mb-8">

    {/* Leitura e hábito */}
    <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md">
      <div className="flex flex-col items-center space-y-3">
        <div className="text-3xl text-[#457B9D]">📖</div>
        <p className="font-bold text-lg text-[#1D3557] text-center">
          Desenvolvem o gosto e o hábito pela leitura
        </p>
        <p className="text-gray-700 text-center">
          Os alunos passam a enxergar a leitura como algo prazeroso e não uma obrigação.
        </p>
      </div>
    </div>

    {/* Vocabulário e compreensão */}
    <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md">
      <div className="flex flex-col items-center space-y-3">
        <div className="text-3xl text-[#457B9D]">🔍</div>
        <p className="font-bold text-lg text-[#1D3557] text-center">
          Ampliam o vocabulário e a compreensão leitora
        </p>
        <p className="text-gray-700 text-center">
          Ao explorar histórias diversas, os alunos enriquecem a linguagem e aprendem a interpretar melhor.
        </p>
      </div>
    </div>

    {/* Criatividade */}
    <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md">
      <div className="flex flex-col items-center space-y-3">
        <div className="text-3xl text-[#457B9D]">✨</div>
        <p className="font-bold text-lg text-[#1D3557] text-center">
          Estimulam a criatividade e a imaginação
        </p>
        <p className="text-gray-700 text-center">
          As histórias lidas e as atividades propostas abrem espaço para invenção, reflexão e expressão.
        </p>
      </div>
    </div>

    {/* Escrita */}
    <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md">
      <div className="flex flex-col items-center space-y-3">
        <div className="text-3xl text-[#457B9D]">✏️</div>
        <p className="font-bold text-lg text-[#1D3557] text-center">
          Aprimoram a produção de texto
        </p>
        <p className="text-gray-700 text-center">
          As propostas de escrita ajudam os alunos a se expressarem melhor e organizarem ideias com clareza.
        </p>
      </div>
    </div>

    {/* Competição saudável */}
    <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md">
      <div className="flex flex-col items-center space-y-3">
        <div className="text-3xl text-[#457B9D]">🏆</div>
        <p className="font-bold text-lg text-[#1D3557] text-center">
          Participam de uma competição saudável
        </p>
        <p className="text-gray-700 text-center">
          A estante interativa cria um clima de desafio entre os alunos, incentivando a leitura contínua.
        </p>
      </div>
    </div>

    {/* Engajamento geral */}
    <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md">
      <div className="flex flex-col items-center space-y-3">
        <div className="text-3xl text-[#457B9D]">🔥</div>
        <p className="font-bold text-lg text-[#1D3557] text-center">
          Aumentam o engajamento nas aulas
        </p>
        <p className="text-gray-700 text-center">
          A leitura vira um momento esperado da semana — os alunos se envolvem mais, participam mais e se tornam protagonistas.
        </p>
      </div>
    </div>

  </div>
</section>


          {/* What's Included Section */}
          <section className="bg-white rounded-lg shadow-lg p-8 mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-8 border-b-2 border-[#a8dadc] pb-3 uppercase text-center">
              O que está incluído no Projeto Literário?
            </h2>
            <div className="grid grid-cols-1 gap-8 mb-8">
              <div className="bg-[#f8f9fa] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-3">📚</div>
                  <p className="font-bold text-[#1D3557] text-xl mb-3 text-center">15 fichas literárias envolventes</p>
                  <p className="text-gray-800 text-left w-full">Cada ficha é um roteiro completo para guiar a leitura, ajudando os alunos a interpretar e se conectar com a história de forma significativa.</p>
                </div>
              </div>
              <div className="bg-[#f8f9fa] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="font-bold text-[#1D3557] text-xl mb-3 text-center">Atividades de compreensão de leitura</p>
                  <p className="text-gray-800 text-left w-full">Serão abordads questões e reflexões que incentivam os alunos a pensar criticamente sobre o livro, desenvolvendo habilidades essenciais de interpretação.</p>
                </div>
              </div>
              <div className="bg-[#f8f9fa] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-3">🎨</div>
                  <p className="font-bold text-[#1D3557] text-xl mb-3 text-center">Estante interativa para acompanhar o progresso</p>
                  <p className="text-gray-800 text-left w-full">Dois modelos de leitômetro onde cada aluno registra suas leituras, criando uma competição saudável e motivação extra para ler cada vez mais.</p>
                </div>
              </div>
              <div className="bg-[#f8f9fa] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-3">✍️</div>
                  <p className="font-bold text-[#1D3557] text-xl mb-3 text-center">Propostas de produção textual</p>
                  <p className="text-gray-800 text-left w-full">Exercícios práticos que estimulam a escrita criativa e ajudam os alunos a expressar suas ideias sobre as histórias lidas em nosso bônus.</p>
                </div>
              </div>
              <div className="bg-[#f8f9fa] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="font-bold text-[#1D3557] text-xl mb-3 text-center">Tabela de acompanhamento personalizada</p>
                  <p className="text-gray-800 text-left w-full">Dois modelos, um em PDF e outro em Google Planilhas, para que você possa registrar quais alunos já leram, o progresso de cada um e identificar quem precisa de mais incentivo.</p>
                </div>
              </div>
              <div className="bg-[#f8f9fa] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-3">📖</div>
                  <p className="font-bold text-[#1D3557] text-xl mb-3 text-center">Manual de aplicação passo a passo</p>
                  <p className="text-gray-800 text-left w-full">Um guia claro e prático para você implementar o método com facilidade e garantir que seus alunos aproveitem ao máximo o projeto.</p>
                </div>
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
                  <strong>93%</strong> das professoras que aplicaram o Projeto Literário relatam que seus alunos passaram a ler mais — inclusive aqueles que diziam não gostar de ler.
                  </p>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="text-xl min-w-[30px]">📈</div>
                  <p className="text-xl text-gray-800 mb-4">
                  O número médio de livros lidos por turma <strong>mais do que dobrou</strong> em apenas um semestre após a aplicação do projeto.
                  </p>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="text-xl min-w-[30px]">🏆</div>
                  <p className="text-xl text-gray-800 mb-4">
                  Uma metodologia prática e testada com sucesso por mais de <strong>8 mil alunos</strong> em salas de aula reais.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#457B9D] text-white p-6 rounded-lg mb-8">
              <h3 className="font-bold text-xl mb-6 text-center border-b border-white pb-3">💬 Veja o que professoras estão dizendo:</h3>
              <div className="bg-white text-gray-800 p-5 rounded-lg shadow-md mb-4">
                <p className="italic mb-3">
                  &ldquo;Sinceramente? Eu já estava cansada. Sentia que tudo que eu fazia era ignorado.  
                  Quando comecei o projeto, achei que ia ser só mais uma tentativa. Mas não.  
                  Pela primeira vez, vi meus alunos empolgados com leitura. Eu chorei em casa depois da aula.  
                  Foi a primeira vez em muito tempo que me senti fazendo diferença de novo.&rdquo;
                </p>
                <p className="text-right font-medium text-[#1D3557]">– Prof. Carla R.</p>
                <p className="text-right text-xs text-gray-500 italic">
                  <CityDisplay />
                </p>
              </div>
                <div className="bg-white text-gray-800 p-5 rounded-lg shadow-md mb-4">
                  <p className="italic mb-3">
                    &ldquo;Tenho alunos que nunca pegaram um livro sem reclamar.  
                    Depois de duas semanas usando o projeto, eles começaram a pedir mais.  
                    Um deles até me perguntou quando seria a próxima leitura.  
                    Eu fiquei em choque, de verdade.  
                    É simples, mas funciona.&rdquo;
                  </p>
                  <p className="text-right font-medium text-[#1D3557]">– Prof. Juliana P.</p>
                  <p className="text-right text-xs text-gray-500 italic">Marabá - PA</p>
                </div>
                <div className="bg-white text-gray-800 p-5 rounded-lg shadow-md">
                  <p className="italic mb-3">
                    &ldquo;Eu me sentia sozinha na sala. Tentava de tudo e parecia que ninguém ligava.  
                    Hoje em dia, com tanto estímulo rápido, competir com um livro virou quase impossível.  
                    Mas com o projeto, algo virou. Os alunos começaram a participar, comentar os livros, até competir entre si.  
                    Eu voltei a sentir vontade de planejar. Foi como tirar um peso das costas.&rdquo;
                  </p>
                  <p className="text-right font-medium text-[#1D3557]">– Prof. Renata M.</p>
                  <p className="text-right text-xs text-gray-500 italic">Belo Horizonte - MG</p>
                </div>
              </div>            
          </section>

          {/* Why It Works Section */}
<section className="bg-white rounded-lg shadow-lg p-8 mb-20">
  <h2 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-8 border-b-2 border-[#a8dadc] pb-3 uppercase text-center">
    Por que o recurso Missão Literária funciona?
  </h2>

  <p className="text-xl text-[#1D3557] mb-8 text-left leading-relaxed">
    O segredo está no equilíbrio entre emoção, estrutura e incentivo.  
    O aluno é guiado com leveza e motivado a continuar porque se sente parte de um desafio real e estimulante.
  </p>

  <div className="grid grid-cols-1 gap-8 mb-8">

    {/* Método tradicional - sem emoção, sem sistema */}
    <div className="bg-[#f8f9fa] p-6 rounded-lg border-l-4 border-[#e63946]">
      <p className="font-bold text-lg mb-4 text-[#1D3557]">❌ Abordagem comum</p>
      <ul className="space-y-2 text-gray-800">
        <li>• Leituras obrigatórias, sem conexão emocional</li>
        <li>• Atividades soltas, sem continuidade nem propósito</li>
        <li>• Falta de acompanhamento claro: o professor tenta de tudo, mas não consegue medir o progresso</li>
      </ul>
    </div>

    {/* Projeto Literário - estruturado e emocionalmente envolvente */}
    <div className="bg-[#f8f9fa] p-6 rounded-lg border-l-4 border-[#6bbbed]">
      <p className="font-bold text-lg mb-4 text-[#1D3557]">💙 Missão Literária</p>
      <ul className="space-y-2 text-gray-800">
        <li>• Cada ficha guia a leitura de forma estruturada, despertando o lado emocional e imaginativo da criança</li>
        <li>• A estante interativa cria uma competição saudável e visível, os alunos querem avançar por vontade própria</li>
        <li>• O professor aplica com facilidade e consegue acompanhar o progresso de forma clara e prática</li>
      </ul>
    </div>

  </div>
</section>   

{/* Final CTA Section */}
<section className="bg-white rounded-lg shadow-lg p-8 mb-20">
  <h2 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-8 border-b-2 border-[#a8dadc] pb-3 uppercase text-center">
    Agora é sua vez!
  </h2>  
    <p className="text-xl text-gray-800 mb-4 leading-relaxed">
      Você pode continuar tentando sozinha, montando tudo do zero, insistindo com estratégias que cansam você mais do que engajam os alunos...
    </p>
    <p className="text-xl text-gray-800 mb-4 leading-relaxed">
      Ou pode aplicar um recurso leve, pronto e já validado por milhares de professores que transforma a leitura em algo que seus alunos realmente querem viver.
    </p>
    <p className="fontext-md italic text-[#1D3557] mb-8 leading-relaxed">
      📌 O acesso com desconto e bônus está liberado só por tempo limitado. Se sentir que é pra você, essa é a hora de fazer diferente.
    </p>
    <a 
      href="https://seguro.profdidatica.com.br/r/HDJYH7SZJ6?promocode=PL40OFF"      
      rel="noopener noreferrer"
      className="block w-full bg-gradient-to-r from-[#457B9D] to-[#1D3557] hover:from-[#1D3557] hover:to-[#457B9D] text-white text-base sm:text-lg font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden group text-center uppercase"
    >
      Sim! quero meus alunos apaixonados pela leitura
    </a>  
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
                    <span className="font-medium text-[#1D3557] text-lg">Para qual faixa etária esse material é indicado?</span>
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      <FaChevronDown className="h-5 w-5 text-[#457B9D]" />
                    </span>
                  </summary>
                  <div className="p-4 bg-white">
                    <p className="text-gray-800">O recurso Missão Literária foi criado especialmente para alunos do Ensino Fundamental I. Já foi aplicado com sucesso do 2º ao 5º ano, com excelente adaptação em diferentes realidades.</p>
                  </div>
                </details>
              </div>

              {/* FAQ Item 2 */}
              <div className="border border-[#a8dadc] rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between gap-3 p-4 bg-[#f8f9fa] cursor-pointer">
                    <span className="font-medium text-[#1D3557] text-lg">O material é digital ou físico?</span>
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      <FaChevronDown className="h-5 w-5 text-[#457B9D]" />
                    </span>
                  </summary>
                  <div className="p-4 bg-white">
                    <p className="text-gray-800">O material é 100% digital. Assim que a compra é confirmada, você recebe tudo por e-mail e Whatsapp, pronto para baixar e imprimir quantas vezes quiser.</p>
                  </div>
                </details>
              </div>

              {/* FAQ Item 3 */}
              <div className="border border-[#a8dadc] rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between gap-3 p-4 bg-[#f8f9fa] cursor-pointer">
                    <span className="font-medium text-[#1D3557] text-lg">Preciso de muito tempo para aplicar esse sistema?</span>
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      <FaChevronDown className="h-5 w-5 text-[#457B9D]" />
                    </span>
                  </summary>
                  <div className="p-4 bg-white">
                    <p className="text-gray-800">Não. O recurso foi pensado para facilitar a rotina do professor. Você imprime as fichas, segue o passo a passo e já percebe os alunos mais engajados nos primeiros dias.</p>
                  </div>
                </details>
              </div>

              {/* FAQ Item 4 */}
              <div className="border border-[#a8dadc] rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between gap-3 p-4 bg-[#f8f9fa] cursor-pointer">
                    <span className="font-medium text-[#1D3557] text-lg">Como recebo o material após a compra?</span>
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      <FaChevronDown className="h-5 w-5 text-[#457B9D]" />
                    </span>
                  </summary>
                  <div className="p-4 bg-white">
                    <p className="text-gray-800">Depois do pagamento, você recebe um e-mail e uma mensagem no seu Whatsapp com o link para download do Google Drive. É tudo simples, direto e com acesso imediato.</p>
                  </div>
                </details>
              </div>

              {/* FAQ Item 5 */}
              <div className="border border-[#a8dadc] rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between gap-3 p-4 bg-[#f8f9fa] cursor-pointer">
                    <span className="font-medium text-[#1D3557] text-lg">Posso usar o material com todas as minhas turmas?</span>
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      <FaChevronDown className="h-5 w-5 text-[#457B9D]" />
                    </span>
                  </summary>
                  <div className="p-4 bg-white">
                    <p className="text-gray-800">Sim. Você pode usar com todos os seus alunos, durante o ano inteiro, quantas vezes quiser. Não há limite de impressão ou de uso em sala.</p>
                  </div>
                </details>
              </div>

              {/* FAQ Item 6 */}
              <div className="border border-[#a8dadc] rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between gap-3 p-4 bg-[#f8f9fa] cursor-pointer">
                    <span className="font-medium text-[#1D3557] text-lg">Funciona mesmo com turmas mais difíceis ou alunos desmotivados?</span>
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      <FaChevronDown className="h-5 w-5 text-[#457B9D]" />
                    </span>
                  </summary>
                  <div className="p-4 bg-white">
                    <p className="text-gray-800">Sim. O material foi pensado justamente para esse tipo de desafio. As atividades despertam curiosidade, envolvem emocionalmente e criam um clima de competição saudável. Mesmo alunos que não gostam de ler acabam participando naturalmente.</p>
                  </div>
                </details>
              </div>

              {/* FAQ Item 7 */}
              <div className="border border-[#a8dadc] rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between gap-3 p-4 bg-[#f8f9fa] cursor-pointer">
                    <span className="font-medium text-[#1D3557] text-lg">E se eu não tiver experiência com projetos assim?</span>
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      <FaChevronDown className="h-5 w-5 text-[#457B9D]" />
                    </span>
                  </summary>
                  <div className="p-4 bg-white">
                    <p className="text-gray-800">Não tem problema. O material vem com um manual de aplicação completo, pensado para quem nunca trabalhou com esse tipo de proposta. Você não precisa adaptar nada nem inventar atividades. É só seguir o que está pronto.</p>
                  </div>
                </details>
              </div>
            </div>
          </section>

       
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-[#6bbbed] py-4 text-center text-white">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} Prof Didática - Todos os direitos reservados</p>
        </div>
      </footer>
      {/* Botão Fixo */}
      {isVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 py-8 bg-white/90 shadow-2xl backdrop-blur-sm">
          <a 
            href="https://seguro.profdidatica.com.br/r/HDJYH7SZJ6?promocode=PL40OFF"            
            rel="noopener noreferrer"
            className="block w-full max-w-xs mx-auto text-white px-4 py-2 rounded-xl shadow-xl hover:scale-105 transition-all duration-300 text-center text-sm font-semibold uppercase
            bg-gradient-to-r from-[#457B9D] to-[#1D3557] 
            animate-gradient-x 
            bg-[length:200%_auto] 
            hover:bg-[position:right_center]"
          >
            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative">
            Quero meus alunos apaixonados pela leitura
            </span>
          </a>          
        </div>
      )}
    </div>
  );
}
