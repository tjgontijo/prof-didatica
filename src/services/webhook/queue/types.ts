import { Webhook as PrismaWebhook } from '@prisma/client';

export interface Webhook extends PrismaWebhook {
  headers?: Record<string, string>;
}

export interface QueueService {
  addToQueue<T>(webhook: Webhook, payload: WebhookPayload<T>): Promise<void>;
  close(): Promise<void>;
}

export interface WebhookPayload<T = unknown> {
  event: string;
  data: T;
  timestamp: string;
}

export interface WebhookJob<T = unknown> {
  webhook: Webhook;
  payload: WebhookPayload<T>;
  attempts: number;
  maxAttempts: number;
}
