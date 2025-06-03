import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

export interface CustomerResource {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface OrderItemResource {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  isOrderBump: boolean;
  isUpsell: boolean;
}

// Garantir que os itens sempre tenham os campos obrigatórios
export function normalizeOrderItem(item: Partial<OrderItemResource>): OrderItemResource {
  return {
    id: item.id!,
    productId: item.productId!,
    name: item.name!,
    quantity: item.quantity!,
    price: item.price!,
    isOrderBump: !!item.isOrderBump,
    isUpsell: !!item.isUpsell
  };
}


export interface OrderResourceBase {
  totalItems: number;
  value_total: number;
}

export interface OrderEventResource {
  id: string;
  checkoutId: string;
  customer: CustomerResource;
  resource: OrderResourceBase;
  items: OrderItemResource[];
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export const CustomerResourceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10)
});

export const OrderItemResourceSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  name: z.string().min(1),
  quantity: z.number().min(1),
  price: z.number().min(0),
  isOrderBump: z.boolean(),
  isUpsell: z.boolean()
});

export const OrderResourceBaseSchema = z.object({
  totalItems: z.number().min(1),
  value_total: z.number().min(0)
});

export const OrderEventResourceSchema = z.object({
  id: z.string().uuid(),
  checkoutId: z.string().uuid(),
  customer: CustomerResourceSchema,
  resource: OrderResourceBaseSchema,
  items: z.array(OrderItemResourceSchema),
  status: z.nativeEnum(OrderStatus),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export interface OrderCreatedResource extends OrderEventResource {
  event: 'order.created';
}

export const OrderCreatedResourceSchema = OrderEventResourceSchema.extend({
  event: z.literal('order.created')
});

export function validateOrderCreated(data: unknown): OrderCreatedResource {
  return OrderCreatedResourceSchema.parse(data);
}

export interface OrderPaidResource extends OrderEventResource {
  event: 'order.paid';
  paymentId: string;
  paidAt: string;
  paymentMethod: string;
}

export const OrderPaidResourceSchema = OrderEventResourceSchema.extend({
  event: z.literal('order.paid'),
  paymentId: z.string().uuid(),
  paidAt: z.string().datetime(),
  paymentMethod: z.string()
});

export function validateOrderPaid(data: unknown): OrderPaidResource {
  return OrderPaidResourceSchema.parse(data);
}

export const CartReminderResourceSchema = z.object({
  event: z.literal('cart.reminder'),
  orderId: z.string().uuid(),
  customer: CustomerResourceSchema,
  items: z.array(z.object({
    id: z.string().uuid(),
    productId: z.string().uuid(),
    name: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0)
  })),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export interface CartReminderResource {
  event: 'cart.reminder';
  orderId: string;
  customer: CustomerResource;
  items: Array<{
    id: string;
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export function validateCartReminder(data: unknown): CartReminderResource {
  return CartReminderResourceSchema.parse(data);
}

export type OrderWebhookEvent = OrderCreatedResource | OrderPaidResource | CartReminderResource;
