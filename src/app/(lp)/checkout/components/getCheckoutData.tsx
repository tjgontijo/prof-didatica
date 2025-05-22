import { PrismaClient } from '@prisma/client';

/**
 * Função para buscar dados do checkout pelo ID
 * @param id ID do checkout a ser buscado
 * @returns Dados do checkout ou null se não encontrado
 */
export async function getCheckoutData(id: string) {
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
    
    return checkout;
  } catch (error) {
    console.error('Erro ao buscar checkout:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}