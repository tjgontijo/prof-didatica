import { PrismaClient } from '@prisma/client';
import { OrderCreatedEvent } from '../events/order-created.event';
import { OrderPaidEvent } from '../events/order-paid.event';
import { OrderWebhookDispatcher } from '../dispatcher';

import { CartReminderEvent } from '../events/cart-reminder.event';

export class OrderWebhookOrchestrator {
  private createdEvent: OrderCreatedEvent;
  private paidEvent: OrderPaidEvent;
  private webhookDispatcher: OrderWebhookDispatcher;
  private cartReminderEvent: CartReminderEvent;

  constructor(private prisma: PrismaClient) {
    this.createdEvent = new OrderCreatedEvent(prisma);
    this.paidEvent = new OrderPaidEvent(prisma);
    this.cartReminderEvent = new CartReminderEvent(prisma);
    this.webhookDispatcher = new OrderWebhookDispatcher(prisma);
  }

  async dispatchOrderCreated(orderId: string): Promise<void> {
    try {
      const eventData = await this.createdEvent.execute(orderId);
      await this.webhookDispatcher.dispatchEvent(eventData);
    } catch (error) {
      console.error('Erro ao processar evento order.created:', error);
      throw error;
    }
  }

  async dispatchCartReminder(orderId: string): Promise<void> {
    try {
      const eventData = await this.cartReminderEvent.execute(orderId);
      await this.webhookDispatcher.dispatchEvent(eventData);
    } catch (error) {
      console.error('Erro ao processar evento cart.reminder:', error);
      throw error;
    }
  }

  async dispatchOrderPaid(orderId: string): Promise<void> {
    try {
      const eventData = await this.paidEvent.execute(orderId);
      await this.webhookDispatcher.dispatchEvent(eventData);
    } catch (error) {
      console.error('Erro ao processar evento order.paid:', error);
      throw error;
    }
  }
}

// Exportar uma instância singleton
let orderWebhookOrchestrator: OrderWebhookOrchestrator | null = null;

export function getOrderWebhookOrchestrator(prisma: PrismaClient): OrderWebhookOrchestrator {
  if (!orderWebhookOrchestrator) {
    orderWebhookOrchestrator = new OrderWebhookOrchestrator(prisma);
  }
  return orderWebhookOrchestrator;
}
