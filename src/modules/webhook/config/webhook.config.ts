// src/services/webhook/config/webhook.config.ts

export interface WebhookConfig {
  queue: {
    redis: {
      host: string;
      port: number;
    };
    maxConcurrent: number;
    maxRetries: number;
    retryDelays: number[];
    defaultDelay: number;
  };
  http: {
    timeout: number;
    userAgent: string;
  };
  events: {
    ORDER_CREATED: string;
    ORDER_PAID: string;
    CART_REMINDER: string;
  };
}

export const DEFAULT_WEBHOOK_CONFIG: WebhookConfig = {
  queue: {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    },
    maxConcurrent: 5,
    maxRetries: 3,
    retryDelays: [5000, 15000, 30000], // 5s, 15s, 30s
    defaultDelay: process.env.NODE_ENV === 'development' ? 10 * 1000 : 100 * 1000, // 10s em dev, 100s em prod
  },
  http: {
    timeout: 10000, // 10s
    userAgent: 'Prof-Didatica-Webhook/1.0',
  },
  events: {
    ORDER_CREATED: 'order.created',
    ORDER_PAID: 'order.paid',
    CART_REMINDER: 'cart.reminder',
  },
};

export function getWebhookConfig(): WebhookConfig {
  return DEFAULT_WEBHOOK_CONFIG;
}
