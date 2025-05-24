'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { initMercadoPago } from '@mercadopago/sdk-react';
import { FaSpinner } from 'react-icons/fa';
import PaymentQrCode from '@/components/checkout/PaymentQrCode';
import FormCustomer from '@/components/checkout/FormCustomer';
import ProductHeader from '@/components/checkout/ProductHeader';
import OrderDetails from '@/components/checkout/OrderDetails';
import OrderBumps from '@/components/checkout/OrderBumps';
import { FormPix } from '@/components/checkout';
import { PaymentSelector } from '@/components/checkout';

initMercadoPago(
  process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || 'TEST-95f388d1-4d79-411f-8f5e-80cf69cb96c4',
);



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
  initialPrice: number; // Preço original do produto (vem do bumpProduct.price)
  specialPrice: number; // Preço especial do order bump (vem do orderBump.specialPrice)
  imagemUrl: string;
  sku: string;
  selecionado?: boolean;
  percentDesconto?: number; // Percentual de desconto calculado
};

// Não precisamos mais dos dados de exemplo, pois agora recebemos via props

interface CheckoutClientComponentProps {
  produto: ProdutoInfo;
  orderBumps: OrderBump[];
  checkoutId: string;
  requiredFields: Array<'nome' | 'email' | 'telefone'>;
}

// --- Tipo para payload de criação de Order em draft ---
type OrderDraftPayload = {
  productId: string;
  checkoutId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
};

// --- Tipo para payload de atualização de Order ---
type OrderUpdatePayload = {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
};

