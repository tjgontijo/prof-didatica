'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const TestePage: React.FC = () => {
  const router = useRouter();

  // Dados do produto fictício
  const produto = {
    nome: 'Curso de Matemática Divertida',
    valorOriginal: 97,
    valorDesconto: 67,
    imagemUrl: '/images/system/logo_transparent.webp', // Usando uma imagem existente
    sku: 'MATH-001',
    descricao: 'Aprenda matemática de forma divertida e eficaz com este curso completo.'
  };

  // Função para redirecionar para o checkout com dados via POST
  const irParaCheckout = async () => {
    try {
      // Enviar os dados do produto via POST para uma API intermediária
      const resposta = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ produto }),
      });
      
      if (!resposta.ok) {
        throw new Error('Erro ao iniciar o checkout');
      }
      
      // Redirecionar para a página de checkout
      router.push('/checkout');
    } catch (erro) {
      console.error('Erro ao processar o checkout:', erro);
      alert('Ocorreu um erro ao iniciar o checkout. Por favor, tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Header */}
      <header className="w-full bg-[#2c4f71] h-[80px] flex items-center justify-center">
        <div className="flex justify-center items-center">
          <Image
            src="/images/system/logo_transparent.webp"
            alt="Prof Didática"
            width={80}
            height={80}
            className="h-auto w-auto max-h-[80px]"
          />
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Imagem do produto */}
            <div className="md:w-1/2 bg-[#457B9D] flex items-center justify-center p-8">
              <div className="relative w-full h-64">
                <Image
                  src="/images/system/logo_transparent.webp"
                  alt={produto.nome}
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Informações do produto */}
            <div className="md:w-1/2 p-8">
              <h1 className="text-2xl font-bold text-[#1D3557] mb-4">{produto.nome}</h1>
              
              <p className="text-gray-600 mb-6">{produto.descricao}</p>
              
              <div className="mb-6">
                <span className="text-gray-500 line-through mr-3">R$ {produto.valorOriginal.toFixed(2)}</span>
                <span className="text-3xl font-bold text-[#457B9D]">R$ {produto.valorDesconto.toFixed(2)}</span>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Acesso imediato após a compra</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Material completo em PDF</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Suporte via WhatsApp</span>
                </div>
              </div>
              
              <button
                onClick={irParaCheckout}
                className="w-full bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white py-3 px-6 rounded-lg font-semibold hover:from-[#1D3557] hover:to-[#457B9D] transition-all duration-300 transform hover:scale-[1.02]"
              >
                Comprar Agora
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#2c4f71] py-4 text-center text-white">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} Prof Didática - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
};

export default TestePage;