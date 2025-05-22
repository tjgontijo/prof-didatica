import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCheckoutData } from '../components/getCheckoutData';
import CheckoutClientComponent from '../components/CheckoutClientComponent';

// Definindo o tipo para os parâmetros conforme Next.js 15
export type paramsType = Promise<{ id: string }>;

// Função para gerar metadados dinâmicos
export async function generateMetadata(props: { params: paramsType }): Promise<Metadata> {
  try {
    const { id } = await props.params;
    const checkoutData = await getCheckoutData(id);
    
    if (!checkoutData) {
      return {
        title: 'Checkout não encontrado',
      };
    }
    
    return {
      title: `Checkout - ${checkoutData.product.name}`,
      description: checkoutData.product.description,
    };
  } catch {
    return {
      title: 'Checkout',
    };
  }
}

// Componente server-side
export default async function CheckoutPage(props: { params: paramsType }) {
  // Obter o ID do checkout da URL de forma assíncrona
  const { id } = await props.params;
  
  // Buscar dados do checkout
  const checkoutData = await getCheckoutData(id);
  
  // Se o checkout não existir, retornar not found
  if (!checkoutData) {
    notFound();
  }
  
  // Preparar dados para o componente client-side
  const produto = {
    nome: checkoutData.product.name,
    price: checkoutData.product.price / 100, // Convertendo de centavos para reais
    imagemUrl: '/images/system/logo_transparent.webp', // Ajustar conforme necessário
    sku: checkoutData.product.id,
    descricao: checkoutData.product.description
  };
  
  // Preparar order bumps
  const orderBumps = checkoutData.product.mainProductBumps.map(bump => ({
    id: bump.id,
    nome: bump.bumpProduct.name,
    descricao: bump.description,
    initialPrice: bump.bumpProduct.price / 100, // Convertendo de centavos para reais
    price: bump.bumpProduct.price / 100, // Pode aplicar desconto se necessário
    imagemUrl: '/images/system/logo_transparent.webp', // Ajustar conforme necessário
    sku: bump.bumpProduct.id,
    selecionado: false,
    callToAction: bump.callToAction
  }));
  
  // Renderizar o componente client-side com os dados
  return (
    <CheckoutClientComponent 
      produto={produto}
      orderBumps={orderBumps}
      checkoutId={checkoutData.id}
    />
  );
}