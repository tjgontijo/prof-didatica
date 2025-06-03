import { PrismaClient } from '@prisma/client';
import { WebhookDispatcher } from './dispatcher';

export class WebhookService {
  private dispatcher: WebhookDispatcher;

  constructor(private prisma: PrismaClient) {
    this.dispatcher = new WebhookDispatcher(prisma);
  }

  async dispatchEvent<T extends { event: string }>(eventData: T): Promise<void> {
    try {
      await this.dispatcher.dispatch(eventData);
    } catch (error) {
      console.error('Erro ao despachar evento de webhook:', error);
      throw error;
    }
  }
}

// Exportar uma instância singleton
let webhookService: WebhookService | null = null;

export function getWebhookService(prisma: PrismaClient): WebhookService {
  if (!webhookService) {
    webhookService = new WebhookService(prisma);
  }
  return webhookService;
}

// Exportar apenas os tipos genéricos do core
export * from './types';

// Exportar o dispatcher
export * from './dispatcher';

// Exportar tipos específicos de forma organizada
export * as OrderWebhookTypes from './order/types';
