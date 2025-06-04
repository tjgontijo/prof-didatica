// src/services/webhook/core/queue.service.ts
import Bull, { Queue, Job } from 'bull';
import * as crypto from 'crypto';
import { EventEmitter } from 'events';
import { 
  QueueService, 
  WebhookWithSecret, 
  WebhookPayload, 
  WebhookJob, 
  QueueOptions, 
  JobStatus,
  WebhookResponse
} from './types';
import { getWebhookConfig } from '../config/webhook.config';
import { PrismaClient } from '@prisma/client';

export class UnifiedQueueService implements QueueService {
  private bullQueue?: Queue;
  private inMemoryQueue: WebhookJob<unknown>[] = [];
  private activeJobs = new Map<string, Promise<void>>();
  private eventEmitter = new EventEmitter();
  private isProcessing = false;
  private config = getWebhookConfig();
  private useBull: boolean;

  constructor(
    private prisma: PrismaClient,
    useBull: boolean = process.env.NODE_ENV === 'production'
  ) {
    this.useBull = useBull;
    
    if (this.useBull) {
      this.initializeBullQueue();
    } else {
      this.initializeInMemoryQueue();
    }
  }

  private initializeBullQueue(): void {
    try {
      this.bullQueue = new Bull('webhook-queue', {
        redis: this.config.queue.redis,
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 50,
          attempts: this.config.queue.maxRetries,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      });

      this.bullQueue.process('webhook', this.config.queue.maxConcurrent, this.processBullJob.bind(this));
      
      this.bullQueue.on('error', (error) => {
        console.error('Bull Queue Error:', error);
      });

      console.log('Bull Queue initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize Bull Queue, falling back to in-memory:', error);
      this.useBull = false;
      this.initializeInMemoryQueue();
    }
  }

  private initializeInMemoryQueue(): void {
    this.eventEmitter.on('jobAdded', () => this.processInMemoryQueue());
    console.log('In-Memory Queue initialized');
  }

  async addToQueue<T>(
    webhook: WebhookWithSecret,
    payload: WebhookPayload<T>,
    options: QueueOptions = {}
  ): Promise<string> {
    const jobId = crypto.randomUUID();
    
    if (this.useBull && this.bullQueue) {
      const job = await this.bullQueue.add('webhook', 
        { webhook, payload },
        {
          delay: options.delay || 0,
          attempts: options.attempts || this.config.queue.maxRetries,
          removeOnComplete: options.removeOnComplete ?? true,
          jobId,
        }
      );
      return job.id.toString();
    } else {
      const job: WebhookJob<T> = {
        id: jobId,
        webhook,
        payload,
        attempts: 0,
        maxAttempts: options.attempts || this.config.queue.maxRetries,
        scheduledFor: options.delay ? new Date(Date.now() + options.delay) : undefined,
      };

      if (options.delay) {
        setTimeout(() => {
          this.inMemoryQueue.push(job);
          this.eventEmitter.emit('jobAdded');
        }, options.delay);
      } else {
        this.inMemoryQueue.push(job);
        this.eventEmitter.emit('jobAdded');
      }

      return jobId;
    }
  }

