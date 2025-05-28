// src/lib/sse.ts
import { randomUUID } from 'crypto';

interface SSEClient {
  id: string;
  paymentId: string;
  controller: ReadableStreamDefaultController<Uint8Array>;
  lastActivity: number;
  lastEventId: string;
}

const clients = new Map<string, SSEClient>();
const PING_INTERVAL = 45_000;      // 45 segundos
const RETRY_DELAY   = 2_000;       // 2 segundos
let pingTimerId: NodeJS.Timeout | null = null;

// envia ping e limpa inativos
function initializePing() {
  if (pingTimerId) return;
  pingTimerId = setInterval(() => {
    const now     = Date.now();
    const encoder = new TextEncoder();

    if (clients.size === 0 && pingTimerId) {
      clearInterval(pingTimerId);
      pingTimerId = null;
      return;
    }

    for (const client of clients.values()) {
      try {
        // ping se nada desde metade do intervalo
        if (now - client.lastActivity > PING_INTERVAL / 2) {
          const chunk = encoder.encode(`id: ${client.lastEventId}\n:ping\n\n`);
          client.controller.enqueue(chunk);
        }
        // remove se sem atividade por 3x o intervalo
        if (now - client.lastActivity > PING_INTERVAL * 3) {
          console.log(`SSE desconectado (inativo): ${client.id}`);
          clients.delete(client.id);
          client.controller.close();
        }
      } catch (err) {
        console.error('Erro no ping:', err);
        clients.delete(client.id);
        client.controller.close();
      }
    }
  }, PING_INTERVAL);
}

export function addClient(
  paymentId: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
  signal: AbortSignal,
  lastEventIdHeader?: string
): string {
  const clientId = randomUUID();
  const now      = Date.now();
  const lastId   = lastEventIdHeader || now.toString();

  // limpa quando o cliente dispara abort
  const onAbort = () => {
    console.log(`SSE desconectado (abort): ${clientId}`);
    clients.delete(clientId);
    controller.close();
    signal.removeEventListener('abort', onAbort);
  };
  signal.addEventListener('abort', onAbort, { once: true });

  // informa delay de retry
  controller.enqueue(new TextEncoder().encode(`retry: ${RETRY_DELAY}\n\n`));

  clients.set(clientId, {
    id: clientId,
    paymentId,
    controller,
    lastActivity: now,
    lastEventId:  lastId,
  });
  console.log(`SSE conectado: ${clientId} (paymentId=${paymentId})`);

  initializePing();
  return clientId;
}

export function sendToClient(
  paymentId: string,
  data: { type: string; [k: string]: unknown }
): { sent: number; total: number } {
  const now     = Date.now();
  const encoder = new TextEncoder();
  let sent = 0, total = 0;

  // conta quantos clientes existem
  for (const c of clients.values()) {
    if (c.paymentId === paymentId) total++;
  }
  if (total === 0) {
    console.log(`Nenhum cliente SSE para paymentId=${paymentId}`);
    return { sent: 0, total: 0 };
  }

  for (const client of clients.values()) {
    if (client.paymentId !== paymentId) continue;
    try {
      const eventId = randomUUID();
      client.lastEventId = eventId;
      const msg = `id: ${eventId}\ndata: ${JSON.stringify(data)}\n\n`;
      client.controller.enqueue(encoder.encode(msg));
      client.lastActivity = now;
      sent++;
    } catch (err) {
      console.error('Erro ao enviar SSE:', err);
      clients.delete(client.id);
    }
  }

  console.log(`Enviado para ${sent}/${total} clientes (paymentId=${paymentId})`);
  return { sent, total };
}

export function closeAllConnections() {
  console.log(`Fechando ${clients.size} conexões SSE`);
  if (pingTimerId) {
    clearInterval(pingTimerId);
    pingTimerId = null;
  }
  for (const c of clients.values()) {
    try { c.controller.close(); }
    catch (err) { console.error('Erro ao fechar SSE:', err); }
  }
  clients.clear();
}
