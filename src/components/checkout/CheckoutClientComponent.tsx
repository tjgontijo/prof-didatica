'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaSpinner } from 'react-icons/fa';

import { ProdutoInfo, OrderBump } from './types';

import OrderBumps from '@/components/checkout/OrderBumps';
import FormCustomer, { CustomerFormValues, customerFormSchema } from '@/components/checkout/FormCustomer';
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

  const {
    register,
    handleSubmit,
    trigger,
    formState,
  } = useForm<CustomerFormValues>({
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
      selected: false 
    }));
    setOrderBumpsSelecionados(bumpsInicial);
  }, [orderBumps]);

  // Não precisamos mais recuperar o orderId da sessão

  // Função para lidar com a seleção/deseleção de order bumps
  const handleToggleOrderBump = useCallback((id: string) => {
    setOrderBumpsSelecionados(prev => {
      const updated = prev.map(bump => {
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
      console.log(`Salvando order ID '${id}' no estado...`);
      setOrderId(id);
      console.log(`Order ID '${id}' salvo com sucesso`);
      return true;
    } catch (error) {
      console.error('Erro ao salvar orderId:', error);
      return false;
    }
  }, []);

  // Função para criar um novo pedido
  const createOrder = useCallback(async (data: CustomerFormValues, phoneNormalized: string) => {
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
            quantity: 1
          })),
      };
      
      console.log('Enviando payload para criar pedido:', payload);
      
      // Fazer a chamada API
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        console.error(`Erro HTTP na criação do pedido: ${res.status} ${res.statusText}`);
        throw new Error(`Erro ao criar pedido: ${res.status} ${res.statusText}`);
      }
      
      // Processar a resposta
      const orderData = await res.json();
      console.log('Resposta completa da API:', orderData);
      
      // Verificação detalhada da estrutura da resposta
      if (!orderData) {
        console.error('Resposta da API é nula ou indefinida');
        throw new Error('Resposta inválida da API: sem dados');
      }
      
      if (!orderData.success) {
        console.error('API reportou falha:', orderData);
        throw new Error(`Falha ao criar pedido: ${orderData.message || 'erro desconhecido'}`);
      }
      
      if (!orderData.order) {
        console.error('Objeto order ausente na resposta:', orderData);
        throw new Error('Resposta inválida da API: objeto order ausente');
      }
      
      // Obter e validar o ID
      const newOrderId = orderData.order.id;
      console.log('Order ID extraído com sucesso:', newOrderId);
      
      if (!newOrderId) {
        console.error('ID do pedido é inválido ou inexistente:', orderData.order);
        throw new Error('ID do pedido inválido ou inexistente na resposta');
      }
      
      // Salvar o ID no estado React
      setOrderId(newOrderId); // Atualiza diretamente
      console.log(`OrderId '${newOrderId}' salvo diretamente no estado`);
      
      return newOrderId;
    } catch (error) {
      console.error('Erro detalhado na criação do pedido:', error);
      throw error; // Re-lança para tratamento no nível superior
    } finally {
      setIsCreatingOrder(false);
    }
  }, [checkoutId, orderBumpsSelecionados, product.id, setOrderId]);

  // Função para atualizar um pedido existente
  const updateOrder = useCallback(async (orderId: string, data: CustomerFormValues, phoneNormalized: string) => {
    console.log('Atualizando pedido existente:', orderId);
    
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
    console.log('Order ID existente confirmado na sessão:', orderId);
    
    return orderId;
  }, [saveOrderId]);

  const handleSaveCustomerDataAndProceed: SubmitHandler<CustomerFormValues> = useCallback(async (
    data,
  ) => {
    console.log('Iniciando handleSaveCustomerDataAndProceed com dados:', data);
    console.log('Estado atual do orderId:', orderId);
    
    setDadosCliente(data);
    const phoneNormalized = cleanPhone(data.phone);

    try {
      let currentOrderId = orderId;
      
      if (!currentOrderId) {
        console.log('Criando novo pedido...');
        try {
          currentOrderId = await createOrder(data, phoneNormalized);
          console.log('Pedido criado com sucesso, ID:', currentOrderId);
          // Garante que o ID está no estado antes de prosseguir
          setOrderId(currentOrderId);
        } catch (createError) {
          console.error('Erro específico ao criar pedido:', createError);
          throw createError; // Re-lança para ser capturado pelo catch externo
        }
      } else {
        console.log('Atualizando pedido existente, ID:', currentOrderId);
        await updateOrder(currentOrderId, data, phoneNormalized);
        console.log('Pedido atualizado com sucesso');
      }
      
      // Pequeno timeout para garantir que o estado foi atualizado
      setTimeout(() => {
        console.log('Navegando para etapa de pagamento com orderId:', currentOrderId);
        setCurrentStep('payment');
        console.log('Etapa alterada para payment');
      }, 100);
    } catch (error) {
      console.error('Erro ao salvar dados do cliente:', error);
      setErro(error instanceof Error ? error.message : 'Erro ao processar seus dados. Por favor, tente novamente.');
    }
  }, [orderId, createOrder, updateOrder, setOrderId]);

  // Lista de order bumps selecionados usando useMemo para evitar recálculos desnecessários
  const selectedOrderBumps = useMemo(() => {
    return orderBumpsSelecionados.filter((bump) => bump.selected);
  }, [orderBumpsSelecionados]);

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
            produto={product}
          />
          <div className="border-b"></div>
          {currentStep === 'personal-info' && (
            <form onSubmit={handleSubmit(handleSaveCustomerDataAndProceed)}>
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
              {/* Order Bumps */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3">Aproveite e Compre Junto</h3>
                <OrderBumps
                  orderBumps={orderBumpsSelecionados}
                  onToggleOrderBump={handleToggleOrderBump}
                />
              </div>
              <div className="border-b"></div>
              {/* Detalhes do Pedido */}
              <OrderDetails
                produto={product}
                orderBumpsSelecionados={selectedOrderBumps}
              />

              {/* Botão de Finalização */}
              <button
                className="w-full h-12 bg-[#00A859] text-white font-bold rounded-[6px] flex items-center justify-center"
                onClick={async () => {
                  setCarregando(true);
                  setErro(null);

                  try {
                    // Obter o orderId atual do estado
                    const currentOrderId = orderId;
                    
                    if (!currentOrderId) {
                      console.error('Order ID não encontrado no estado');
                      setErro('ID do pedido não encontrado. Por favor, preencha seus dados novamente.');
                      return;
                    }
                    
                    console.log('Usando Order ID para gerar PIX:', currentOrderId);
                    
                    const items = [
                      {
                        id: product.id,
                        nome: product.name,
                        quantidade: 1,
                        preco: product.price,
                      },
                      ...orderBumpsSelecionados
                        .filter(bump => bump.selected)
                        .map((bump) => ({
                          id: bump.id,
                          nome: bump.name,
                          quantidade: 1,
                          preco: bump.specialPrice, // Usando specialPrice em vez de price
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
                    
                    console.log('Enviando dados para gerar PIX:', {
                      ...dadosPedido,
                      items: dadosPedido.items.length + ' itens',
                      orderId: currentOrderId // Verificando se o orderId está sendo enviado
                    });

                    const resposta = await fetch('/api/payment/pix', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(dadosPedido),
                    });

                    if (!resposta.ok) {
                      console.error('Erro na resposta da API de PIX:', resposta.status, resposta.statusText);
                      throw new Error(`Erro ao processar pagamento: ${resposta.status} ${resposta.statusText}`);
                    }

                    const dadosResposta = await resposta.json();
                    console.log('Resposta da API de PIX:', dadosResposta);
                    
                    // A API retorna paymentId, não id
                    if (!dadosResposta.paymentId) {
                      console.error('ID do pagamento não encontrado na resposta:', dadosResposta);
                      throw new Error('ID do pagamento não encontrado na resposta');
                    }
                    
                    console.log('Redirecionando para página de pagamento:', `/payment/${dadosResposta.paymentId}`);
                    router.push(`/payment/${dadosResposta.paymentId}`);
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
                }}
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
