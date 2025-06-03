// src/services/webhook/queue/in-memory-queue.service.ts
import { Webhook } from '@prisma/client';
import { QueueService, WebhookJob, WebhookPayload } from './types';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';

export class InMemoryQueueService implements QueueService {
  private queue: WebhookJob<unknown>[] = [];
  private isProcessing = false;
  private eventEmitter = new EventEmitter();
  private activeProcesses = new Set<Promise<void>>();
  private readonly MAX_CONCURRENT = 5;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAYS = [5000, 15000, 30000]; // 5s, 15s, 30s
  private isShuttingDown = false;

  constructor() {
    this.eventEmitter.on('jobAdded', () => this.processQueue());
  }

  async addToQueue<T>(webhook: Webhook, payload: WebhookPayload<T>): Promise<void> {
    const job: WebhookJob<T> = {
      webhook,
      payload,
      attempts: 0,
      maxAttempts: this.MAX_RETRIES
    };

    this.queue.push(job);
    this.eventEmitter.emit('jobAdded');
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.activeProcesses.size >= this.MAX_CONCURRENT) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0 && this.activeProcesses.size < this.MAX_CONCURRENT) {
      const job = this.queue.shift();
      if (!job) continue;

      const processPromise = this.processJob(job).finally(() => {
        this.activeProcesses.delete(processPromise);
        if (this.activeProcesses.size === 0) {
          this.isProcessing = false;
          if (this.queue.length > 0) {
            this.processQueue();
          }
        }
      });

      this.activeProcesses.add(processPromise);
    }

    this.isProcessing = false;
  }

  private async processJob(job: WebhookJob<unknown>): Promise<void> {
    try {
      const { webhook, payload } = job;
      // Usar type assertion para acessar a propriedade secret
      const webhookWithSecret = webhook as Webhook & { secret?: string | null };
      const signature = this.generateSignature(payload, webhookWithSecret.secret || '');

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': payload.event,
          'X-Webhook-Delivery': crypto.randomUUID()
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000) // 10s timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(`Webhook delivered to ${webhook.url} for event ${payload.event}`);
    } catch (error) {
      console.error(`Error delivering webhook (attempt ${job.attempts + 1}/${job.maxAttempts}):`, error);
      
      if (job.attempts < job.maxAttempts) {
        job.attempts++;
        const delay = this.RETRY_DELAYS[Math.min(job.attempts - 1, this.RETRY_DELAYS.length - 1)];
        setTimeout(() => this.addToQueue(job.webhook, job.payload), delay);
      } else {
        console.error(`Max retries reached for webhook to ${job.webhook.url}`, {
          event: job.payload.event,
          attempts: job.attempts
        });
      }
    }
  }

  private generateSignature(payload: WebhookPayload<unknown>, secret: string): string {
    if (!secret) return '';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  async close(): Promise<void> {
    this.isShuttingDown = true;
    
    // Aguarda todos os processos em andamento terminarem
    while (this.activeProcesses.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Limpa a fila
    this.queue = [];
  }
}

// Singleton
let queueService: InMemoryQueueService;

export function getQueueService(): InMemoryQueueService {
  if (!queueService) {
    queueService = new InMemoryQueueService();
  }
  return queueService;
}