// src/services/webhook/index.ts - Nova estrutura refatorada
import { PrismaClient } from '@prisma/client';
import { getWebhookService } from './core/webhook.service';

import { OrderCreatedEventHandler } from './events/order-created.event';
import { OrderPaidEventHandler } from './events/order-paid.event';


export class WebhookOrchestrator {
  private webhookService = getWebhookService(this.prisma);

  private orderCreatedHandler = new OrderCreatedEventHandler(this.prisma);
  private orderPaidHandler = new OrderPaidEventHandler(this.prisma);


  constructor(private prisma: PrismaClient) {}

  /**
   * Processa evento de pedido criado
   */
  async processOrderCreated(orderId: string): Promise<string[]> {
    try {
      const event = await this.orderCreatedHandler.createEvent(orderId);
      return await this.webhookService.dispatchEvent(event);
    } catch (error) {
      console.error('Erro ao processar evento order.created:', error);
      throw error;
    }
  }

  /**
   * Processa evento de pedido pago
   */
  async processOrderPaid(orderId: string): Promise<string[]> {
    try {
      const event = await this.orderPaidHandler.createEvent(orderId);
      return await this.webhookService.dispatchEvent(event);
    } catch (error) {
      console.error('Erro ao processar evento order.paid:', error);
      throw error;
    }
  }


  /**
   * Obtém estatísticas de webhooks
   */
  async getWebhookStats(webhookId?: string) {
    return this.webhookService.getWebhookStats(webhookId);
  }

  /**
   * Obtém logs de webhooks
   */
  async getWebhookLogs(filters: {
    webhookId?: string;
    event?: string;
    success?: boolean;
    limit?: number;
    offset?: number;
  } = {}) {
    return this.webhookService.getWebhookLogs(filters);
  }


}

// Singleton instance
let webhookOrchestrator: WebhookOrchestrator | null = null;

export function getWebhookOrchestrator(prisma: PrismaClient): WebhookOrchestrator {
  if (!webhookOrchestrator) {
    webhookOrchestrator = new WebhookOrchestrator(prisma);
  }
  return webhookOrchestrator;
}

// Função para resetar o singleton (útil para testes)
export function resetWebhookOrchestrator(): void {
  webhookOrchestrator = null;
}

// Exportações principais
export { getWebhookService } from './core/webhook.service';

export * from './core/types';
export * from './config/webhook.config';

// Exportações dos handlers de eventos
export { OrderCreatedEventHandler } from './events/order-created.event';
export { OrderPaidEventHandler } from './events/order-paid.event';
export { CartReminderEventHandler } from './events/cart-reminder.event';
