import { PrismaClient } from '@prisma/client';
import type { Checkout, Product, OrderBump } from '@prisma/client';

export type CheckoutData = Omit<Checkout, 'product'> & {
  product: Product & {
    mainProductBumps: (OrderBump & { bumpProduct: Product })[];
  };
};

export async function getCheckoutData(id: string): Promise<CheckoutData | null> {
  const prisma = new PrismaClient();

  try {
    // Buscar checkout pelo ID, incluindo produto e order bumps
    const checkout = await prisma.checkout.findUnique({
      where: {
        id: id,
        isActive: true,
        deletedAt: null,
      },
      include: {
        product: {
          include: {
            mainProductBumps: {
              where: {
                isActive: true,
                deletedAt: null,
              },
              include: {
                bumpProduct: true,
              },
              orderBy: {
                displayOrder: 'asc',
              },
            },
          },
        },
      },
    });

    if (!checkout) return null;

    return { ...checkout };
  } catch (error) {
    console.error('Erro ao buscar checkout:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}
