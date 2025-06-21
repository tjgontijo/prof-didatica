export const initialWebhooks = [
  {
    url: 'https://webhook.elev8.com.br/webhook/e6488ffd-004e-4e94-ae87-d4fc1c0b35b5',
    events: ['order.created'],
    description: 'Webhook para o n8n - Evento de pedido criado',
    active: true
  },
  {
    url: 'https://webhook.elev8.com.br/webhook/e6488ffd-004e-4e94-ae87-d4fc1c0b35b5',
    events: ['order.paid'],
    description: 'Webhook para o n8n - Evento de pedido pago',
    active: true
  }
];