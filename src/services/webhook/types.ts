import { Webhook, WebhookLog } from '@prisma/client';

/**
 * Tipos para injeção de dependências no WebhookDispatcher
 */
export interface WebhookDispatcherParams {
  prisma: {
    webhook: {
      findMany: (args: {
        where: {
          active: boolean;
          events: { has: string };
        };
      }) => Promise<Webhook[]>;
    };
    webhookLog: {
      create: (args: {
        data: {
          webhookId: string;
          event: string;
          payload: string;
          response: string | null;
          statusCode: number | null;
          success: boolean;
        };
      }) => Promise<WebhookLog>;
    };
  };
}