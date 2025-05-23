import { PrismaClient } from '@prisma/client';

export async function seedCheckouts(prisma: PrismaClient) {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } });
  if (products.length < 2) throw new Error('É necessário pelo menos dois produtos para seed.');

  const principal = products[0];

  await prisma.checkout.create({
    data: {
      productId: principal.id,
      isActive: true,
      campaignName: 'Campanha Principal',
      upsellPageUrl: 'https://lp.profdidatica.com.br/obrigado',
      requiredFields: ['customerName', 'customerEmail', 'customerPhone'],
    }
  });
}