'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaSpinner } from 'react-icons/fa';

import { ProdutoInfo, OrderBump } from './types';

import OrderBumps from '@/components/checkout/OrderBumps';
import FormCustomer, {
  CustomerFormValues,
  customerFormSchema,
} from '@/components/checkout/FormCustomer';
import OrderDetails from '@/components/checkout/OrderDetails';
import PaymentSelector from '@/components/checkout/PaymentSelector';
import FormPix from '@/components/checkout/FormPix';
import ProductHeader from '@/components/checkout/ProductHeader';
import { cleanPhone } from '@/lib/phone';

import Image from 'next/image';

type OrderDraftPayload = {
  productId: string;
  checkoutId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  orderBumps?: Array<{
    productId: string;
    quantity: number;
  }>;
};

type OrderUpdatePayload = {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
};

interface CheckoutClientComponentProps {
  product: ProdutoInfo;
  orderBumps: OrderBump[];
  checkoutId: string;
}

export default function CheckoutClientComponent({
  product,
  orderBumps,
  checkoutId,
}: CheckoutClientComponentProps) {
  const router = useRouter();
  // Estado para armazenar o ID do pedido
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderBumpsSelecionados, setOrderBumpsSelecionados] = useState<OrderBump[]>([]);
  const [valorTotal, setValorTotal] = useState(product.price);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [dadosCliente, setDadosCliente] = useState<CustomerFormValues | null>(null);
  // Estado para controlar a criação de pedido
  const [, setIsCreatingOrder] = useState(false);
  const [currentStep, setCurrentStep] = useState<'personal-info' | 'payment'>('personal-info');

  const { register, handleSubmit, trigger, formState } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    mode: 'onBlur', // Usando onBlur para validar apenas quando o campo perde o foco
    reValidateMode: 'onBlur', // Revalidar apenas no evento onBlur, não durante a digitação
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  useEffect(() => {
    // Garante que todos os order bumps tenham a propriedade selected definida como false inicialmente
    const bumpsInicial = orderBumps.map((bump) => ({
      ...bump,
      selected: false,
    }));
    setOrderBumpsSelecionados(bumpsInicial);
  }, [orderBumps]);

  // Não precisamos mais recuperar o orderId da sessão

  // Função para lidar com a seleção/deseleção de order bumps
  const handleToggleOrderBump = useCallback((id: string) => {
    setOrderBumpsSelecionados((prev) => {
      const updated = prev.map((bump) => {
        if (bump.id === id) {
          return { ...bump, selected: !bump.selected };
        }
        return bump;
      });

      return updated;
    });
  }, []);

  // Calcula o valor total (produto principal + order bumps selecionados) usando useMemo
  const calculatedTotal = useMemo(() => {
    // Valor do produto principal
    let total = product.price;

    // Adiciona o valor dos order bumps selecionados
    orderBumpsSelecionados.forEach((bump) => {
      if (bump.selected) {
        total += bump.specialPrice;
      }
    });

    return total;
  }, [product.price, orderBumpsSelecionados]);

  // Atualiza o estado do valorTotal quando o calculatedTotal mudar
  useEffect(() => {
    setValorTotal(calculatedTotal);
  }, [calculatedTotal]);

  // Função para salvar o ID do pedido no estado e na sessão
  const saveOrderId = useCallback((id: string) => {
    try {
      setOrderId(id);

      return true;
    } catch {
      return false;
    }
  }, []);

  // Função para criar um novo pedido
  const createOrder = useCallback(
    async (data: CustomerFormValues, phoneNormalized: string) => {
      setIsCreatingOrder(true);
      try {
        // Preparar o payload
        const payload: OrderDraftPayload = {
          productId: product.id,
          checkoutId,
          customerName: data.name,
          customerEmail: data.email,
          customerPhone: phoneNormalized,
          orderBumps: orderBumpsSelecionados
            .filter((bump) => bump.selected)
            .map((bump) => ({
              productId: bump.id,
              quantity: 1,
            })),
        };

        // Fazer a chamada API
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Erro ao criar pedido: ${response.status} ${response.statusText}`);
        }

        // Processar a resposta
        const orderData = await response.json();

        // Verificação detalhada da estrutura da resposta
        if (!orderData) {
          throw new Error('Resposta inválida da API: sem dados');
        }

        if (!orderData.success) {
          throw new Error(`Falha ao criar pedido: ${orderData.message || 'erro desconhecido'}`);
        }

        if (!orderData.order) {
          throw new Error('Resposta inválida da API: objeto order ausente');
        }

        // Obter e validar o ID
        const newOrderId = orderData.order.id;

        if (!newOrderId) {
          throw new Error('ID do pedido inválido ou inexistente na resposta');
        }

        // Salvar o ID no estado React
        setOrderId(newOrderId); // Atualiza diretamente

        return newOrderId;
      } catch (error) {
        throw error; // Re-lança para tratamento no nível superior
      } finally {
        setIsCreatingOrder(false);
      }
    },
    [checkoutId, orderBumpsSelecionados, product.id, setOrderId],
  );

  // Função para atualizar um pedido existente
  const updateOrder = useCallback(
    async (orderId: string, data: CustomerFormValues, phoneNormalized: string) => {
      const payload: OrderUpdatePayload = {
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: phoneNormalized,
      };

      const res = await fetch(`/api/orders?id=${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Erro ao atualizar pedido: ${res.status} ${res.statusText}`);
      }

      // Garante que o ID do pedido está armazenado na sessão
      saveOrderId(orderId);

      return orderId;
    },
    [saveOrderId],
  );

  const handleSaveCustomerDataAndProceed: SubmitHandler<CustomerFormValues> = useCallback(
    async (data) => {
      setDadosCliente(data);
      const phoneNormalized = cleanPhone(data.phone);

      try {
        let currentOrderId = orderId;

        if (!currentOrderId) {
          try {
            currentOrderId = await createOrder(data, phoneNormalized);

            // Garante que o ID está no estado antes de prosseguir
            setOrderId(currentOrderId);
          } catch (createError) {
            throw createError; // Re-lança para ser capturado pelo catch externo
          }
        } else {
          await updateOrder(currentOrderId, data, phoneNormalized);
        }

        // Pequeno timeout para garantir que o estado foi atualizado
        setTimeout(() => {
          setCurrentStep('payment');
        }, 100);
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : 'Erro ao processar seus dados. Por favor, tente novamente.',
        );
      }
    },
    [orderId, createOrder, updateOrder, setOrderId],
  );

  // Lista de order bumps selecionados usando useMemo para evitar recálculos desnecessários
  const selectedOrderBumps = useMemo(() => {
    return orderBumpsSelecionados.filter((bump) => bump.selected);
  }, [orderBumpsSelecionados]);

  const handlePixPayment = async () => {
    setCarregando(true);
    setErro(null);

    try {
      const currentOrderId = orderId;

      if (!currentOrderId) {
        setErro('ID do pedido não encontrado. Por favor, preencha seus dados novamente.');
        return;
      }

      const items = [
        {
          id: product.id,
          nome: product.name,
          quantidade: 1,
          preco: product.price,
        },
        ...orderBumpsSelecionados
          .filter((bump) => bump.selected)
          .map((bump) => ({
            id: bump.id,
            nome: bump.name,
            quantidade: 1,
            preco: bump.specialPrice,
          })),
      ];

      const dadosPedido = {
        items,
        cliente: {
          nome: dadosCliente?.name,
          email: dadosCliente?.email,
          telefone: dadosCliente?.phone,
        },
        valorTotal,
        checkoutId,
        orderId: currentOrderId,
      };

      const resposta = await fetch('/api/payment/pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosPedido),
      });

      if (!resposta.ok) {
        throw new Error(`Erro ao processar pagamento: ${resposta.status} ${resposta.statusText}`);
      }

      const dadosResposta = await resposta.json();

      if (!dadosResposta.paymentId) {
        throw new Error('ID do pagamento não encontrado na resposta');
      }

      router.push(`/payment/${dadosResposta.paymentId}`);
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro('Erro ao processar pagamento');
      }
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
          <ProductHeader produto={product} />
          <div className="border-b"></div>
          {currentStep === 'personal-info' && (
            <form 
              onSubmit={handleSubmit(handleSaveCustomerDataAndProceed)}   
              className="no-utmify"
              data-utmify-ignore-classes="no-utmify"
            >
              <FormCustomer
                register={register}
                errors={formState.errors}
                isSubmitting={formState.isSubmitting}
                trigger={trigger}
                formState={formState}
                onProceedToPayment={handleSubmit(handleSaveCustomerDataAndProceed)}
              />
            </form>
          )}
          {currentStep === 'payment' && (
            <>
              <PaymentSelector />
              <FormPix />
              <div className="border-b"></div>
              <OrderBumps
                orderBumps={orderBumpsSelecionados}
                onToggleOrderBump={handleToggleOrderBump}
              />
              <div className="border-b"></div>
              <OrderDetails 
                produto={product} 
                orderBumpsSelecionados={selectedOrderBumps} 
              />
              <div className="border-b"></div>
              <button
                className="w-full h-12 bg-[#00A859] text-white font-bold rounded-[6px] flex items-center justify-center"
                onClick={handlePixPayment}
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}
