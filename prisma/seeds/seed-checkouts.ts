import { PrismaClient } from '@prisma/client';

export async function seedCheckouts(prisma: PrismaClient) {
  // Busca especificamente o produto 'Missão Literária'
  const principal = await prisma.product.findFirst({
    where: { 
      name: 'Desafio Literário',
      isActive: true, 
      deletedAt: null 
    }
  });
  
  if (!principal) throw new Error('Produto "Missão Literária" não encontrado ou não está ativo.');

  await prisma.checkout.create({
    data: {
      productId: principal.id,
      isActive: true,
      campaignName: 'Campanha Principal',
//      upsellPageUrl: 'https://lp.profdidatica.com.br/planejamentos-bncc-2025',      
    }
  });
}