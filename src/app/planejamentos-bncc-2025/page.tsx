import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OFERTA ESPECIAL: Planejamentos BNCC 2025 | Prof. Didática',
  description:
    'ESPERE! Oferta exclusiva para você: Planejamentos alinhados à BNCC para 2025 com 50% de desconto. Tempo limitado!',
};

export default function PlanejamentosBNCC2025() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50">
      {/* Barra de Urgência */}
      <div className="w-full bg-red-600 text-white py-3 px-4 sticky top-0 z-50">
        <div className="container mx-auto max-w-6xl flex justify-center items-center text-center">
          <div className="animate-pulse mr-3">⏱️</div>
          <p className="font-bold">
            OFERTA ESPECIAL POR TEMPO LIMITADO - Aproveite enquanto está disponível!
          </p>
        </div>
      </div>

      {/* Header de Upsell */}
      <section className="w-full bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-10 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-yellow-500 text-black font-bold py-2 px-6 rounded-full inline-block mb-6 transform -rotate-2">
            ESPERE! NÃO SAIA AINDA
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Oferta Exclusiva para Você</h1>
          <p className="text-xl md:text-2xl mb-6 text-blue-100">
            Complete sua jornada educacional com nossos planejamentos alinhados à BNCC 2025
          </p>
        </div>
      </section>

      {/* Detalhes da Oferta */}
      <section className="w-full py-12 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <div className="relative overflow-hidden rounded-xl shadow-2xl">
                <div className="absolute top-0 left-0 bg-red-600 text-white py-1 px-4 font-bold z-10 rounded-br-lg">
                  -50% OFF
                </div>
                <iframe
                  className="w-full h-[300px]"
                  src="https://www.youtube.com/embed/YpWOoMqTbJU"
                  title="Planejamentos BNCC 2025"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="mt-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-800 font-medium">
                  "Os planejamentos da Prof. Didática salvaram meu ano letivo. Economizei mais de 40
                  horas de trabalho!" - Maria S., Professora
                </p>
              </div>
            </div>

            <div className="md:w-1/2">
              <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-xl shadow-lg border border-indigo-100">
                <h2 className="text-3xl font-bold mb-6 text-indigo-800">Planejamentos BNCC 2025</h2>
                <div className="mb-6 bg-yellow-100 p-4 rounded-lg border-l-4 border-yellow-500">
                  <p className="text-yellow-800 font-medium">
                    Oferta disponível apenas nesta página. Não será oferecida novamente!
                  </p>
                </div>
                <ul className="mb-6 space-y-3">
                  <li className="flex items-start">
                    <span className="bg-green-500 text-white rounded-full p-1 mr-3 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <div>
                      <span className="font-bold text-gray-800">Planejamentos completos</span>
                      <p className="text-gray-600">Para todos os anos do Ensino Fundamental</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-500 text-white rounded-full p-1 mr-3 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <div>
                      <span className="font-bold text-gray-800">100% alinhados à BNCC</span>
                      <p className="text-gray-600">Atualizados com as novas diretrizes</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-500 text-white rounded-full p-1 mr-3 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <div>
                      <span className="font-bold text-gray-800">Formato editável</span>
                      <p className="text-gray-600">Personalize conforme sua necessidade</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-500 text-white rounded-full p-1 mr-3 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <div>
                      <span className="font-bold text-gray-800">Acesso imediato</span>
                      <p className="text-gray-600">Comece a usar hoje mesmo</p>
                    </div>
                  </li>
                </ul>

                <div className="flex items-center justify-center mb-6">
                  <div className="text-center mr-4">
                    <p className="text-gray-500 line-through">R$ 197,00</p>
                    <p className="text-3xl font-bold text-red-600">R$ 97,00</p>
                  </div>
                  <div className="bg-red-600 text-white p-3 rounded-full font-bold">
                    ECONOMIZE
                    <br />
                    R$ 100,00
                  </div>
                </div>

                <div className="mb-6">
                  <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-red-500"
                      style={{ width: '78%' }}
                    ></div>
                  </div>
                  <p className="text-sm text-center mt-2 text-gray-700">
                    Oferta disponível para <span className="font-bold">apenas 22%</span> dos
                    professores
                  </p>
                </div>

                <Link
                  href="https://go.hotmart.com/Y95346151G?ap=21d9"
                  className="bg-green-600 hover:bg-green-500 text-white font-bold py-5 px-8 rounded-lg text-xl block w-full transition-all transform hover:scale-105 text-center shadow-lg mb-4"
                >
                  GARANTIR MINHA OFERTA ESPECIAL
                </Link>

                <p className="text-sm text-center text-gray-500">
                  Pagamento 100% seguro • Acesso imediato • Garantia de 7 dias
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Urgência */}
      <section className="w-full py-10 px-4 bg-red-50 border-t border-b border-red-100">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-2xl font-bold mb-4 text-red-800">
            Esta oferta exclusiva expira em breve!
          </h3>
          <p className="text-gray-700 mb-6">
            Essa é uma oportunidade única para adquirir nossos planejamentos com 50% de desconto.
            Não ofereceremos este preço novamente.
          </p>
          <Link
            href="https://go.hotmart.com/Y95346151G?ap=21d9"
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-lg text-lg inline-block transition-all transform hover:scale-105 shadow-md"
          >
            APROVEITAR ESTA OFERTA AGORA
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-2xl font-bold mb-8 text-center text-gray-800">
            Perguntas Frequentes
          </h3>

          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h4 className="font-bold text-lg text-gray-800 mb-2">
                Como vou receber os planejamentos?
              </h4>
              <p className="text-gray-600">
                Após a confirmação do pagamento, você receberá um email com o acesso à área de
                membros onde poderá baixar todos os planejamentos em formato editável.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h4 className="font-bold text-lg text-gray-800 mb-2">
                Os planejamentos são atualizados?
              </h4>
              <p className="text-gray-600">
                Sim! Todos os planejamentos foram atualizados para 2025 e estão em conformidade com
                a versão mais recente da BNCC.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h4 className="font-bold text-lg text-gray-800 mb-2">
                Posso usar em qualquer escola?
              </h4>
              <p className="text-gray-600">
                Com certeza! Nossos planejamentos são adaptáveis a qualquer instituição de ensino e
                podem ser personalizados conforme suas necessidades específicas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Último CTA */}
      <section className="w-full py-16 px-4 bg-gradient-to-r from-indigo-800 to-blue-900 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Não deixe esta oportunidade passar!
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Economize tempo, reduza o estresse e eleve a qualidade das suas aulas com nossos
            planejamentos BNCC 2025.
          </p>

          <Link
            href="https://go.hotmart.com/Y95346151G?ap=21d9"
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-5 px-10 rounded-lg text-xl inline-block transition-all transform hover:scale-105 shadow-xl"
          >
            QUERO GARANTIR MEU ACESSO AGORA
          </Link>

          <p className="mt-6 text-sm text-blue-200">
            Pagamento 100% seguro • Acesso imediato • Garantia de satisfação
          </p>
        </div>
      </section>
    </main>
  );
}
