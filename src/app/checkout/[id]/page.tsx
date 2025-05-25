import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCheckoutData, type CheckoutData } from '@/components/checkout/getCheckoutData';
import CheckoutClientComponent from '@/components/checkout/CheckoutClientComponent';

// Interface para o produto
interface Product {
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
interface OrderBump {
  id: string;
  title: string | null;
  description: string;
  specialPrice: number;
  displayOrder: number | null;
  callToAction: string | null;
  bumpProduct: Product;
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
      notFound();
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
  const mapToClientField: Record<string, 'customerName' | 'customerEmail' | 'customerPhone'> = {
    customerName: 'customerName',
    customerEmail: 'customerEmail',
    customerPhone: 'customerPhone',
  };
  const requiredFields = rawRequiredFields.map((f) => mapToClientField[f]).filter(Boolean) as Array<
    'customerName' | 'customerEmail' | 'customerPhone'
  >;

  // Mapear os dados para o formato esperado pelo componente
  const product = {
    id: checkoutData.product.id,
    name: checkoutData.product.name,
    price: checkoutData.product.price / 100, // Convertendo para reais
    description: checkoutData.product.description,
    imageUrl: checkoutData.product.imageUrl,
    sku: checkoutData.product.id,
    isActive: checkoutData.product.isActive,
  };

  // Mapear os orderBumps para o formato esperado
  const orderBumps = checkoutData.product.mainProductBumps
    .filter((bump: OrderBump) => bump.isActive && bump.bumpProduct.isActive)
    .sort((a: OrderBump, b: OrderBump) => (a.displayOrder || 0) - (b.displayOrder || 0))
    .map((bump: OrderBump) => ({
      id: bump.id,
      title: bump.title ?? bump.bumpProduct.name,
      description: bump.description,
      specialPrice: bump.specialPrice / 100,
      callToAction: bump.callToAction,
      showProductImage: bump.showProductImage,
      displayOrder: bump.displayOrder,
      isActive: bump.isActive,
      bumpProduct: {
        id: bump.bumpProduct.id,
        name: bump.bumpProduct.name,
        description: bump.bumpProduct.description,
        price: bump.bumpProduct.price / 100,
        imageUrl: bump.bumpProduct.imageUrl,
        isActive: bump.bumpProduct.isActive,
        sku: bump.bumpProduct.id,
      },
      selecionado: false,
      percentDesconto: Math.round(
        ((bump.bumpProduct.price - bump.specialPrice) / bump.bumpProduct.price) * 100,
      ),
    }));

  // Renderizar o componente client-side com os dados
  return (
    <CheckoutClientComponent
      product={product}
      orderBumps={orderBumps}
      checkoutId={checkoutData.id}
      requiredFields={requiredFields}
    />
  );
}
