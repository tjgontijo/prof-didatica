'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import Image from 'next/image';
import { initMercadoPago } from '@mercadopago/sdk-react';
import { FaWhatsapp, FaSpinner, FaCopy } from 'react-icons/fa';


initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || 'TEST-95f388d1-4d79-411f-8f5e-80cf69cb96c4');


const clienteSchema = z.object({
  nome: z.string()
    .min(1, 'Nome é obrigatório')
    .refine((val) => val.trim().split(/\s+/).length >= 2, {
      message: 'Informe o nome completo (nome e sobrenome)'
    }),
  email: z.string().email('E-mail inválido'),
  telefone: z.string()
    .refine((val) => val.replace(/\D/g, '').length >= 11, {
      message: 'WhatsApp deve ter pelo menos 11 dígitos'
    })
});

// Tipo para resposta do PIX
type RespostaPix = {
  id: string;
  status: string;
  qr_code: string;
  qr_code_base64: string;
  ticket_url: string;
  expiration_date: string;
};

export type ProdutoInfo = {
  nome: string;
  price: number;
  imagemUrl: string;
  sku: string;
  descricao?: string;
};

export type OrderBump = {
  id: string;
  nome: string;
  descricao: string;
  initialPrice: number;
  price: number;
  imagemUrl: string;
  sku: string;
  selecionado?: boolean;
};

// Dados de exemplo (substituir pela API)
const produtoExemplo: ProdutoInfo = {
  nome: 'Missão Literária',
  price: 12.00,
  imagemUrl: '/images/system/logo_transparent.webp',
  sku: 'BOOK-001'
};

const orderBumpsExemplo: OrderBump[] = [
  {
    id: 'ob-1',
    nome: '40 Textos Para Missões Literárias',
    descricao: 'Coletânea de textos narrativos criados especialmente para serem usados com as fichas do Missão Literária',    
    initialPrice: 12.00,
    price: 6.00,
    imagemUrl: '/images/system/logo_transparent.webp',
    sku: 'BOOK-002',
    selecionado: false
  },
  {
    id: 'ob-2',
    nome: '50 Textos Para Missões Literárias',
    descricao: 'Coletânea de textos narrativos criados especialmente para serem usados com as fichas do Missão Literária',    
    initialPrice: 12.00,
    price: 8.00,
    imagemUrl: '/images/system/logo_transparent.webp',
    sku: 'BOOK-004',
    selecionado: false
  }
];

