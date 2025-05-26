import { prisma } from '@/lib/prisma'; // Added import
import type { Checkout, Product, OrderBump } from '@prisma/client';

/**
 * Função para buscar dados do checkout pelo ID
 * @param id ID do checkout a ser buscado
 * @returns Dados do checkout ou null se não encontrado
 */
export type CheckoutData = Omit<Checkout, 'product' | 'requiredFields'> & {
  requiredFields: string[];
  product: Product & {
    mainProductBumps: (OrderBump & { bumpProduct: Product })[];
  };
};

export async function getCheckoutData(id: string): Promise<CheckoutData | null> {
  // const prisma = new PrismaClient(); // DELETED THIS LINE

  try {
    // Buscar checkout pelo ID, incluindo produto e order bumps
    // All prisma operations (prisma.checkout.findUnique, etc.) will now use the imported shared instance
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

    // console.log('=== DADOS DO CHECKOUT ===');
    // console.log('Checkout ID:', checkout?.id);
    // console.log('Produto principal:');

    // const logData = {
    //   id: checkout?.id,
    //   product: {
    //     id: checkout?.product.id,
    //     name: checkout?.product.name,
    //     price: checkout?.product.price,
    //     mainProductBumps: checkout?.product.mainProductBumps?.map(bump => ({
    //       id: bump.id,
    //       title: bump.title,
    //       description: bump.description,
    //       specialPrice: bump.specialPrice,
    //       callToAction: bump.callToAction,
    //       showProductImage: bump.showProductImage,
    //       displayOrder: bump.displayOrder,
    //       isActive: bump.isActive,
    //       bumpProduct: {
    //         id: bump.bumpProduct?.id,
    //         name: bump.bumpProduct?.name,
    //         description: bump.bumpProduct?.description,
    //         price: bump.bumpProduct?.price,
    //         imageUrl: bump.bumpProduct?.imageUrl,
    //         isActive: bump.bumpProduct?.isActive
    //       }
    //     }))
    //   },
    //   requiredFields: checkout?.requiredFields,
    //   isActive: checkout?.isActive,
    //   createdAt: checkout?.createdAt,
    //   updatedAt: checkout?.updatedAt,
    //   deletedAt: checkout?.deletedAt
    // };

    // console.log(JSON.stringify(logData, null, 2));
    // console.log('=========================');

    if (!checkout) return null;
    // Parsear requiredFields JSON
    const raw = checkout.requiredFields ?? [];
    const requiredFields = typeof raw === 'string' ? JSON.parse(raw) : raw;

    return { ...checkout, requiredFields };
  } catch (error) {
    console.error('Erro ao buscar checkout:', error);
    return null;
  } finally {
    // await prisma.$disconnect(); // DELETED THIS LINE
  }
}
