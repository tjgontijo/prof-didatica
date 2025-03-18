"use client";

import { useAbTestEvents } from '@/hooks/useAbTestEvents';
import CarrosselProjeto from "@/components/carrossel/carrosselProjeto";

type VariantAProps = {
  testId: string;
};

export default function VariantA({ testId }: VariantAProps) {
  const { trackPurchaseClick } = useAbTestEvents(testId);
  
  // Função para lidar com o clique no botão de compra
  const handlePurchaseClick = () => {
    trackPurchaseClick({
      product: 'projeto-literario',
      price: 15.00
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa]">
      {/* Indicador de variante (visível apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-50">
          Variante A
        </div>
      )}
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-10">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <section className="text-center mb-20">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1D3557] mb-6">
              Conheça o Método que Vai Fazer seus Alunos se Apaixonarem pela Leitura!
            </h1>
            <h2 className="text-xl md:text-2xl text-[#457B9D] mb-4 max-w-3xl mx-auto">
              Transforme suas aulas com um sistema que faz os alunos pedirem para ler o próximo livro!
            </h2>
            <p className="text-xs text-[#1D3557] italic mb-0">
              Conheça o Projeto Literário:            </p>
            {/* Carrossel de imagens */}
            <div className="w-full max-w-2xl mx-auto mb-10">
              <CarrosselProjeto />
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
                <p className="text-gray-700 pl-10">Que motiva e incentiva a leitura de mais livros</p>
              </div>
              
              <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl text-[#457B9D] mt-1">🔥</div>
                  <p className="font-bold text-lg text-[#1D3557]">Aumentam o engajamento nas aulas</p>
                </div>
                <p className="text-gray-700 pl-10">Tornando a leitura um momento esperado e desejado</p>
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
              <h3 className="font-bold text-xl mb-6 text-center border-b border-white pb-3">💬 Veja o que professoras estão dizendo:</h3>
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
            
            <div className="bg-white rounded-2xl p-4 relative transform transition-all duration-300 hover:scale-[1.02] border-2 border-[#a8dadc] shadow-[0_8px_40px_-12px_rgba(69,123,157,0.5)] max-w-3xl mx-auto">
              <div className="text-center mb-6 pt-4">
                <h3 className="text-2xl font-bold text-[#457B9D] uppercase tracking-wider">Projeto Literário Completo</h3>
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
                  <span className="absolute -top-3 -right-12 bg-[#e63946] text-white text-xs font-bold py-1 px-2 rounded-full transform rotate-12">55% OFF</span>
                  <span className="text-6xl font-black text-[#1D3557]">R$15</span>
                </div>
                <p className="text-xs text-gray-600 mt-2 italic">
                  Aproveite antes que volte para R$27
                </p>
              </div>

              <a 
                href="https://seguro.profdidatica.com.br/r/HDJYH7SZJ6"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handlePurchaseClick}
                className="block w-full bg-gradient-to-r from-[#457B9D] to-[#1D3557] hover:from-[#1D3557] hover:to-[#457B9D] text-white text-lg font-bold py-4 px-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden group text-center"
              >
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity text-center"></div>
                <span className="relative">
                GARANTIR MEU PROJETO LITERÁRIO AGORA
                </span>
              </a>
            </div>

            {/* Texto de Justificativa */}
            <div className="mt-8 mb-4 text-center max-w-2xl mx-auto">
              <p className="text-gray-600 text-sm">
              ATENÇÃO: Esta oferta especial está disponível apenas por tempo limitado para os próximos 50 professores determinados a transformar suas aulas de leitura.
              </p>
            </div>
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#457B9D]" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#457B9D]" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#457B9D]" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#457B9D]" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#457B9D]" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
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
              href="https://seguro.profdidatica.com.br/r/HDJYH7SZJ6"              
              className="inline-block bg-[#e63946] hover:bg-[#d62c3b] text-white font-bold py-4 px-10 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Quero o Projeto Literário Agora
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
