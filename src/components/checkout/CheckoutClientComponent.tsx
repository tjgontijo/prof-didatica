'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { initMercadoPago } from '@mercadopago/sdk-react';
import { FaSpinner } from 'react-icons/fa';
// Removemos a importação do PaymentQrCode pois não exibimos mais o QR code diretamente
import FormCustomer from '@/components/checkout/FormCustomer';
import ProductHeader from '@/components/checkout/ProductHeader';
import OrderDetails from '@/components/checkout/OrderDetails';
import OrderBumps from '@/components/checkout/OrderBumps';
import { FormPix } from '@/components/checkout';
import { PaymentSelector } from '@/components/checkout';

// Tipo local para compatibilidade com o ProductHeader
type LocalProdutoInfo = {
  nome: string;
  price: number;
  imagemUrl: string;
  sku: string;
  descricao?: string;
  id?: string;
};

initMercadoPago(
  process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || 'APP_USR-4bc818f1-b6bb-4af8-94e8-4307c34853a8',
);

// Removemos a definição de tipo não utilizada

export type ProdutoInfo = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  sku: string;
  isActive: boolean;
};

export type OrderBump = {
  id: string;
  title: string;
  description: string | null;
  specialPrice: number;
  callToAction: string | null;
  showProductImage: boolean;
  displayOrder: number | null;
  isActive: boolean;
  bumpProduct: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    isActive: boolean;
    sku: string;
  };
  selecionado?: boolean;
  percentDesconto?: number;
};

interface CheckoutClientComponentProps {
  product: ProdutoInfo;
  orderBumps: OrderBump[];
  checkoutId: string;
  requiredFields: Array<'customerName' | 'customerEmail' | 'customerPhone'>;
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

// Função para calcular o percentual de desconto
const calcularDesconto = (precoOriginal: number, precoComDesconto: number) => {
  return Math.round(((precoOriginal - precoComDesconto) / precoOriginal) * 100);
};

export default function CheckoutClientComponent({
  product,
  orderBumps: initialOrderBumps,
  checkoutId,
  requiredFields,
}: CheckoutClientComponentProps) {
  const router = useRouter();
  // Mapear os orderBumps iniciais para adicionar campos calculados
  const [orderBumps, setOrderBumps] = useState(() =>
    initialOrderBumps.map((bump) => ({
      ...bump,
      selecionado: false,
      percentDesconto: calcularDesconto(bump.bumpProduct.price, bump.specialPrice),
    })),
  );

  const [orderBumpsSelecionados, setOrderBumpsSelecionados] = useState<OrderBump[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [dadosCliente, setDadosCliente] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    phoneNormalized: '',
  });

  const [formValido, setFormValido] = useState(false);
  const [orderId, setOrderId] = useState<string>();

