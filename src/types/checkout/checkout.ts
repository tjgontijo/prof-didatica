import type { Checkout, Product, OrderBump } from '@prisma/client';

export type CheckoutData = Omit<Checkout, 'product'> & {
  product: Product & {
    mainProductBumps: (OrderBump & { bumpProduct: Product })[];
  };
};