export default function CheckoutClientComponent({
  produto,
  orderBumps: initialOrderBumps,
  checkoutId,
  requiredFields,
}: CheckoutClientComponentProps) {
  const router = useRouter();
  const [orderBumps, setOrderBumps] = useState(initialOrderBumps);
  const [orderBumpsSelecionados, setOrderBumpsSelecionados] = useState<OrderBump[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [dadosCliente, setDadosCliente] = useState({
    nome: '',
    email: '',
    telefone: '',
    telefoneNormalizado: '',
  });
  
  const [formValido, setFormValido] = useState(false);
  const [orderId, setOrderId] = useState<string>();

  // Handler para salvar dados do cliente vindos do FormCustomer
  const handleSaveCustomerData = async (data: {
    nome: string;
    email: string;
    telefone: string;
    telefoneNormalizado: string;
  }) => {
    setDadosCliente(data);
    
    try {
      if (!orderId) {
        const payload: OrderDraftPayload = { productId: produto.sku, checkoutId };
        if (requiredFields.includes('nome')) payload.customerName = data.nome;
        if (requiredFields.includes('email')) payload.customerEmail = data.email;
        if (requiredFields.includes('telefone')) payload.customerPhone = data.telefoneNormalizado;
        const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data2 = await res.json();
        if (data2.success) setOrderId(data2.orderId);
      } else {
        const payload: OrderUpdatePayload = {};
        if (requiredFields.includes('nome')) payload.customerName = data.nome;
        if (requiredFields.includes('email')) payload.customerEmail = data.email;
        if (requiredFields.includes('telefone')) payload.customerPhone = data.telefoneNormalizado;
        await fetch(`/api/orders?id=${orderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }
    } catch (error) {
      console.error('Erro ao salvar dados do cliente:', error);
    }
  };
  
  // Handler para atualizar o estado de validação do formulário
  const handleFormValidationChange = (isValid: boolean) => {
    setFormValido(isValid);
  };
  const [respostaPix, setRespostaPix] = useState<RespostaPix | null>(null);

  // Calcula o valor total
  const valorTotal = React.useMemo(() => {
    let total = produto.price;
    orderBumpsSelecionados.forEach((bump: OrderBump) => {
      total += bump.specialPrice;
    });
    return total;
  }, [orderBumpsSelecionados, produto.price]);

  // Usamos formatBrazilianPhone importado de @/lib/phone

  // Atualiza os order bumps selecionados quando mudar a seleção
  useEffect(() => {
    const selecionados = orderBumps.filter((bump) => bump.selecionado);
    setOrderBumpsSelecionados(selecionados);
  }, [orderBumps]);

  // Toggle order bump seleção
  const handleToggleOrderBump = (id: string) => {
    setOrderBumps((prev) =>
      prev.map((bump) => (bump.id === id ? { ...bump, selecionado: !bump.selecionado } : bump)),
    );
  };

  // Handler para finalizar pagamento
  const handleFinalizarPagamento = async () => {
    setCarregando(true);
    setErro(null);

    try {
      // Verificar se o formulário está válido
      if (!formValido) {
        setErro('Por favor, preencha todos os campos corretamente');
        setCarregando(false);
        return;
      }

      // Preparar items para o pedido (produto principal + order bumps)
      const items = [
        {
          id: produto.sku,
          title: produto.nome,
          description: produto.descricao || produto.nome,
          quantity: 1,
          unit_price: produto.price * 100, // Converter para centavos
          category_id: 'digital_goods',
        },
        ...orderBumpsSelecionados.map((bump) => ({
          id: bump.sku,
          title: bump.nome,
          unit_price: bump.specialPrice,
          quantity: 1,
          picture_url: bump.imagemUrl,
        })),
      ];

      // Verificar se temos um orderId válido
      if (!orderId) {
        throw new Error('ID do pedido não encontrado. Por favor, preencha seus dados novamente.');
      }

      // Preparar dados do pedido
      const dadosPedido = {
        items,
        cliente: {
          nome: dadosCliente.nome,
          email: dadosCliente.email,
          telefone: dadosCliente.telefoneNormalizado,
        },
        valorTotal,
        checkoutId, // Usar o ID do checkout recebido via props
        orderId, // Usar o ID do pedido que já foi criado
      };

      // Enviar para a API
      const resposta = await fetch('/api/payment/pix', {
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
      
      // Redirecionar para a página de agradecimento usando o ID do Payment
      router.push(`/thanks/${dadosResposta.id}`);
      
      // Manter o estado atual para compatibilidade com código existente
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



  return (
    <div className="min-h-screen bg-[#FFF9F5] font-sans text-[#333] ">
      {/* Header */}
      <header className="w-full bg-[#2c4f71] h-[80px] flex items-center justify-center top-0">
        <Image
          src="/images/system/logo_transparent.webp"
          alt="Logo"
          width={80}
          height={80}
          className="h-auto w-auto max-h-[80px]"
        />
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6 px-4 max-w-[480px] ">
        {/* Container Principal */}
        <div className="bg-white rounded-[8px] p-5 my-[16px] md:my-[24px] w-full flex flex-col gap-6 shadow-xl border border-gray-200">
          {/* Produto */}
          <ProductHeader produto={produto} />
          <div className="border border-b-0"></div>

          {/* Resultado do PIX (quando disponível) */}
          {respostaPix && <PaymentQrCode respostaPix={respostaPix} />}

          {/* Formulário Cliente (esconder quando o PIX foi gerado) */}
          {!respostaPix && (
            <FormCustomer
              initialData={{
                nome: dadosCliente.nome,
                email: dadosCliente.email,
                telefone: dadosCliente.telefone
              }}
              onSave={handleSaveCustomerData}
              onValidationChange={handleFormValidationChange}
              requiredFields={requiredFields}
            />
          )}
          <PaymentSelector />
          <FormPix />
          {/* Order Bumps (mostrar apenas quando o PIX não foi gerado) */}
          {!respostaPix && (
            <OrderBumps 
              orderBumps={orderBumps} 
              onToggleOrderBump={handleToggleOrderBump} 
            />
          )}
          <div className="border border-b-0"></div>
          {/* Detalhes do Pedido */}
          <OrderDetails 
            produto={produto} 
            orderBumpsSelecionados={orderBumpsSelecionados} 
          />

          {/* Botão de Finalização */}
          {!respostaPix && (
            <button className="w-full h-12 bg-[#00A859] text-white font-bold rounded-[6px] flex items-center justify-center" 
              onClick={handleFinalizarPagamento}
              disabled={carregando}
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
        </div>
      </main>
    </div>
  );
}