  // Handler para salvar dados do cliente vindos do FormCustomer
  const handleSaveCustomerData = async (data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    phoneNormalized: string;
  }) => {
    setDadosCliente(data);

    try {
      if (!orderId) {
        const payload: OrderDraftPayload = { productId: product.id, checkoutId };
        if (requiredFields.includes('customerName')) payload.customerName = data.customerName;
        if (requiredFields.includes('customerEmail')) payload.customerEmail = data.customerEmail;
        if (requiredFields.includes('customerPhone')) payload.customerPhone = data.phoneNormalized;
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data2 = await res.json();
        if (data2.success) setOrderId(data2.orderId);
      } else {
        const payload: OrderUpdatePayload = {};
        if (requiredFields.includes('customerName')) payload.customerName = data.customerName;
        if (requiredFields.includes('customerEmail')) payload.customerEmail = data.customerEmail;
        if (requiredFields.includes('customerPhone')) payload.customerPhone = data.phoneNormalized;
        await fetch(`/api/orders?id=${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
    } catch (error) {
      console.error('Erro ao salvar dados do cliente:', error);
    }
  };

  // Handler para atualizar o estado de validação do formulário
  const handleFormValidationChange = (isValid: boolean) => {
    setFormValido(isValid);
  };
  // Não precisamos mais do estado respostaPix, pois redirecionamos o usuário

  // Calcula o valor total
  const valorTotal = React.useMemo(() => {
    // Calcular totais
    const totalOrderBumps = orderBumpsSelecionados.reduce(
      (total, bump) => total + bump.specialPrice,
      0,
    );
    const totalGeral = product.price + totalOrderBumps;
    return totalGeral;
  }, [orderBumpsSelecionados, product.price]);

  // Usamos formatBrazilianPhone importado de @/lib/phone

  // Atualiza os order bumps selecionados quando mudar a seleção
  useEffect(() => {
    const selecionados = orderBumps.filter((bump) => bump.selecionado);
    setOrderBumpsSelecionados(selecionados);
  }, [orderBumps]);

  // Toggle order bump seleção
  const handleToggleOrderBump = (id: string) => {
    setOrderBumps((prevBumps) => {
      const updatedBumps = prevBumps.map((bump) =>
        bump.id === id ? { ...bump, selecionado: !bump.selecionado } : bump,
      );

      // Atualiza a lista de order bumps selecionados
      setOrderBumpsSelecionados(updatedBumps.filter((bump) => bump.selecionado));

      return updatedBumps;
    });
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
          id: product.sku,
          title: product.name,
          description: product.description || product.name,
          quantity: 1,
          unit_price: Math.round(product.price * 100), // Converter para centavos e arredondar
          category_id: 'digital_goods',
        },
        ...orderBumpsSelecionados.map((bump) => ({
          id: bump.bumpProduct.sku,
          title: bump.title,
          description: bump.description || bump.bumpProduct.description || '',
          unit_price: Math.round(bump.specialPrice * 100), // Já está em reais, converter para centavos
          quantity: 1,
          picture_url: bump.bumpProduct.imageUrl || '',
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
          nome: dadosCliente.customerName,
          email: dadosCliente.customerEmail,
          telefone: dadosCliente.phoneNormalized,
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

      // Não precisamos mais salvar o estado, pois o usuário será redirecionado
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
          <ProductHeader
            produto={
              {
                nome: product.name,
                price: product.price,
                imagemUrl: product.imageUrl || '/images/placeholder-product.png',
                sku: product.sku,
                descricao: product.description || '',
              } as LocalProdutoInfo
            }
          />
          <div className="border border-b-0"></div>

          {/* Formulário Cliente */}
          <FormCustomer
            initialData={{
              customerName: dadosCliente.customerName,
              customerEmail: dadosCliente.customerEmail,
              customerPhone: dadosCliente.customerPhone,
            }}
            onSave={handleSaveCustomerData}
            onValidationChange={handleFormValidationChange}
            requiredFields={requiredFields}
          />
          <PaymentSelector />
          <FormPix />
          {/* Order Bumps */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">Aproveite e Compre Junto</h3>
            <OrderBumps
              orderBumps={orderBumps.map((bump) => ({
                id: bump.id,
                nome: bump.title,
                descricao: bump.description || '',
                initialPrice: bump.bumpProduct.price,
                specialPrice: bump.specialPrice,
                imagemUrl: bump.bumpProduct.imageUrl || '/images/placeholder-product.png',
                sku: bump.bumpProduct.sku,
                selecionado: bump.selecionado,
                percentDesconto: bump.percentDesconto,
                displayOrder: bump.displayOrder,
                callToAction: bump.callToAction || 'Adicionar',
              }))}
              onToggleOrderBump={handleToggleOrderBump}
            />
          </div>
          <div className="border border-b-0"></div>
          {/* Detalhes do Pedido */}
          <OrderDetails
            produto={{
              nome: product.name,
              price: product.price,
              imagemUrl: product.imageUrl || '/images/placeholder-product.png',
              sku: product.sku,
              descricao: product.description || '',
            }}
            orderBumpsSelecionados={orderBumpsSelecionados.map((bump) => ({
              id: bump.id,
              nome: bump.title,
              descricao: bump.description || '',
              initialPrice: bump.bumpProduct.price,
              specialPrice: bump.specialPrice,
              imagemUrl: bump.bumpProduct.imageUrl || '/images/placeholder-product.png',
              sku: bump.bumpProduct.sku,
              selecionado: true,
              percentDesconto: bump.percentDesconto,
            }))}
          />

          {/* Botão de Finalização */}
          <button
            className="w-full h-12 bg-[#00A859] text-white font-bold rounded-[6px] flex items-center justify-center"
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
