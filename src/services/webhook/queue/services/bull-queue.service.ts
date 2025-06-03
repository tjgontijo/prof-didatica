import Bull, { Queue, Job } from 'bull';
import { QueueService, WebhookPayload } from '../types';
import { PrismaClient } from '@prisma/client';

export class BullQueueService implements QueueService {
  private queue: Queue;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.queue = new Bull('cart-reminder-queue', {
      redis: { host: process.env.REDIS_HOST || 'localhost', port: Number(process.env.REDIS_PORT) || 6379 }
    });
  }

  async addToQueue<T>(
    webhook: {
      id: string;
      url: string;
      headers: Record<string, string>;
    },
    payload: WebhookPayload<T>
  ): Promise<void> {
    await this.queue.add('cart-reminder', { webhook, payload }, { delay: 100 * 1000, removeOnComplete: true, attempts: 3 });
  }

  async close(): Promise<void> {
    await this.queue.close();
  }

  processCartReminder(processor: (job: Job) => Promise<void>) {
    this.queue.process('cart-reminder', processor);
  }
}

export let bullQueueService: BullQueueService;
export function getBullQueueService(prisma: PrismaClient) {
  if (!bullQueueService) {
    bullQueueService = new BullQueueService(prisma);
  }
  return bullQueueService;
}
