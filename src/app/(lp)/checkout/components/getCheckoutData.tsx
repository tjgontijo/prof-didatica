import { PrismaClient } from '@prisma/client';
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
  const prisma = new PrismaClient();
  
  try {
    // Buscar checkout pelo ID, incluindo produto e order bumps
    const checkout = await prisma.checkout.findUnique({
      where: {
        id: id,
        isActive: true,
        deletedAt: null
      },
      include: {
        product: {
          include: {
            mainProductBumps: {
              where: {
                isActive: true,
                deletedAt: null
              },
              include: {
                bumpProduct: true
              },
              orderBy: {
                displayOrder: 'asc'
              }
            }
          }
        }
      }
    });
    
    if (!checkout) return null;
    // Parsear requiredFields JSON
    const raw = checkout.requiredFields ?? [];
    const requiredFields = typeof raw === 'string' ? JSON.parse(raw) : raw;
    
    return { ...checkout, requiredFields };
  } catch (error) {
    console.error('Erro ao buscar checkout:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}