  async cancelJob(jobId: string): Promise<boolean> {
    if (this.useBull && this.bullQueue) {
      try {
        const job = await this.bullQueue.getJob(jobId);
        if (job) {
          await job.remove();
          return true;
        }
      } catch (error) {
        console.error('Error canceling Bull job:', error);
      }
    } else {
      const index = this.inMemoryQueue.findIndex(job => job.id === jobId);
      if (index !== -1) {
        this.inMemoryQueue.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  async getJobStatus(jobId: string): Promise<JobStatus | null> {
    if (this.useBull && this.bullQueue) {
      try {
        const job = await this.bullQueue.getJob(jobId);
        if (!job) return null;

        const state = await job.getState();
        return {
          id: job.id.toString(),
          status: state as JobStatus['status'],
          attempts: job.attemptsMade,
          maxAttempts: job.opts.attempts || this.config.queue.maxRetries,
          error: job.failedReason,
          completedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
          failedAt: job.failedReason ? new Date(job.processedOn || Date.now()) : undefined,
        };
      } catch (error) {
        console.error('Error getting Bull job status:', error);
      }
    } else {
      const job = this.inMemoryQueue.find(j => j.id === jobId);
      if (job) {
        return {
          id: job.id,
          status: 'waiting',
          attempts: job.attempts,
          maxAttempts: job.maxAttempts,
        };
      }
    }
    return null;
  }

  private async processBullJob(job: Job): Promise<void> {
    const { webhook, payload } = job.data;
    await this.executeWebhook(webhook, payload, job.attemptsMade);
  }

  private async processInMemoryQueue(): Promise<void> {
    if (this.isProcessing || this.activeJobs.size >= this.config.queue.maxConcurrent) {
      return;
    }

    this.isProcessing = true;

    while (this.inMemoryQueue.length > 0 && this.activeJobs.size < this.config.queue.maxConcurrent) {
      const job = this.inMemoryQueue.shift();
      if (!job) continue;

      // Verifica se o job está agendado para o futuro
      if (job.scheduledFor && job.scheduledFor > new Date()) {
        this.inMemoryQueue.push(job); // Recoloca na fila
        continue;
      }

      const processPromise = this.executeWebhook(job.webhook, job.payload, job.attempts)
        .catch(async (error) => {
          console.error(`Error processing webhook job ${job.id}:`, error);
          
          if (job.attempts < job.maxAttempts) {
            job.attempts++;
            const delay = this.config.queue.retryDelays[
              Math.min(job.attempts - 1, this.config.queue.retryDelays.length - 1)
            ];
            
            setTimeout(() => {
              this.inMemoryQueue.push(job);
              this.eventEmitter.emit('jobAdded');
            }, delay);
          } else {
            await this.logWebhookFailure(job.webhook.id, job.payload, error);
          }
        })
        .finally(() => {
          this.activeJobs.delete(job.id);
          if (this.activeJobs.size === 0) {
            this.isProcessing = false;
            if (this.inMemoryQueue.length > 0) {
              this.processInMemoryQueue();
            }
          }
        });

      this.activeJobs.set(job.id, processPromise);
    }

    this.isProcessing = false;
  }

  private async executeWebhook<T>(
    webhook: WebhookWithSecret,
    payload: WebhookPayload<T>,
    attempt: number = 0
  ): Promise<void> {
    const signature = this.generateSignature(payload, webhook.secret || '');
    
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': this.config.http.userAgent,
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': payload.event,
          'X-Webhook-Delivery': crypto.randomUUID(),
          'X-Webhook-Attempt': (attempt + 1).toString(),
          ...webhook.headers,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.config.http.timeout),
      });

      const responseData: WebhookResponse = {
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
      };

      if (!response.ok) {
        responseData.error = `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(responseData.error);
      }

      await this.logWebhookSuccess(webhook.id, payload, responseData);
      console.log(`Webhook delivered successfully to ${webhook.url} for event ${payload.event}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.logWebhookFailure(webhook.id, payload, errorMessage);
      throw error;
    }
  }

  private generateSignature<T>(payload: WebhookPayload<T>, secret: string): string {
    if (!secret) return '';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return `sha256=${hmac.digest('hex')}`;
  }

  private async logWebhookSuccess<T>(
    webhookId: string,
    payload: WebhookPayload<T>,
    response: WebhookResponse
  ): Promise<void> {
    try {
      await this.prisma.webhookLog.create({
        data: {
          webhookId,
          event: payload.event,
          payload: JSON.stringify(payload),
          response: JSON.stringify(response),
          statusCode: response.status ?? null,
          success: true,
        },
      });
    } catch (error) {
      console.error('Error logging webhook success:', error);
    }
  }

  private async logWebhookFailure<T>(
    webhookId: string,
    payload: WebhookPayload<T>,
    error: string
  ): Promise<void> {
    try {
      await this.prisma.webhookLog.create({
        data: {
          webhookId,
          event: payload.event,
          payload: JSON.stringify(payload),
          response: JSON.stringify({ error }),
          statusCode: null,
          success: false,
        },
      });
    } catch (logError) {
      console.error('Error logging webhook failure:', logError);
    }
  }

  async close(): Promise<void> {
    if (this.bullQueue) {
      await this.bullQueue.close();
    }
    
    // Aguarda jobs em memória terminarem
    while (this.activeJobs.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.inMemoryQueue = [];
  }
}

// Singleton instance
let queueService: UnifiedQueueService | null = null;

export function getQueueService(prisma: PrismaClient): UnifiedQueueService {
  if (!queueService) {
    queueService = new UnifiedQueueService(prisma);
  }
  return queueService;
}
