// src/services/webhook/dispatcher.ts
import { Webhook, WebhookLog } from '@prisma/client';
import * as crypto from 'crypto';
import { WebhookEventData, WebhookPayload, WebhookDispatcherParams } from './types';

export class WebhookDispatcher {
  constructor(private prisma: WebhookDispatcherParams['prisma']) {}

  async dispatch<T extends WebhookEventData>(eventData: T): Promise<void> {
    try {
      const webhooks = await this.prisma.webhook.findMany({
        where: {
          active: true,
          events: { has: eventData.event }
        }
      });

      await Promise.all(
        webhooks.map(webhook => 
          this.sendWebhook(webhook, eventData)
        )
      );
    } catch (error) {
      console.error('Erro ao disparar webhooks:', error);
      throw error;
    }
  }

  private async sendWebhook<T extends WebhookEventData>(
    webhook: Webhook,
    eventData: T
  ): Promise<void> {
    const payload: WebhookPayload<T> = {
      event: eventData.event,
      data: { ...eventData } as Omit<T, 'event'>,
      timestamp: new Date().toISOString()
    };

    const signature = this.generateSignature(payload, webhook.secret || '');

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': eventData.event,
          'X-Webhook-Delivery': crypto.randomUUID()
        },
        body: JSON.stringify(payload)
      });

      await this.logWebhook(webhook.id, eventData.event, payload, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      }, response.ok);
    } catch (error) {
      await this.logWebhook(
        webhook.id,
        eventData.event,
        payload,
        { error: error instanceof Error ? error.message : 'Erro desconhecido' },
        false
      );
      throw error;
    }
  }

  private generateSignature(payload: unknown, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  private async logWebhook(
    webhookId: string,
    event: string,
    payload: unknown,
    response: Record<string, any>,
    success: boolean
  ): Promise<WebhookLog> {
    return this.prisma.webhookLog.create({
      data: {
        webhookId,
        event,
        payload: JSON.stringify(payload),
        response: JSON.stringify(response),
        statusCode: 'status' in response ? response.status : null,
        success
      }
    });
  }
}