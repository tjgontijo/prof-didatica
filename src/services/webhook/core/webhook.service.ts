// src/services/webhook/core/webhook.service.ts
import { PrismaClient } from '@prisma/client';
import { getQueueService } from './queue.service';
import { 
  WebhookEvent, 
  WebhookPayload, 
  WebhookWithSecret,
  QueueOptions
} from './types';
import { getWebhookConfig } from '../config/webhook.config';

export class WebhookService {
  private queueService = getQueueService(this.prisma);
  private config = getWebhookConfig();

  constructor(private prisma: PrismaClient) {}

  /**
   * Despacha um evento de webhook para todos os webhooks configurados
   */
  async dispatchEvent<T extends WebhookEvent>(
    eventData: T,
    options?: QueueOptions
  ): Promise<string[]> {
    try {
      const webhooks = await this.getActiveWebhooksForEvent(eventData.event);
      
      if (webhooks.length === 0) {
        console.log(`No active webhooks found for event: ${eventData.event}`);
        return [];
      }

      const payload = this.createPayload(eventData);
      const jobIds: string[] = [];

      // Enfileira cada webhook para processamento assíncrono
      for (const webhook of webhooks) {
        const jobId = await this.queueService.addToQueue(
          webhook,
          payload,
          this.getQueueOptions(eventData.event, options)
        );
        jobIds.push(jobId);
      }

      console.log(`Enqueued ${webhooks.length} webhooks for event: ${eventData.event}`);
      return jobIds;

    } catch (error) {
      console.error('Error dispatching webhook event:', error);
      throw error;
    }
  }

  /**
   * Cancela um job de webhook específico
   */
  async cancelWebhookJob(jobId: string): Promise<boolean> {
    return this.queueService.cancelJob(jobId);
  }

  /**
   * Obtém o status de um job de webhook
   */
  async getWebhookJobStatus(jobId: string) {
    return this.queueService.getJobStatus(jobId);
  }

  /**
   * Lista todos os webhooks ativos para um evento específico
   */
  async getActiveWebhooksForEvent(event: string): Promise<WebhookWithSecret[]> {
    return this.prisma.webhook.findMany({
      where: {
        active: true,
        events: { has: event },
        deletedAt: null,
      },
    }) as Promise<WebhookWithSecret[]>;
  }

  /**
   * Cria um novo webhook
   */
  async createWebhook(data: {
    url: string;
    events: string[];
    description?: string;
    secret?: string;
    headers?: Record<string, string>;
  }) {
    return this.prisma.webhook.create({
      data: {
        url: data.url,
        events: data.events,
        description: data.description,
        active: true,
        // Note: secret e headers não estão no schema atual
        // Você pode adicionar esses campos ao schema se necessário
      },
    });
  }

  /**
   * Atualiza um webhook existente
   */
  async updateWebhook(
    id: string,
    data: Partial<{
      url: string;
      events: string[];
      description: string;
      active: boolean;
      secret: string;
      headers: Record<string, string>;
    }>
  ) {
    return this.prisma.webhook.update({
      where: { id },
      data: {
        url: data.url,
        events: data.events,
        description: data.description,
        active: data.active,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Remove um webhook (soft delete)
   */
  async deleteWebhook(id: string) {
    return this.prisma.webhook.update({
      where: { id },
      data: {
        active: false,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Obtém logs de webhook com filtros
   */
  async getWebhookLogs(filters: {
    webhookId?: string;
    event?: string;
    success?: boolean;
    limit?: number;
    offset?: number;
  } = {}) {
    const where: Record<string, unknown> = {};
    
    if (filters.webhookId) where.webhookId = filters.webhookId;
    if (filters.event) where.event = filters.event;
    if (typeof filters.success === 'boolean') where.success = filters.success;

    return this.prisma.webhookLog.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
      include: {
        webhook: {
          select: {
            id: true,
            url: true,
            description: true,
          },
        },
      },
    });
  }

  /**
   * Obtém estatísticas de webhook
   */
  async getWebhookStats(webhookId?: string) {
    const where = webhookId ? { webhookId } : {};

    const [total, successful, failed] = await Promise.all([
      this.prisma.webhookLog.count({ where }),
      this.prisma.webhookLog.count({ where: { ...where, success: true } }),
      this.prisma.webhookLog.count({ where: { ...where, success: false } }),
    ]);

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
    };
  }

  private createPayload<T extends WebhookEvent>(eventData: T): WebhookPayload<T['data']> {
    return {
      event: eventData.event,
      data: eventData.data,
      timestamp: new Date().toISOString(),
    };
  }

  private getQueueOptions(event: string, options?: QueueOptions): QueueOptions {
    const defaultOptions: QueueOptions = {
      attempts: this.config.queue.maxRetries,
      removeOnComplete: true,
    };

    // Configurações específicas por evento
    if (event === this.config.events.CART_REMINDER) {
      defaultOptions.delay = this.config.queue.defaultDelay;
    }

    return { ...defaultOptions, ...options };
  }

  /**
   * Fecha o serviço e limpa recursos
   */
  async close(): Promise<void> {
    await this.queueService.close();
  }
}

// Singleton instance
let webhookService: WebhookService | null = null;

export function getWebhookService(prisma: PrismaClient): WebhookService {
  if (!webhookService) {
    webhookService = new WebhookService(prisma);
  }
  return webhookService;
}

// Função para resetar o singleton (útil para testes)
export function resetWebhookService(): void {
  webhookService = null;
}
