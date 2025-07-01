# Sistema de Webhooks Refatorado

## Visão Geral

Este sistema de webhooks foi completamente refatorado para melhorar a manutenibilidade, corrigir bugs críticos e implementar tipagem forte em todo o código.

## Estrutura do Projeto

```
src/services/webhook/
├── config/
│   └── webhook.config.ts          # Configurações centralizadas
├── core/
│   ├── types.ts                   # Tipos principais e schemas de validação
│   ├── queue.service.ts           # Serviço unificado de fila (Bull + InMemory)
│   └── webhook.service.ts         # Serviço principal de webhooks
├── events/
│   ├── order-created.event.ts     # Handler para evento order.created
│   ├── order-paid.event.ts        # Handler para evento order.paid
│   └── cart-reminder.event.ts     # Handler para evento cart.reminder
├── index.ts                       # Orquestrador principal e exports
└── README.md                      # Esta documentação
```

## Principais Melhorias

### 🐛 Bugs Corrigidos

- **Status ABANDONED_CART**: Corrigido uso de status inexistente no enum
- **Singleton Pattern**: Implementação correta para evitar vazamentos de memória
- **Type Assertions**: Substituídas por tipagem forte e validação com Zod
- **Tratamento de Erros**: Implementado tratamento robusto em todas as operações

### 🔧 Arquitetura

- **Centralização**: Configurações unificadas em `webhook.config.ts`
- **Tipagem Forte**: Todos os tipos definidos e validados com Zod
- **Serviço Unificado**: Queue service que suporta Bull e InMemory
- **Separação de Responsabilidades**: Cada evento tem seu próprio handler

### 🚀 Funcionalidades

- **Retry Automático**: Configurável por evento
- **Logging Detalhado**: Sucesso e falha de todos os webhooks
- **Assinatura HMAC**: Segurança dos payloads
- **Cancelamento de Jobs**: Para cart reminders
- **Estatísticas**: Métricas de performance dos webhooks

## Como Usar

### Inicialização

```typescript
import { getWebhookOrchestrator } from '@/services/webhook';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const webhookOrchestrator = getWebhookOrchestrator(prisma);
```

### Eventos de Pedido

```typescript
// Quando um pedido é criado
await webhookOrchestrator.processOrderCreated(orderId);

// Quando um pedido é pago
await webhookOrchestrator.processOrderPaid(orderId);

// Agendar cart reminder
const jobId = await webhookOrchestrator.scheduleCartReminder(orderId);

// Cancelar cart reminder (quando usuário inicia pagamento)
await webhookOrchestrator.cancelCartReminder(jobId);
```

### Monitoramento

```typescript
// Estatísticas gerais
const stats = await webhookOrchestrator.getWebhookStats();

// Logs de um webhook específico
const logs = await webhookOrchestrator.getWebhookLogs({
  webhookId: 'cuid-do-webhook',
  limit: 50,
});
```

## Configuração

### Variáveis de Ambiente

```env
# Redis (para Bull Queue)
REDIS_HOST=localhost
REDIS_PORT=6379

# Webhook Settings
WEBHOOK_TIMEOUT=30000
WEBHOOK_MAX_RETRIES=3
CART_REMINDER_DELAY=100
```

### Configuração de Webhooks no Banco

```sql
-- Exemplo de webhook no banco
INSERT INTO "Webhook" (id, url, events, secret, active) VALUES (
  gen_random_cuid(),
  'https://seu-endpoint.com/webhook',
  ARRAY['order.created', 'order.paid', 'cart.reminder'],
  'seu-secret-hmac',
  true
);
```

## Eventos Suportados

### order.created

Disparado quando um pedido é criado (status DRAFT).

**Payload:**

```typescript
{
  event: 'order.created',
  data: {
    id: string,
    checkoutId: string,
    customer: CustomerData,
    items: OrderItemData[],
    status: OrderStatus,
    totalItems: number,
    totalValue: number,
    createdAt: string,
    updatedAt: string
  }
}
```

### order.paid

Disparado quando um pedido é pago (status PAID).

**Payload:** Mesmo que `order.created` + campos de pagamento:

```typescript
{
  paymentId: string,
  paidAt: string,
  paymentMethod: string
}
```

### cart.reminder

Disparado após delay configurado se pedido ainda estiver em DRAFT.

**Payload:**

```typescript
{
  event: 'cart.reminder',
  data: {
    orderId: string,
    customer: CustomerData,
    items: OrderItemData[],
    createdAt: string,
    updatedAt: string
  }
}
```

## Segurança

Todos os webhooks são assinados com HMAC-SHA256 usando o secret configurado no banco de dados. O header `X-Webhook-Signature` contém a assinatura.

**Verificação no endpoint:**

```typescript
const signature = req.headers['x-webhook-signature'];
const expectedSignature = crypto
  .createHmac('sha256', webhookSecret)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (signature !== expectedSignature) {
  throw new Error('Assinatura inválida');
}
```

## Logs e Monitoramento

O sistema registra todos os webhooks enviados na tabela `WebhookLog` com:

- Payload enviado
- Resposta recebida
- Status code
- Sucesso/falha
- Timestamp

## Testes

Para resetar o singleton em testes:

```typescript
import { resetWebhookOrchestrator } from '@/services/webhook';

beforeEach(() => {
  resetWebhookOrchestrator();
});
```

## Migração do Sistema Antigo

1. **Substitua imports**:

   - `WebhookService` → `WebhookOrchestrator`
   - `WebhookDispatcher` → Use métodos do orquestrador

2. **Atualize chamadas**:

   ```typescript
   // Antes
   await webhookService.dispatchEvent({ event: 'order.created', data });

   // Depois
   await webhookOrchestrator.processOrderCreated(orderId);
   ```

3. **Configure variáveis de ambiente** conforme documentado acima.

## Próximos Passos

- [ ] Implementar testes unitários
- [ ] Adicionar métricas de performance
- [ ] Implementar webhook de retry manual
- [ ] Dashboard de monitoramento
