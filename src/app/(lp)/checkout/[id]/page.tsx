import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCheckoutData, type CheckoutData } from '../components/getCheckoutData';
import CheckoutClientComponent from '../components/CheckoutClientComponent';

// Interface para o produto do order bump
interface BumpProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Interface para o order bump
interface OrderBumpWithProduct {
  id: string;
  title: string | null;
  description: string;
  specialPrice: number;
  displayOrder: number | null;
  callToAction: string | null;
  bumpProduct: BumpProduct;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  mainProductId: string;
  bumpProductId: string;
  showProductImage: boolean;
}

// Definindo o tipo para os parâmetros conforme Next.js 15
export type paramsType = Promise<{ id: string }>;

// Função para gerar metadados dinâmicos
export async function generateMetadata(props: { params: paramsType }): Promise<Metadata> {
  try {
    const { id } = await props.params;
    const checkoutData = (await getCheckoutData(id)) as CheckoutData | null;
    
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
  const checkoutData = (await getCheckoutData(id)) as CheckoutData | null;
  
  // Se o checkout não existir, retornar not found
  if (!checkoutData) {
    notFound();
  }
  
  // Extrair campos obrigatórios definidos no Checkout
  const rawRequiredFields = checkoutData.requiredFields ?? [];
  const mapToClientField: Record<string, 'nome' | 'email' | 'telefone'> = {
    customerName: 'nome',
    customerEmail: 'email',
    customerPhone: 'telefone',
  };
  const requiredFields = rawRequiredFields
    .map((f) => mapToClientField[f])
    .filter(Boolean) as Array<'nome' | 'email' | 'telefone'>;

  // Preparar dados para o componente client-side
  const produto = {
    nome: checkoutData.product.name,
    price: checkoutData.product.price / 100, // Convertendo de centavos para reais
    imagemUrl: checkoutData.product.imageUrl ?? '/images/system/logo_transparent.webp',
    sku: checkoutData.product.id,
    descricao: checkoutData.product.description ?? ''
  };
  
  // Preparar order bumps
  const orderBumps = checkoutData.product.mainProductBumps
    .filter((bump: OrderBumpWithProduct) => bump.isActive && !bump.deletedAt)
    .sort((a: OrderBumpWithProduct, b: OrderBumpWithProduct) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((bump: OrderBumpWithProduct) => {
      const initialPrice = bump.bumpProduct.price / 100;
      const specialPrice = bump.specialPrice / 100;
      const desconto = Math.round(((initialPrice - specialPrice) / initialPrice) * 100);
      
      return {
        id: bump.id,
        nome: bump.title ?? bump.bumpProduct.name,
        descricao: bump.description ?? '',
        initialPrice,
        specialPrice,
        imagemUrl: bump.bumpProduct.imageUrl ?? '/images/system/logo_transparent.webp',
        sku: bump.bumpProduct.id,
        selecionado: false,
        callToAction: bump.callToAction ?? 'Adicionar ao pedido',
        percentDesconto: desconto,
        displayOrder: bump.displayOrder ?? 0
      };
    });
  
  // Renderizar o componente client-side com os dados
  return (
    <CheckoutClientComponent
      produto={produto}
      orderBumps={orderBumps}
      checkoutId={checkoutData.id}
      requiredFields={requiredFields}
    />
  );
}