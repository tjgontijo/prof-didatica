type PrismaWebhook = {
  id: string;
  url: string;
  secret?: string | null;
  active: boolean;
  events: string[];
  createdAt: Date;
  updatedAt: Date;
};

type OrderStatus = 'DRAFT' | 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED';
import { z } from 'zod';

// ========================
// Core Webhook Types
// ========================

export interface WebhookWithSecret extends PrismaWebhook {
  secret?: string | null;
  headers?: Record<string, string>;
}

export interface WebhookPayload<T = unknown> {
  event: string;
  data: T;
  timestamp: string;
  signature?: string;
}

export interface WebhookResponse {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  error?: string;
  success: boolean;
}

// ========================
// Event Data Types
// ========================

export interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface OrderItemData {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  isOrderBump: boolean;
  isUpsell: boolean;
  googleDriveUrl: string | null;
}

export interface PaymentRawData {
  qrCode: string;
  qrCodeBase64: string;
  pixCopyPaste: string;
  expiresAt: string;
  mercadoPagoResponse: Record<string, unknown>;
}

export interface PaymentPixData {
  qrCode: string;
  qrCodeBase64: string;
  pixCopyPaste: string;
  expiresAt: string;
}

export interface PaymentData {
  id: string;
  method: string;
  status: string;
  amount: number;
  pix?: PaymentPixData;
}

export interface OrderEventData {
  id: string;
  checkoutId: string;
  customer: CustomerData;
  items: OrderItemData[];
  status: OrderStatus;
  totalItems: number;
  totalValue: number;
  createdAt: string;
  updatedAt: string;
  payment?: PaymentData;
}

// ========================
// Specific Event Types
// ========================

export interface OrderCreatedEvent {
  event: 'order.created';
  data: OrderEventData;
}

export interface OrderPaidEvent {
  event: 'order.paid';
  data: OrderEventData & {
    paymentId: string;
    paidAt: string;
    paymentMethod: string;
  };
}

export interface CartReminderEvent {
  event: 'cart.reminder';
  data: {
    orderId: string;
    customer: CustomerData;
    items: OrderItemData[];
    createdAt: string;
    updatedAt: string;
  };
}

export type WebhookEvent = OrderCreatedEvent | OrderPaidEvent | CartReminderEvent;

// ========================
// Prisma Query Types
// ========================

export interface OrderWithRelationsForEvent {
  id: string;
  checkoutId: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  orderItems: Array<{
    id: string;
    productId: string;
    quantity: number;
    isOrderBump: boolean | null;
    isUpsell: boolean | null;
    product: {
      id: string;
      name: string;
      price: number;
      googleDriveUrl: string | null;
    } | null;
  }>;
  payment?: {
    id: string;
    method: string;
    status: string;
    amount: number;
    paidAt: Date | null;
    rawData: PaymentRawData | null;
  } | null;
}

export interface WebhookLogCreateInput {
  webhookId: string;
  event: string;
  payload: string;
  response: string | null;
  statusCode: number | null;
  success: boolean;
}

// ========================
// Validation Schemas
// ========================

export const CustomerDataSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
});

export const OrderItemDataSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  name: z.string().min(1),
  quantity: z.number().min(1),
  price: z.number().min(0),
  isOrderBump: z.boolean(),
  isUpsell: z.boolean(),
  googleDriveUrl: z.string().nullable(),
});

export const OrderEventDataSchema = z.object({
  id: z.string().uuid(),
  checkoutId: z.string().uuid(),
  customer: CustomerDataSchema,
  items: z.array(OrderItemDataSchema).min(1, 'Deve conter pelo menos um item'),
  status: z.enum(['DRAFT', 'PENDING', 'PAID', 'COMPLETED', 'CANCELLED']),
  totalItems: z.number().min(0),
  totalValue: z.number().min(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  payment: z.object({
    id: z.string().uuid(),
    method: z.string(),
    status: z.string(),
    amount: z.number().min(0),
    pix: z.object({
      qrCode: z.string(),
      qrCodeBase64: z.string(),
      pixCopyPaste: z.string(),
      expiresAt: z.string().datetime(),
    }).optional(),
  }).optional(),
});

// ========================
// Utility Functions
// ========================

export function validateWebhookPayload<T>(
  payload: unknown,
  schema: z.ZodSchema<T>
): T {
  return schema.parse(payload);
}

export function normalizeOrderItem(item: Partial<OrderItemData>): OrderItemData {
  return {
    id: item.id || '',
    productId: item.productId || '',
    name: item.name || '',
    quantity: item.quantity || 0,
    price: item.price || 0,
    isOrderBump: !!item.isOrderBump,
    isUpsell: !!item.isUpsell,
    googleDriveUrl: item.googleDriveUrl || '',
  };
}

export interface WebhookDispatchOptions {
  delay?: number;
  maxRetries?: number;
  priority?: number;
}
