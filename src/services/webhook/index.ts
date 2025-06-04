// src/services/webhook/index.ts - Nova estrutura refatorada
import { PrismaClient } from '@prisma/client';
import { getWebhookService } from './core/webhook.service';
import { getQueueService } from './core/queue.service';
import { OrderCreatedEventHandler } from './events/order-created.event';
import { OrderPaidEventHandler } from './events/order-paid.event';
import { CartReminderEventHandler } from './events/cart-reminder.event';

export class WebhookOrchestrator {
  private webhookService = getWebhookService(this.prisma);
  private queueService = getQueueService(this.prisma);
  private orderCreatedHandler = new OrderCreatedEventHandler(this.prisma);
  private orderPaidHandler = new OrderPaidEventHandler(this.prisma);
  private cartReminderHandler = new CartReminderEventHandler(this.prisma);

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
   * Agenda cart reminder para um pedido
   */
  async scheduleCartReminder(orderId: string): Promise<string> {
    try {
      const event = await this.cartReminderHandler.createEvent(orderId);
      const jobIds = await this.webhookService.dispatchEvent(event, {
        delay: 100 * 1000, // 100 segundos
      });
      
      console.log(`Cart reminder agendado para pedido ${orderId}`);
      return jobIds[0] || ''; // Retorna o primeiro job ID
    } catch (error) {
      console.error('Erro ao agendar cart reminder:', error);
      throw error;
    }
  }

  /**
   * Cancela cart reminder de um pedido
   */
  async cancelCartReminder(jobId: string): Promise<boolean> {
    try {
      const cancelled = await this.webhookService.cancelWebhookJob(jobId);
      if (cancelled) {
        console.log(`Cart reminder cancelado: ${jobId}`);
      }
      return cancelled;
    } catch (error) {
      console.error('Erro ao cancelar cart reminder:', error);
      return false;
    }
  }

  /**
   * Processa cart reminder (chamado pelo processador de queue)
   */
  async processCartReminder(orderId: string): Promise<void> {
    try {
      await this.cartReminderHandler.processCartReminder(orderId);
      
      // Após marcar como ABANDONED_CART, dispara o webhook
      const event = await this.cartReminderHandler.createEvent(orderId);
      await this.webhookService.dispatchEvent(event);
    } catch (error) {
      console.error('Erro ao processar cart reminder:', error);
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

  /**
   * Fecha o orquestrador e limpa recursos
   */
  async close(): Promise<void> {
    await this.webhookService.close();
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
export { getQueueService } from './core/queue.service';
export * from './core/types';
export * from './config/webhook.config';

// Exportações dos handlers de eventos
export { OrderCreatedEventHandler } from './events/order-created.event';
export { OrderPaidEventHandler } from './events/order-paid.event';
export { CartReminderEventHandler } from './events/cart-reminder.event';
