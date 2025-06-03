import { Order, OrderItem } from '@prisma/client';

export type OrderWithRelations = Order & {
  orderItems: (OrderItem & {
    product: {
      id: string;
      name: string;
      price: number;
    };
  })[];
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  payment?: {
    id: string;
    method: string;
    paidAt: Date | null;
  } | null;
};

export interface OrderEventData {
  id: string;
  checkoutId: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  resource: {
    totalItems: number;
    value_total: number;
  };
  items: Array<{
    id: string;
    productId: string;
    name: string;
    quantity: number;
    price: number;
    isOrderBump: boolean;
    isUpsell: boolean;
  }>;
  status: string;
  createdAt: string;
  updatedAt: string;
}
