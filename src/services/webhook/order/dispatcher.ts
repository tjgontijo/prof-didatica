import { PrismaClient } from '@prisma/client';
import { WebhookDispatcher } from '../dispatcher';
import { OrderWebhookEvent } from './types/order-resources';

export class OrderWebhookDispatcher {
  private dispatcher: WebhookDispatcher;

  constructor(private prisma: PrismaClient) {
    this.dispatcher = new WebhookDispatcher({
      webhook: {
        findMany: (args) => prisma.webhook.findMany(args),
      },
      webhookLog: {
        create: (args) => prisma.webhookLog.create(args),
      },
    });
  }

  async dispatchEvent(eventData: OrderWebhookEvent): Promise<void> {
    const { event, ...data } = eventData;
    const payload = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };
    await this.dispatcher.dispatch(payload);
  }
}

// Função para obter instância singleton
let orderWebhookDispatcher: OrderWebhookDispatcher | null = null;

export function getOrderWebhookDispatcher(prisma: PrismaClient): OrderWebhookDispatcher {
  if (!orderWebhookDispatcher) {
    orderWebhookDispatcher = new OrderWebhookDispatcher(prisma);
  }
  return orderWebhookDispatcher;
}