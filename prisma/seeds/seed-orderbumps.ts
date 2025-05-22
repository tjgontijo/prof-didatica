import { PrismaClient } from '@prisma/client';

export async function seedOrderBumps(prisma: PrismaClient) {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } });
  if (products.length < 2) throw new Error('É necessário pelo menos dois produtos para seed.');

  const principal = products[0];
  const bump = products[products.length - 1];

  await prisma.productOrderBump.create({
    data: {
      mainProductId: principal.id,
      bumpProductId: bump.id,
      callToAction: 'Aproveite e compre junto!',
      title: 'Oferta especial',
      description: 'Adicione este produto com desconto exclusivo!',
      showProductImage: true,
      displayOrder: 1,
      isActive: true,
    }
  });
}