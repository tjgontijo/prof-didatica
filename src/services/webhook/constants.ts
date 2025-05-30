export const WEBHOOK_EVENTS = {
    ORDER_CREATED: 'order.created',
    ORDER_PAID: 'order.paid'
  } as const;
  
  export type WebhookEventType = keyof typeof WEBHOOK_EVENTS;
  export type WebhookEventValue = typeof WEBHOOK_EVENTS[WebhookEventType];