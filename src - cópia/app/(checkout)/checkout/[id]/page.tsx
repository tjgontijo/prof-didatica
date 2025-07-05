import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCheckoutData, type CheckoutData } from '@/components/checkout/getCheckoutData';
import CheckoutClientComponent from '@/components/checkout/CheckoutClientComponent';
import { ProdutoInfo, OrderBump as OrderBumpType } from '@/components/checkout/types';

export type paramsType = Promise<{ id: string }>;

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

export default async function CheckoutPage(props: { params: paramsType }) {
  const { id } = await props.params;

  const checkoutData = (await getCheckoutData(id)) as CheckoutData | null;

  if (!checkoutData) {
    notFound();
  }

  const product: ProdutoInfo = {
    id: checkoutData.product.id,
    name: checkoutData.product.name,
    price: checkoutData.product.price / 100,
    description: checkoutData.product.description || '',
    imagemUrl: checkoutData.product.imageUrl || '/images/placeholder-product.png',
  };

  // Converter os order bumps do modelo Prisma para o formato usado no frontend
  const orderBumps: OrderBumpType[] = checkoutData.product.mainProductBumps
    .filter((bump) => bump.isActive && bump.bumpProduct.isActive)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    .map((bump) => ({
      id: bump.id,
      productId: bump.bumpProductId, // Adicionando o ID do produto associado ao order bump
      name: bump.bumpProduct.name,
      description: bump.bumpProduct.description || '',
      initialPrice: bump.bumpProduct.price / 100,
      specialPrice: bump.specialPrice / 100,
      imagemUrl: bump.bumpProduct.imageUrl || '/images/placeholder-product.png',
      selected: false,
      percentDiscont: Math.round(
        ((bump.bumpProduct.price - bump.specialPrice) / bump.bumpProduct.price) * 100,
      ),
      displayOrder: bump.displayOrder,
    }));

  return (
    <CheckoutClientComponent
      product={product}
      orderBumps={orderBumps}
      checkoutId={checkoutData.id}
    />
  );
}
