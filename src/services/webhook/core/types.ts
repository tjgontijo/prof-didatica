// src/services/webhook/core/types.ts
import { Webhook as PrismaWebhook, OrderStatus } from '@prisma/client';
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

export interface WebhookJob<T = unknown> {
  id: string;
  webhook: WebhookWithSecret;
  payload: WebhookPayload<T>;
  attempts: number;
  maxAttempts: number;
  scheduledFor?: Date;
}

export interface WebhookResponse {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  error?: string;
  success: boolean;
}

// ========================
// Queue Service Interface
// ========================

export interface QueueService {
  addToQueue<T>(
    webhook: WebhookWithSecret, 
    payload: WebhookPayload<T>, 
    options?: QueueOptions
  ): Promise<string>; // Retorna job ID
  
  cancelJob(jobId: string): Promise<boolean>;
  getJobStatus(jobId: string): Promise<JobStatus | null>;
  close(): Promise<void>;
}

export interface QueueOptions {
  delay?: number;
  attempts?: number;
  removeOnComplete?: boolean;
}

export interface JobStatus {
  id: string;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  attempts: number;
  maxAttempts: number;
  error?: string;
  completedAt?: Date;
  failedAt?: Date;
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
    } | null;
  }>;
  payment?: {
    id: string;
    method: string;
    paidAt: Date | null;
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
});

export const OrderEventDataSchema = z.object({
  id: z.string().uuid(),
  checkoutId: z.string().uuid(),
  customer: CustomerDataSchema,
  items: z.array(OrderItemDataSchema),
  status: z.nativeEnum(OrderStatus),
  totalItems: z.number().min(0),
  totalValue: z.number().min(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
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
    id: item.id!,
    productId: item.productId!,
    name: item.name!,
    quantity: item.quantity!,
    price: item.price!,
    isOrderBump: !!item.isOrderBump,
    isUpsell: !!item.isUpsell,
  };
}

export interface WebhookDispatchOptions {
  delay?: number;
  maxRetries?: number;
  priority?: number;
}

export interface WebhookJobData {
  eventId: string;
  webhookId: string;
  url: string;
  payload: Record<string, unknown>;
  headers: Record<string, string>;
  retryCount: number;
  maxRetries: number;
}
