"use client";

import CarrosselProjeto from "@/components/carrossel/CarrosselProjeto";
import { FaChevronDown } from 'react-icons/fa';
import { useEffect, useState } from "react";

export default function Page() {
  // Estado para o contador regressivo
  const [timeLeft, setTimeLeft] = useState({
    minutes: 8,
    seconds: 0
  });

  // Estado para a quantidade de produtos
  const [produtosRestantes, setProdutosRestantes] = useState(9);
  
  // Efeito para o contador regressivo
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        const newSeconds = prevTime.seconds - 1;
        
        if (newSeconds >= 0) {
          return { ...prevTime, seconds: newSeconds };
        }
        
        const newMinutes = prevTime.minutes - 1;
        
        if (newMinutes >= 0) {
          return { minutes: newMinutes, seconds: 59 };
        }
        
        // Quando o timer chegar a zero, reiniciar para 8 minutos
        return { minutes: 8, seconds: 0 };
      });
    }, 1000);
    
    // Simular diminuição gradual do estoque
    const estoqueTimer = setInterval(() => {
      if (produtosRestantes > 3) {
        setProdutosRestantes(prev => {
          // Se chegar a 3, reiniciar para 9
          if (prev <= 3) {
            return 9;
          }
          return prev - 1;
        });
      }
    }, 30000); // A cada 30 segundos diminui 1 produto
    
    // Limpar os intervalos quando o componente for desmontado
    return () => {
      clearInterval(timer);
      clearInterval(estoqueTimer);
    };
  }, [produtosRestantes]);

  // Formatar o tempo para exibição
  const formatTime = (time: number) => {
    return time.toString().padStart(2, '0');
  };

  // Calcular a porcentagem de produtos restantes para a barra de progresso
  const estoquePercentual = (produtosRestantes / 10) * 100;
  
  // Verificar se está nos últimos minutos da oferta
  const urgencia = timeLeft.minutes < 5;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa]">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-10">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <section className="text-center mb-20">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1D3557] mb-6">
              Transforme seus Alunos em Leitores Apaixonados!
            </h1>
            <h2 className="text-xl md:text-2xl text-[#457B9D] mb-4 max-w-3xl mx-auto">
              Método comprovado que faz seus alunos competirem para ler mais livros!
            </h2>
            
            {/* Carrossel de imagens */}
            <div className="w-full max-w-2xl mx-auto mb-8">
              <p className="text-xs text-[#1D3557] italic mb-2">
                Conheça o Projeto Literário:
              </p>
              <CarrosselProjeto />
            </div>
            
            {/* Bloco de preço e checkout - Versão melhorada */}
            <div className="w-full bg-white rounded-lg shadow-xl p-4 border-2 border-[#a8dadc] my-20 relative max-w-3xl mx-auto">
              {/* Badge de oferta por tempo limitado */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#457B9D] text-white mt-1 px-4 py-2 rounded-full text-sm font-bold shadow-md">
                Oferta por tempo limitado!
              </div>
              
              <div className="grid grid-cols-1 gap-6 items-center">
                {/* Coluna de informações do produto */}
                <div className="text-left">                  
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#1D3557] mt-6 mb-2">Projeto Literário</h3>                  
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                    </div>
                    <span className="text-sm text-gray-500 ml-2">(368 avaliações)</span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-base line-through text-gray-500">R$ 27,00</span>
                      <span className="bg-[#457B9D] text-white text-xs px-2 py-1 rounded-md font-bold">-45%</span>
                    </div>
                    <div className="text-[#457B9D] text-4xl font-bold mb-1">R$ 15,00</div>
                    <p className="text-sm text-gray-600">ou 3x de R$ 5,49</p>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-700 mb-4">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Ganhe <span className="text-green-600 font-medium">20% de cashback</span> na sua próxima compra
                  </div>
                  
                  {/* Benefícios rápidos */}
                  <div className="bg-[#f8f9fa] p-3 rounded-lg mb-4">
                    <p className="font-medium text-[#1D3557] mb-2 text-sm">O que você recebe:</p>
                    <ul className="space-y-1">
                      <li className="flex items-start text-sm">
                        <svg className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-zinc-700">15 fichas literárias completas</span>
                      </li>
                      <li className="flex items-start text-sm">
                        <svg className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-zinc-700">Estante interativa para acompanhamento</span>
                      </li>
                      <li className="flex items-start text-sm">
                        <svg className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-zinc-700">Acesso imediato após a compra</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Bônus */}
                  <div className="bg-[#a8dadc]/20 p-3 rounded-lg mb-4">
                    <p className="font-medium text-[#1D3557] mb-2 text-sm">Bônus especial:</p>
                    <div className="flex items-start text-sm">
                      <svg className="w-4 h-4 text-[#457B9D] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
                      </svg>
                      <span className="text-zinc-700">Apostila com 50 páginas para criação de frases e textos</span>
                    </div>
                  </div>
                </div>
                
                {/* Coluna de ação de compra */}
                <div className="bg-[#f8f9fa] p-4 sm:p-6 rounded-lg border border-[#a8dadc] shadow-md">
                  {/* Contador de estoque */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-[#1D3557]">
                        Apenas <span className="font-bold text-[#457B9D]">{produtosRestantes}</span> {produtosRestantes === 1 ? 'produto' : 'produtos'} em estoque
                      </p>
                      <span className={`text-xs ${produtosRestantes <= 3 ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'} px-2 py-1 rounded font-medium`}>
                        {produtosRestantes <= 3 ? 'Acabando!' : 'Limitado'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`${produtosRestantes <= 3 ? 'bg-[#457B9D]' : 'bg-[#6bbbed]'} h-2.5 rounded-full transition-all duration-500`}
                        style={{ width: `${estoquePercentual}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Timer */}
                  <div className="mb-6">
                    <p className="text-sm font-medium text-[#1D3557] mb-2">
                      Oferta termina em:
                    </p>
                    <div className="flex justify-center gap-2">
                      <div className="bg-[#1D3557] text-white rounded-md p-2 w-20 sm:w-24 text-center">
                        <span className="text-lg sm:text-xl font-bold block">{formatTime(timeLeft.minutes)}</span>
                        <span className="text-xs">Minutos</span>
                      </div>
                      <div className={`bg-[#1D3557] text-white rounded-md p-2 w-20 sm:w-24 text-center ${urgencia ? 'animate-pulse' : ''}`}>
                        <span className="text-lg sm:text-xl font-bold block">{formatTime(timeLeft.seconds)}</span>
                        <span className="text-xs">Segundos</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botão de compra */}
                  <a 
                    href="https://seguro.profdidatica.com.br/r/HDJYH7SZJ6?promocode=PL45OFF"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full bg-gradient-to-r from-[#457B9D] to-[#1D3557] hover:from-[#1D3557] hover:to-[#457B9D] text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-md text-center text-base sm:text-lg uppercase tracking-wide transition-all transform hover:scale-105 shadow-lg hover:shadow-xl`}
                  >
                    Comprar Agora
                  </a>
                  
                  {/* Garantias */}
                  <div className="mt-4 flex flex-col items-center justify-center space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                      </svg>
                      Compra 100% segura
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                      </svg>
                      Pagamento facilitado
                    </div>
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
            <div className="grid grid-cols-1  gap-6 mb-8">
              <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl text-[#457B9D] mt-1">📖</div>
                  <p className="font-bold text-lg text-[#1D3557]">Desenvolvem o hábito e o gosto pela leitura</p>
                </div>                
              </div>
              
              <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl text-[#457B9D] mt-1">🔍</div>
                  <p className="font-bold text-lg text-[#1D3557]">Ampliam o vocabulário e a compreensão leitora</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl text-[#457B9D] mt-1">✨</div>
                  <p className="font-bold text-lg text-[#1D3557]">Estimulam a criatividade e imaginação</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl text-[#457B9D] mt-1">✏️</div>
                  <p className="font-bold text-lg text-[#1D3557]">Aprimoram as habilidades de escrita</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl text-[#457B9D] mt-1">🏆</div>
                  <p className="font-bold text-lg text-[#1D3557]">Competição saudável entre os alunos</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl text-[#457B9D] mt-1">🔥</div>
                  <p className="font-bold text-lg text-[#1D3557]">Aumentam o engajamento nas aulas</p>
                </div>
              </div>
            </div>
          </section>

          {/* Problem Section */}
          <section className="bg-white rounded-lg shadow-lg p-8 mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-6 border-b-2 border-[#a8dadc] pb-3 text-center uppercase">
              O problema que todo professor enfrenta
            </h2>
            <p className="text-gray-800 text-xl mb-4">
              Sabe aquele aluno que sempre diz que não gosta de ler? Que faz tudo arrastando, sem vontade nenhuma, sempre reclamando?
            </p>
            <p className="text-gray-800 text-xl mb-4">
              Você entra na sala cheia de expectativas, preparou uma atividade incrível, escolheu um livro interessante, mas… metade da turma nem abriu a leitura.
            </p>
            <p className="text-gray-800 text-xl mb-6">
              E o pior: quando chega a hora de discutir a história, só dois ou três alunos participam. O resto fica quieto, olhando para os lados, esperando o tempo passar.
            </p>
            <div className="bg-[#f8f9fa] p-6 rounded-lg mb-6">
              <p className="text-gray-800 text-xl mb-4">
                A frustração é inevitável. Assim como eu, talvez você já tenha tentado de tudo:
              </p>
              <ul className="mb-6 ml-6 space-y-3">
                <li className="text-[#e63946] font-medium text-lg">❌ Resumos obrigatórios</li>
                <li className="text-[#e63946] font-medium text-lg">❌ Leituras em grupo</li>
                <li className="text-[#e63946] font-medium text-lg">❌ Atividades sobre os livros</li>
              </ul>
              <p className="text-gray-800 text-xl mb-0">
                Mas nada parece funcionar.
              </p>
            </div>
            <p className="text-gray-800 text-xl mb-6">
              Você se dedica, se esforça, quer que seus alunos descubram o prazer da leitura… mas sente que está lutando sozinha.
            </p>
            <p className="block text-lg text-[#1D3557] text-center italic">
              Você não precisa continuar assim...
            </p>
          </section>

          {/* Solution Section */}
          <section className="bg-white rounded-lg shadow-lg p-8 mb-20">
          <div className="relative mb-10">
  <div className="absolute -top-3 left-4 bg-[#a8dadc] text-[#1D3557] px-4 py-1 rounded-full text-sm font-medium">
    Imagine só...
      </div>
        <h2 className="text-2xl md:text-3xl  text-[#1D3557] p-6 bg-[#f8f9fa] rounded-lg shadow-md border-2 border-dashed border-[#a8dadc]">
          <span className="italic">Esse mesmo aluno disputando com os colegas para ser o próximo a apresentar um livro na frente da turma...</span>
          <span className="absolute -right-2 -bottom-2 text-3xl">💭</span>
        </h2>
      </div>
            <div className="flex flex-col gap-8 items-center mb-6">
                <p className="text-gray-800 text-xl mb-4">
                Aquele aluno que dizia que ler é chato, agora mal pode esperar a próxima aula para contar sobre o livro que acabou de terminar.
                </p>
                <p className="text-gray-800 text-xl mb-4">
                  Com o Projeto Literário, a leitura se transforma em um desafio saudável, envolvente e motivador. Seus alunos podem competir entre eles ou até com outras salas.
                </p>
              <div className="bg-gradient-to-br from-[#457B9D] to-[#1D3557] p-6 rounded-lg shadow-lg border-l-4 border-[#E63946]">
                <div className="flex items-start gap-3">
                  <div className="bg-white rounded-full p-2 shadow-md">
                    <span className="text-2xl">👩‍🏫</span>
                  </div>
                  <p className="text-white font-medium text-xl mb-0">
                    <span className="block font-bold mb-1">De professor para professor:</span>
                    Esse sistema já mudou a minha realidade e a de centenas de alunos e professores.
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
                  <p className="text-gray-800 text-left w-full">Questões e reflexões que incentivam os alunos a pensar criticamente sobre o livro, desenvolvendo habilidades essenciais de interpretação.</p>
                </div>
              </div>
              <div className="bg-[#f8f9fa] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-3">🎨</div>
                  <p className="font-bold text-[#1D3557] text-xl mb-3 text-center">Estante interativa para acompanhar o progresso</p>
                  <p className="text-gray-800 text-left w-full">Um sistema visual onde cada aluno registra suas leituras, criando uma motivação extra para ler cada vez mais.</p>
                </div>
              </div>
              <div className="bg-[#f8f9fa] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-3">✍️</div>
                  <p className="font-bold text-[#1D3557] text-xl mb-3 text-center">Propostas de produção textual</p>
                  <p className="text-gray-800 text-left w-full">Exercícios práticos que estimulam a escrita criativa e ajudam os alunos a expressar suas ideias sobre as histórias lidas.</p>
                </div>
              </div>
              <div className="bg-[#f8f9fa] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="font-bold text-[#1D3557] text-xl mb-3 text-center">Tabela de acompanhamento personalizada</p>
                  <p className="text-gray-800 text-left w-full">Uma ferramenta simples para que você possa registrar quais alunos já leram, o progresso de cada um e identificar quem precisa de mais incentivo.</p>
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

          {/* How It Works Section */}
          <section className="bg-white rounded-lg shadow-lg p-8 mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-8 border-b-2 border-[#a8dadc] pb-3 uppercase text-center">
              Como funciona na prática?
            </h2>
            <div className="grid grid-cols-1 gap-8 mb-10">
              <div className="bg-gradient-to-br from-[#6bbbed] to-[#457B9D] text-white p-6 rounded-xl shadow-lg text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col items-center justify-center border-b-4 border-[#1D3557]">
                <div className="bg-white text-[#1D3557] w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-md">1</div>
                <p className="font-medium text-lg">O aluno recebe um livro e uma ficha literária</p>
                <div className="mt-4 text-3xl">📚</div>
              </div>
              
              <div className="bg-gradient-to-br from-[#6bbbed] to-[#457B9D] text-white p-6 rounded-xl shadow-lg text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col items-center justify-center border-b-4 border-[#1D3557]">
                <div className="bg-white text-[#1D3557] w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-md">2</div>
                <p className="font-medium text-lg">Após a leitura, ele colore um livro na estante interativa</p>
                <div className="mt-4 text-3xl">🎨</div>
              </div>
              
              <div className="bg-gradient-to-br from-[#6bbbed] to-[#457B9D] text-white p-6 rounded-xl shadow-lg text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col items-center justify-center border-b-4 border-[#1D3557]">
                <div className="bg-white text-[#1D3557] w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-md">3</div>
                <p className="font-medium text-lg">A turma acompanha o progresso de todos</p>
                <div className="mt-4 text-3xl">📊</div>
              </div>
              
              <div className="bg-gradient-to-br from-[#6bbbed] to-[#457B9D] text-white p-6 rounded-xl shadow-lg text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col items-center justify-center border-b-4 border-[#1D3557]">
                <div className="bg-white text-[#1D3557] w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-md">4</div>
                <p className="font-medium text-lg">No final, os alunos mais engajados são premiados!</p>
                <div className="mt-4 text-3xl">🏆</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-6 rounded-lg border-l-4 border-[#a8dadc] shadow-md">
              <p className="text-center font-bold text-xl text-[#1D3557] mb-4">
                A leitura deixa de ser uma obrigação e se torna uma experiência divertida e envolvente!
              </p>
              <p className="text-center text-[#457B9D] text-xl font-medium">
                E o melhor: você não precisa mais insistir para que eles leiam. A própria Metodologia faz isso por você.
              </p>
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
                  <div className="text-2xl min-w-[30px]">✅</div>
                  <p className="text-xl text-gray-800 mb-4">
                    <strong>93%</strong> das professoras que aplicaram o Projeto Literário relatam que seus alunos passaram a ler mais.
                  </p>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="text-2xl min-w-[30px]">📈</div>
                  <p className="text-xl text-gray-800 mb-4">
                    O número de livros lidos por semestre <strong>mais do que dobrou</strong> no ano de 2024.
                  </p>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="text-2xl min-w-[30px]">🏆</div>
                  <p className="text-xl text-gray-800 mb-4">
                    Metodologia testada e aplicada em mais de <strong>8 mil</strong> alunos!
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#457B9D] text-white p-6 rounded-lg mb-8">
              <h3 className="font-bold text-xl mb-6 text-center border-b border-white pb-3">
                💬 Veja o que professoras estão dizendo:
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white text-gray-800 p-5 rounded-lg shadow-md">
                  <p className="italic mb-3">&ldquo;Meus alunos que não gostavam de ler agora competem para ver quem lê mais! Nunca vi um resultado tão rápido!&rdquo;</p>
                  <p className="text-right font-medium text-[#1D3557]">– Prof. Ana S.</p>
                </div>
                <div className="bg-white text-gray-800 p-5 rounded-lg shadow-md">
                  <p className="italic mb-3">&ldquo;Facilitou muito minha rotina! Agora os alunos têm mais autonomia na leitura e participam com entusiasmo.&rdquo;</p>
                  <p className="text-right font-medium text-[#1D3557]">– Prof. Júlia M.</p>
                </div>
                <div className="bg-white text-gray-800 p-5 rounded-lg shadow-md">
                  <p className="italic mb-3">&ldquo;Aplicação simples e eficaz. Nunca mais precisei insistir para que lessem.&rdquo;</p>
                  <p className="text-right font-medium text-[#1D3557]">– Prof. Marcos T.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Why It Works Section */}
          <section className="bg-white rounded-lg shadow-lg p-8 mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-8 border-b-2 border-[#a8dadc] pb-3 uppercase text-center">
              Por que o Projeto Literário funciona?
            </h2>
            <p className="text-xl text-[#1D3557] mb-8 text-left">
              Enquanto outros professores lutam para fazer os alunos lerem um livro por semestre, os seus vão querer ler um por semana!
            </p>
            <div className="grid grid-cols-1 gap-8 mb-8">
              <div className="bg-[#f8f9fa] p-6 rounded-lg border-l-4 border-[#e63946]">
                <p className="font-bold text-lg mb-4 text-[#1D3557]">❌ Método tradicional</p>
                <ul className="space-y-2 text-gray-800">
                  <li>• Alunos desmotivados</li>
                  <li>• Poucos livros lidos</li>
                  <li>• Leitura vista como obrigação</li>
                </ul>
              </div>
              <div className="bg-[#f8f9fa] p-6 rounded-lg border-l-4 border-[#6bbbed]">
                <p className="font-bold text-lg mb-4 text-[#1D3557]">❤ Projeto Literário</p>
                <ul className="space-y-2 text-gray-800">
                  <li>• Engajamento real</li>
                  <li>• Leitura divertida</li>
                  <li>• Alunos participando ativamente</li>
                </ul>
              </div>
            </div>          
          </section>

          {/* Pricing Section */}
          <section id="oferta-especial" className="bg-white rounded-lg shadow-lg p-6 mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-8 border-b-2 border-[#a8dadc] pb-3 uppercase text-center">
              Oferta Especial
            </h2>
            
            
              <div className="text-center mb-6 pt-4">
                <h3 className="text-xl sm:text-2xl font-bold text-[#457B9D] uppercase tracking-wider">Projeto Literário Completo</h3>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f9fa]">
                  <svg className="w-5 h-5 text-[#457B9D] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="font-medium text-[#1D3557]">15 fichas literárias envolventes</span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f9fa]">
                  <svg className="w-5 h-5 text-[#457B9D] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="font-medium text-[#1D3557]">Estante interativa para acompanhar o progresso</span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f9fa]">
                  <svg className="w-5 h-5 text-[#457B9D] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="font-medium text-[#1D3557]">Tabela de acompanhamento personalizada</span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f9fa]">
                  <svg className="w-5 h-5 text-[#457B9D] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="font-medium text-[#1D3557]">Manual de aplicação passo a passo</span>
                </li>

                <div className="mt-2 mb-3">
                  <span className="text-[#457B9D] font-semibold">+ Você também receberá:</span>
                </div>
                
                <li className="flex items-center gap-3 p-3 rounded-lg bg-[#a8dadc]/20">
                  <svg className="w-5 h-5 text-[#457B9D] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
                  </svg>
                  <span className="font-medium text-[#1D3557] text-left">Apostila com 50 páginas para criação de frases e textos.</span>
                </li>               
              </ul>

              <div className="text-center mb-6">
                <div className="inline-block relative">
                  <span className="absolute -top-3 -right-12 bg-[#457B9D] text-white text-xs font-bold py-1 px-2 rounded-full transform rotate-12">45% OFF</span>
                  <span className="text-5xl sm:text-6xl font-black text-[#1D3557]">R$15</span>
                </div>
                <p className="text-xs text-gray-600 mt-2 italic">
                  Aproveite antes que o estoque acabe
                </p>
              </div>

              <a 
                href="https://seguro.profdidatica.com.br/r/HDJYH7SZJ6?promocode=PL45OFF"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-[#457B9D] to-[#1D3557] hover:from-[#1D3557] hover:to-[#457B9D] text-white text-base sm:text-lg font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden group text-center"
              >
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity text-center"></div>
                <span className="relative">
                GARANTIR MEU PROJETO LITERÁRIO AGORA
                </span>
              </a>            
          </section>

          {/* FAQ Section */}
          <section className="bg-white rounded-lg shadow-lg p-8 mb-20">
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
                    <p className="text-gray-800">O Projeto Literário foi desenvolvido para alunos do Ensino Fundamental I e já foi aplicado com sucesso em diferentes idades.</p>
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
                    <p className="text-gray-800">O material é 100% digital. Você recebe o link para download imediato e pode imprimir quantas cópias precisar.</p>
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
                    <p className="text-gray-800">Não! O método foi pensado para facilitar a rotina do professor. Você implementa de forma simples e já vê os alunos engajados desde os primeiros dias.</p>
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
                    <p className="text-gray-800">Após a confirmação do pagamento, você receberá um e-mail com o link para acessar e baixar todo o material. O acesso é imediato!</p>
                  </div>
                </details>
              </div>

              {/* FAQ Item 5 */}
              <div className="border border-[#a8dadc] rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between gap-3 p-4 bg-[#f8f9fa] cursor-pointer">
                    <span className="font-medium text-[#1D3557] text-lg">Posso usar o material com toda a minha turma?</span>
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      <FaChevronDown className="h-5 w-5 text-[#457B9D]" />
                    </span>
                  </summary>
                  <div className="p-4 bg-white">
                    <p className="text-gray-800">Sim! Você pode imprimir e utilizar o material com todos os seus alunos. Não há limite de uso dentro da sua sala de aula.</p>
                  </div>
                </details>
              </div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="bg-gradient-to-r from-[#6bbbed] to-[#a8dadc] rounded-lg shadow-lg p-8 mb-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-6 uppercase">
              Agora é sua vez!
            </h2>
            <div className="bg-white p-6 rounded-lg mb-8 max-w-2xl mx-auto">
              <p className="text-xl text-gray-800 mb-4">
                Você pode continuar insistindo nas mesmas estratégias sem resultado...
              </p>
              <p className="text-xl text-gray-800 mb-4">
                Ou pode implementar um método já testado que vai transformar o interesse dos seus alunos pela leitura.
              </p>
              <p className="font-bold text-[#1D3557] bg-[#f8f9fa] p-3 rounded-lg">
                📌 O valor promocional e o bônus gratuito só estão disponíveis por tempo limitado!
              </p>
            </div>
            <a 
              href="https://seguro.profdidatica.com.br/r/HDJYH7SZJ6?promocode=PL45OFF"              
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#e63946] hover:bg-[#d62c3b] text-white font-bold py-4 px-10 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Quero Meu Projeto Literário Agora
            </a>
          </section>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-[#6bbbed] py-4 text-center text-white">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} Prof Didática - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}
