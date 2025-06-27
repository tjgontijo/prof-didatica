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
 */
export const getCheckoutIdBySlug = cache(async (slug: string) => {
  console.time(`Buscando checkout para produto com slug: ${slug}`);
  try {
    // Buscar o produto pela slug
    const product = await prisma.product.findFirst({
      where: {
        slug,
        isActive: true,
        deletedAt: null
      },
      select: {
        id: true,
        name: true
      }
    });
    
    if (!product) {
      console.error(`Produto não encontrado com slug: ${slug}`);
      return null;
    }
    
    console.log(`Produto encontrado: ${product.name} (${product.id})`);
    
    // Buscar checkout associado ao produto
    const checkout = await prisma.checkout.findFirst({
      where: {
        productId: product.id,
        isActive: true,
        deletedAt: null
      },
      select: {
        id: true
      }
    });
    
    if (!checkout) {
      console.error(`Checkout não encontrado para o produto: ${product.name} (${product.id})`);
      return null;
    }
    
    console.log(`Checkout encontrado: ${checkout.id}`);
    return checkout.id;
  } catch (error) {
    console.error(`Erro ao buscar checkout para slug ${slug}:`, error);
    return null;
  }
});

// Não precisamos de mais funções além de getCheckoutIdBySlug
