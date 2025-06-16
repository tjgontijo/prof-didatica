// src/services/webhook/core/webhook.service.ts
import { PrismaClient } from '@prisma/client';

import { WebhookEvent, WebhookPayload } from './types';
import { getWebhookConfig } from '../config/webhook.config';

export class WebhookService {
  private config = getWebhookConfig();

  constructor(private prisma: PrismaClient) {}

  /**
   * Despacha um evento de webhook para todos os webhooks configurados
   */
  async dispatchEvent<T extends WebhookEvent>(eventData: T): Promise<string[]> {
    try {
      const webhooks = await this.getActiveWebhooksForEvent(eventData.event);
      if (webhooks.length === 0) {
        return [];
      }

      const payload = this.createPayload(eventData);
      const sentIds: string[] = [];

      for (const webhook of webhooks) {
        let responseText = '';
        let statusCode: number | null = null;
        let success = false;
        try {
          const res = await fetch(webhook.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          statusCode = res.status;
          responseText = await res.text();
          success = res.ok;
        } catch (error: unknown) {
          if (error instanceof Error) {
            responseText = error.message;
          } else {
            responseText = String(error);
          }
          statusCode = null;
          success = false;
        }
        // Cria log do envio
        await this.prisma.webhookLog.create({
          data: {
            webhookId: webhook.id,
            event: eventData.event,
            payload: JSON.stringify(payload),
            response: responseText,
            statusCode,
            success,
          },
        });
        sentIds.push(webhook.id);
      }

      return sentIds;
    } catch (error) {
      throw error;
    }
  }

  // Métodos de fila removidos pois não há mais fila

  /**
   * Lista todos os webhooks ativos para um evento específico
   */
  async getActiveWebhooksForEvent(
    event: string,
  ): Promise<
    { id: string; url: string; events: string[]; active: boolean; deletedAt: Date | null }[]
  > {
    return this.prisma.webhook.findMany({
      where: {
        active: true,
        events: { has: event },
        deletedAt: null,
      },
      select: {
        id: true,
        url: true,
        events: true,
        active: true,
        deletedAt: true,
      },
    });
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
    }>,
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
  async getWebhookLogs(
    filters: {
      webhookId?: string;
      event?: string;
      success?: boolean;
      limit?: number;
      offset?: number;
    } = {},
  ) {
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
