'use server';

import { cache } from 'react';
import { PrismaClient } from '@prisma/client';

export type OrderBump = {
  id: string;
  nome: string;
  descricao: string;
  initialPrice: number;
  price: number;
  imagemUrl: string;
  sku: string;
  selecionado: boolean;
  callToAction?: string;
};

export type ProdutoInfo = {
  nome: string;
  price: number;
  imagemUrl: string;
  sku: string;
  descricao?: string | null;
};

export type CheckoutData = {
  produto: ProdutoInfo;
  orderBumps: OrderBump[];
  checkoutId: string;
};

// Definindo o tipo para o resultado da query SQL
export type CheckoutQueryResult = {
  id: string;
  productId: string;
  product_name: string;
  product_price: string | number;
  product_description: string | null;
};

export type OrderBumpQueryResult = {
  id: string;
  description: string | null;
  callToAction: string | null;
  bump_product_id: string;
  bump_product_name: string;
  bump_product_price: string | number;
};

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
 * Função cacheada que busca os dados do checkout
 * Esta função é executada no servidor e os resultados são cacheados pelo Next.js
 */
export const prefetchCheckoutData = cache(async (id: string) => {
  console.time(`prefetch-checkout-${id}`);
  try {
    console.log(`Pré-carregando dados do checkout: ${id}`);

    // Buscar checkout pelo ID, incluindo produto e order bumps
    // Verificamos se o modelo Checkout existe no Prisma
    const checkout = await prisma.$queryRaw`
      SELECT c.id, c."productId", p.name as product_name, p.price as product_price, p.description as product_description
      FROM "Checkout" c
      JOIN "Product" p ON c."productId" = p.id
      WHERE c.id = ${id}
      AND c."isActive" = true
      AND c."deletedAt" IS NULL
    `;

    // Buscar order bumps relacionados
    const orderBumps = await prisma.$queryRaw`
      SELECT 
        mpb.id, 
        mpb.description, 
        mpb."callToAction",
        bp.id as bump_product_id, 
        bp.name as bump_product_name, 
        bp.price as bump_product_price
      FROM "ProductOrderBump" mpb
      JOIN "Product" p ON mpb."mainProductId" = p.id
      JOIN "Product" bp ON mpb."bumpProductId" = bp.id
      JOIN "Checkout" c ON c."productId" = p.id
      WHERE c.id = ${id}
      AND mpb."isActive" = true
      AND mpb."deletedAt" IS NULL
      ORDER BY mpb."displayOrder" ASC
    `;

    // Verificar se encontrou o checkout
    const checkoutResult = checkout as CheckoutQueryResult[];
    if (!checkoutResult || checkoutResult.length === 0) {
      console.error(`Checkout não encontrado: ${id}`);
      return null;
    }

    const checkoutData = checkoutResult[0];
    const orderBumpsResult = orderBumps as OrderBumpQueryResult[];

    // Transformar os dados como na página do checkout
    const responseData: CheckoutData = {
      produto: {
        nome: checkoutData.product_name,
        price: Number(checkoutData.product_price) / 100, // Convertendo de centavos para reais
        imagemUrl: '/images/system/logo_transparent.webp',
        sku: checkoutData.productId,
        descricao: checkoutData.product_description,
      },
      orderBumps: orderBumpsResult.map((bump: OrderBumpQueryResult) => ({
        id: bump.id,
        nome: bump.bump_product_name,
        descricao: bump.description || '',
        initialPrice: Number(bump.bump_product_price) / 100,
        price: Number(bump.bump_product_price) / 100,
        imagemUrl: '/images/system/logo_transparent.webp',
        sku: bump.bump_product_id,
        selecionado: false,
        callToAction: bump.callToAction || undefined,
      })),
      checkoutId: checkoutData.id,
    };

    console.log(`Dados do checkout ${id} pré-carregados com sucesso`);
    console.timeEnd(`prefetch-checkout-${id}`);
    return responseData;
  } catch (error) {
    console.error('Erro ao pré-carregar dados do checkout:', error);
    console.timeEnd(`prefetch-checkout-${id}`);
    return null;
  }
});