export default function CheckoutPage() {
  // Referências para os campos do formulário
  const nomeRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const telefoneRef = React.useRef<HTMLInputElement>(null);
  
  const [orderBumps, setOrderBumps] = useState(orderBumpsExemplo);
  const [orderBumpsSelecionados, setOrderBumpsSelecionados] = useState<OrderBump[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [errosForm, setErrosForm] = useState<{
    nome?: string;
    email?: string;
    telefone?: string;
  }>({});
  const [dadosCliente, setDadosCliente] = useState({
    nome: '',
    email: '',
    telefone: ''
  });
  
  // Função para validar um campo individual
  const validarCampo = (campo: 'nome' | 'email' | 'telefone') => {
    const validacao = clienteSchema.shape[campo].safeParse(dadosCliente[campo]);
    
    if (!validacao.success) {
      setErrosForm(prev => ({
        ...prev,
        [campo]: validacao.error.errors[0].message
      }));
      return false;
    } else {
      // Limpar erro se o campo estiver válido
      setErrosForm(prev => {
        const novosErros = { ...prev };
        delete novosErros[campo];
        return novosErros;
      });
      return true;
    }
  };
  const [respostaPix, setRespostaPix] = useState<RespostaPix | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Calcula o valor total
  const valorTotal = React.useMemo(() => {
    let total = produtoExemplo.price;
    orderBumpsSelecionados.forEach(bump => {
      total += bump.price;
    });
    return total;
  }, [orderBumpsSelecionados]);

  // Função para formatar o telefone
  const formatarTelefone = (valor: string): string => {
    const apenasNumeros = valor.replace(/\D/g, '');
    if (apenasNumeros.length <= 2) {
      return apenasNumeros;
    }
    if (apenasNumeros.length <= 6) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    }
    if (apenasNumeros.length <= 10) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 6)}-${apenasNumeros.slice(6)}`;
    }
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`;
  };

  // Atualiza os order bumps selecionados quando mudar a seleção
  useEffect(() => {
    const selecionados = orderBumps.filter(bump => bump.selecionado);
    setOrderBumpsSelecionados(selecionados);
  }, [orderBumps]);

  // Toggle order bump seleção
  const handleToggleOrderBump = (id: string) => {
    setOrderBumps(prev =>
      prev.map(bump =>
        bump.id === id ? { ...bump, selecionado: !bump.selecionado } : bump
      )
    );
  };

  // Handler para finalizar pagamento
  const handleFinalizarPagamento = async () => {
    setCarregando(true);
    setErro(null);

    try {
      // Validar todos os campos do cliente
      const nomeValido = validarCampo('nome');
      const emailValido = validarCampo('email');
      const telefoneValido = validarCampo('telefone');
      
      if (!nomeValido || !emailValido || !telefoneValido) {
        // Scroll até o primeiro campo com erro
        if (!nomeValido && nomeRef.current) {
          nomeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          nomeRef.current.focus();
        } else if (!emailValido && emailRef.current) {
          emailRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          emailRef.current.focus();
        } else if (!telefoneValido && telefoneRef.current) {
          telefoneRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          telefoneRef.current.focus();
        }
        
        // Interrompe a execução da função
        return;
      }
      
      // Limpar erros se validação passou
      setErrosForm({});

      // Preparar items para o pedido (produto principal + order bumps)
      const items = [
        {
          id: produtoExemplo.sku,
          title: produtoExemplo.nome,
          unit_price: produtoExemplo.price,
          quantity: 1,
          picture_url: produtoExemplo.imagemUrl
        },
        ...orderBumpsSelecionados.map(bump => ({
          id: bump.sku,
          title: bump.nome,
          unit_price: bump.price,
          quantity: 1,
          picture_url: bump.imagemUrl
        }))
      ];

      // Preparar dados do pedido
      const dadosPedido = {
        items,
        cliente: {
          nome: dadosCliente.nome,
          email: dadosCliente.email,
          telefone: dadosCliente.telefone.replace(/\D/g, '') // Remove caracteres não numéricos
        },
        valorTotal,
        external_reference: `PEDIDO-${Date.now()}`
      };

      // Enviar para a API
      const resposta = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosPedido),
      });

      if (!resposta.ok) {
        throw new Error('Erro ao processar pagamento. Por favor, tente novamente.');
      }

      const dadosResposta = await resposta.json();
      setRespostaPix(dadosResposta);

    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro('Erro ao processar pagamento');
      }
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  // Função para copiar código PIX
  const copiarCodigoPix = () => {
    if (respostaPix?.qr_code) {
      navigator.clipboard.writeText(respostaPix.qr_code);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }
  };

  // Componente para exibir QR Code e informações do PIX
  const PixInfo = () => {
    if (!respostaPix) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 text-center">
        <h2 className="text-xl font-semibold text-[#1D3557] mb-4 border-b pb-2">
          Pagamento PIX
        </h2>
        
        <div className="flex flex-col items-center space-y-4">
          {respostaPix.qr_code_base64 && (
            <div className="p-4 bg-white border rounded-lg">
              <Image 
                src={`data:image/png;base64,${respostaPix.qr_code_base64}`} 
                alt="QR Code PIX" 
                width={192} 
                height={192}
                className="w-48 h-48"
                unoptimized={true}
              />
            </div>
          )}
          
          <div className="w-full">
            <p className="text-sm text-gray-500 mb-2">Copie o código PIX:</p>
            <div className="relative">
              <div className="p-3 bg-gray-100 rounded-lg text-xs font-mono break-all">
                {respostaPix.qr_code}
              </div>
              <button 
                onClick={copiarCodigoPix}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#1D3557] hover:text-[#457B9D]"
                title="Copiar código PIX"
              >
                <FaCopy size={16} />
              </button>
            </div>
            {copiado && (
              <p className="text-green-600 text-xs mt-1">Código copiado!</p>
            )}
          </div>
          
          <p className="text-sm text-gray-700">
            O código PIX expira em{" "}
            {respostaPix.expiration_date 
              ? new Date(respostaPix.expiration_date).toLocaleString('pt-BR')
              : "30 minutos"}
          </p>
          
          {respostaPix.ticket_url && (
            <a 
              href={respostaPix.ticket_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#1D3557] underline hover:text-[#457B9D] text-sm"
            >
              Visualizar ticket completo
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <header className="w-full bg-[#2c4f71] h-[80px] flex items-center justify-center sticky top-0 z-10">
        <Image
          src="/images/system/logo_transparent.webp"
          alt="Logo"
          width={80}
          height={80}
          className="h-auto w-auto max-h-[80px]"
        />
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6 px-4 max-w-[480px]">
        {/* Produto */}
        <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-3 mb-4 border border-gray-100">
          <div className="w-16 h-16 relative flex-shrink-0">
            <Image
              src={produtoExemplo.imagemUrl}
              alt={produtoExemplo.nome}
              fill
              className="object-cover rounded-md"
            />
          </div>
          <div className="flex flex-col justify-center flex-1">
            <span className="text-base font-bold text-gray-900 leading-tight mb-1">{produtoExemplo.nome}</span>
            <span className="text-lg font-bold text-[#1D3557]">R$ {produtoExemplo.price.toFixed(2)}</span>
          </div>
        </div>

        {/* Resultado do PIX (quando disponível) */}
        {respostaPix && <PixInfo />}
        
        {/* Formulário Cliente (esconder quando o PIX foi gerado) */}
        {!respostaPix && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-xl font-semibold text-[#1D3557] mb-4 border-b pb-2">
              Seus Dados
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="nome" className="block text-gray-700 mb-1 font-medium">
                  Nome Completo *
                </label>
                <input
                  ref={nomeRef}
                  type="text"
                  id="nome"
                  value={dadosCliente.nome}
                  onChange={(e) => {
                    setDadosCliente(prev => ({ ...prev, nome: e.target.value }));
                  }}
                  onBlur={() => validarCampo('nome')}
                  className={`w-full p-2 border rounded-lg text-gray-900 ${errosForm.nome ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Seu nome completo"
                />
                {errosForm.nome && (
                  <p className="text-red-500 text-xs mt-1">{errosForm.nome}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-1 font-medium">
                  E-mail *
                </label>
                <input
                  ref={emailRef}
                  type="email"
                  id="email"
                  value={dadosCliente.email}
                  onChange={(e) => {
                    setDadosCliente(prev => ({ ...prev, email: e.target.value }));
                  }}
                  onBlur={() => validarCampo('email')}
                  className={`w-full p-2 border rounded-lg text-gray-900 ${errosForm.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="seu@email.com"
                />
                {errosForm.email && (
                  <p className="text-red-500 text-xs mt-1">{errosForm.email}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="telefone" className="block text-gray-700 mb-1 font-medium">
                  WhatsApp *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaWhatsapp className="text-green-600" />
                  </div>
                  <input
                    ref={telefoneRef}
                    type="tel"
                    id="telefone"
                    value={dadosCliente.telefone}
                    onChange={(e) => {
                      const valorFormatado = formatarTelefone(e.target.value);
                      setDadosCliente(prev => ({ ...prev, telefone: valorFormatado }));
                    }}
                    onBlur={() => validarCampo('telefone')}
                    className={`w-full p-2 pl-10 border rounded-lg text-gray-900 ${errosForm.telefone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="(99) 99999-9999"
                  />
                </div>
                {errosForm.telefone && (
                  <p className="text-red-500 text-xs mt-1">{errosForm.telefone}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Order Bumps (mostrar apenas quando o PIX não foi gerado) */}
        {!respostaPix && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#1D3557] mb-2">
              Aproveite e compre junto:
            </h2>
            <div className="mb-4">
              <div className="space-y-3">
                {orderBumps.map((item) => (
                  <div 
                    key={item.id} 
                    className={`border rounded-lg p-3 transition-all duration-200 ${
                      item.selecionado 
                        ? 'border-green-500 bg-[#F8FCF8]' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="w-[50px] h-[50px] relative flex-shrink-0">
                        <Image
                          src={item.imagemUrl}
                          alt={item.nome}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900">{item.nome}</h4>
                        <p className="text-xs text-gray-600 mb-1">{item.descricao}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <span className="text-xs line-through text-gray-500">
                              R$ {item.initialPrice.toFixed(2)}
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              R$ {item.price.toFixed(2)}
                            </span>
                          </div>
                          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                            -50%
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.selecionado}
                          onChange={() => handleToggleOrderBump(item.id)}
                          className="rounded border-gray-300 text-green-500 focus:ring-green-500"
                        />
                        <span className="text-xs text-gray-600">Adicionar produto</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Detalhes do Pedido */}
        <div className="mb-4">
          <h2 className="text-base font-medium text-gray-900 mb-3">
            Detalhes da compra
          </h2>

          <div className="space-y-3">
            {/* Produto Principal */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{produtoExemplo.nome}</span>
              <span className="font-medium text-gray-900">R$ {produtoExemplo.price.toFixed(2)}</span>
            </div>

            {/* Order Bumps Selecionados */}
            {orderBumpsSelecionados.map((bump) => (
              <div key={bump.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{bump.nome}</span>
                <span className="font-medium text-gray-900">R$ {bump.price.toFixed(2)}</span>
              </div>
            ))}

            {/* Valor Total */}
            <div className="flex justify-between items-center pt-3 border-t text-sm">
              <span className="font-medium text-gray-900">Total</span>
              <span className="font-bold text-gray-900">R$ {valorTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Botão de Finalização */}
        {!respostaPix && (
          <button
            onClick={handleFinalizarPagamento}
            disabled={carregando}
            className="w-full py-3 bg-[#1D3557] text-white rounded-lg font-semibold mt-4 flex items-center justify-center hover:bg-[#457B9D] transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {carregando ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Processando...
              </>
            ) : (
              'Gerar PIX'
            )}
          </button>
        )}
        
        {/* Mensagem de Erro */}
        {erro && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {erro}
          </div>
        )}
      </main>
    </div>
  );
}
