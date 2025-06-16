import { PrismaClient } from '@prisma/client';

export async function seedOrderBumps(prisma: PrismaClient) {
  // Busca todos os produtos ativos ordenados por data de criação
  const produtos = await prisma.product.findMany({
    where: { 
      isActive: true, 
      deletedAt: null 
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  // Se tiver menos de 2 produtos, não faz nada
  if (produtos.length < 2) {    
    return;
  }

  // O primeiro produto é considerado o principal
  const produtoPrincipal = produtos[0];
  
  // Array para armazenar os produtos que serão usados como orderbumps
  const orderBumps = [];
  
  // Se tiver 2 produtos, usa o segundo como orderbump
  if (produtos.length >= 2) {
    orderBumps.push(produtos[1]);
  }
  
  // Se tiver 3 ou mais produtos, usa o terceiro como segundo orderbump
  if (produtos.length >= 3) {
    orderBumps.push(produtos[2]);
  }
  
    // Cria os orderbumps baseado nos produtos disponíveis
  await Promise.all(
    orderBumps.map(async (bump, index) => {
      const isFirstBump = index === 0;
      const displayOrder = index + 1;
      const discount = isFirstBump ? 0.5 : 0.4; // 50% para o primeiro, 40% para o segundo
      const specialPrice = Math.floor(bump.price * (1 - discount));
      
      await prisma.orderBump.create({
        data: {
          mainProductId: produtoPrincipal.id,
          bumpProductId: bump.id,          
          title: bump.name,
          description: `Aproveite este produto com ${discount * 100}% de desconto!`,
          specialPrice: specialPrice,          
          displayOrder: displayOrder,
          isActive: true,
        }
      });            
    })
  );  
}