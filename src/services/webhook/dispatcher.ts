// src/services/webhook/dispatcher.ts
import { Webhook, WebhookLog } from '@prisma/client';
import * as crypto from 'crypto';
import { WebhookDispatcherParams } from './types';
import { WebhookPayload } from './queue/types';
import { getQueueService } from './queue/in-memory-queue.service';

export class WebhookDispatcher {
  private queueService = getQueueService();

  constructor(private prisma: WebhookDispatcherParams['prisma']) {}

  async dispatch<T extends { event: string }>(eventData: T): Promise<void> {
    try {
      const webhooks = await this.prisma.webhook.findMany({
        where: {
          active: true,
          events: { has: eventData.event }
        }
      });

      // Adiciona cada webhook à fila para processamento assíncrono
      await Promise.all(
        webhooks.map(webhook => 
          this.enqueueWebhook(webhook, eventData)
        )
      );
    } catch (error) {
      console.error('Erro ao enfileirar webhooks:', error);
      throw error;
    }
  }

  private async enqueueWebhook<T extends { event: string }>(
    webhook: Webhook & { secret?: string | null },
    eventData: T
  ): Promise<void> {
    const { event, ...data } = eventData;
    const payload: WebhookPayload<typeof data> = {
      event,
      data,
      timestamp: new Date().toISOString()
    };

    // Gera a assinatura para o payload
    const signature = this.generateSignature(payload, webhook.secret || '');
    
    // Adiciona a assinatura ao payload antes de enfileirar
    const signedPayload = {
      ...payload,
      signature
    };
    
    // Adiciona à fila para processamento assíncrono
    await this.queueService.addToQueue(webhook, signedPayload);
    
    // Registra o log do webhook enfileirado
    await this.logWebhook<typeof data>(
      webhook.id,
      event,
      signedPayload,
      { status: 202, statusText: 'Enqueued for processing' },
      true
    );
  }

  private generateSignature<T>(payload: WebhookPayload<T>, secret: string): string {
    if (!secret) return '';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  private async logWebhook<T>(
    webhookId: string,
    event: string,
    payload: WebhookPayload<T> & { signature?: string },
    response: {
      status?: number;
      statusText?: string;
      headers?: Record<string, string>;
      error?: string;
    },
    success: boolean
  ): Promise<WebhookLog> {
    return this.prisma.webhookLog.create({
      data: {
        webhookId,
        event,
        payload: JSON.stringify(payload),
        response: JSON.stringify(response),
        statusCode: response.status ?? null,
        success
      }
    });
  }
}