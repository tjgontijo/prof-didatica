import { PrismaClient } from '@prisma/client';

export async function seedOrderBumps(prisma: PrismaClient) {
  const products = await prisma.product.findMany({ 
    orderBy: { createdAt: 'asc' },
    where: { isActive: true, deletedAt: null }
  });
  
  if (products.length < 3) throw new Error('É necessário pelo menos três produtos ativos para o seed.');

  const [produtoPrincipal, primeiroBump, segundoBump] = products;

  // Primeiro order bump - 50% de desconto
  await prisma.orderBump.create({
    data: {
      mainProductId: produtoPrincipal.id,
      bumpProductId: primeiroBump.id,
      callToAction: 'Aproveite e leve junto!',
      title: primeiroBump.name,
      description: 'Aproveite este produto com desconto exclusivo!',
      specialPrice: Math.floor(primeiroBump.price * 0.5), // 50% de desconto
      showProductImage: true,
      displayOrder: 1,
      isActive: true,
    }
  });

  // Segundo order bump - 40% de desconto com descrição diferente
  await prisma.orderBump.create({
    data: {
      mainProductId: produtoPrincipal.id,
      bumpProductId: segundoBump.id,
      callToAction: 'Aproveite e leve junto!',
      title: primeiroBump.name,
      description: 'Aproveite este produto com desconto exclusivo!',
      specialPrice: Math.floor(primeiroBump.price * 0.6), // 50% de desconto
      showProductImage: true,
      displayOrder: 2,
      isActive: true,
    }
  });

  console.log('✅ 2 order bumps criados com sucesso!');
}