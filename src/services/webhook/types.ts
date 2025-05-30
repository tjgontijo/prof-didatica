import { Webhook, WebhookLog, OrderStatus } from '@prisma/client';
import { WebhookEventValue } from './constants';

// Tipos base
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

export interface OrderResourceBase {
  totalItems: number;
  value_total: number;
}

// Tipo base para todos os eventos de pedido
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

// Tipos específicos para cada evento
export interface OrderCreatedResource extends OrderEventResource {
  event: 'order.created';
}

export interface OrderPaidResource extends OrderEventResource {
  event: 'order.paid';
  paymentId: string;
  paidAt: string;
  paymentMethod: string;
}

// Tipo unificado para todos os eventos
export type WebhookEventData = 
  | OrderCreatedResource 
  | OrderPaidResource;

// Payload que será enviado no webhook
export interface WebhookPayload<T extends WebhookEventData> {
  event: T['event'];
  data: Omit<T, 'event'>;
  timestamp: string;
}

// Tipos para os parâmetros do dispatcher
export interface WebhookDispatcherParams {
  prisma: {
    webhook: {
      findMany: (args: {
        where: {
          active: boolean;
          events: { has: string };
        };
      }) => Promise<Webhook[]>;
    };
    webhookLog: {
      create: (args: {
        data: {
          webhookId: string;
          event: string;
          payload: string;
          response: string | null;
          statusCode: number | null;
          success: boolean;
        };
      }) => Promise<WebhookLog>;
    };
  };
}