'use server';

import { cache } from 'react';
import { PrismaClient } from '@prisma/client';

// Criando uma instância singleton do PrismaClient
const prismaClientSingleton = () => {
  return new PrismaClient();
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Função cacheada que busca o ID do checkout com base na slug do produto
 * Esta função é executada no servidor e os resultados são cacheados pelo Next.js
 * Otimizada para buscar o checkout diretamente com um único join, reduzindo consultas ao banco
 */
export const getCheckoutIdBySlug = cache(async (slug: string) => {
  console.time(`Buscando checkout para produto com slug: ${slug}`);
  try {
    // Buscar o checkout diretamente com join no produto, eliminando consultas separadas
    const checkout = await prisma.checkout.findFirst({
      where: {
        product: {
          slug,
          isActive: true,
          deletedAt: null
        },
        isActive: true,
        deletedAt: null
      },
      select: {
        id: true,
        product: {
          select: {
            name: true,
            id: true
          }
        }
      }
    });
    
    if (!checkout) {
      console.error(`Checkout não encontrado para produto com slug: ${slug}`);
      return null;
    }
    
    console.log(`Checkout encontrado: ${checkout.id} para produto: ${checkout.product.name} (${checkout.product.id})`);
    return checkout.id;
  } catch (error) {
    console.error(`Erro ao buscar checkout para slug ${slug}:`, error);
    return null;
  }
});
