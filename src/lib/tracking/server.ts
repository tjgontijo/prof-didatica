// src/lib/tracking/server.ts
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

interface MetaEventPayload {
  event_name: string;
  event_id: string;
  event_time: number;
  event_source_url?: string;
  action_source: string;
  user_data?: Record<string, string | undefined>;
  custom_data?: Record<string, unknown>;
}

interface MetaApiResponse {
  events_received?: number;
  messages?: string[];
  fbtrace_id?: string;
  error?: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
  };
}

/**
 * Envia um evento para o Meta CAPI diretamente do servidor
 * @param payload Dados do evento a ser enviado
 * @param trackingId ID da sessão de rastreamento
 */
export async function trackServerEvent(payload: MetaEventPayload, trackingId: string): Promise<MetaApiResponse> {
  try {
    // Registrar o evento no banco de dados usando SQL direto para evitar problemas de tipagem
    const result = await prisma.$queryRaw<Array<{id: string}>>`
      INSERT INTO "TrackingEvent" ("id", "trackingSessionId", "eventName", "eventId", "payload", "status")
      VALUES (gen_random_uuid(), ${trackingId}, ${payload.event_name}, ${payload.event_id}, ${JSON.stringify(payload.custom_data || {})}::jsonb, 'queued')
      RETURNING "id"
    `;
    
    const eventId = result[0]?.id;
    
    // Enviar para o Meta CAPI
    try {
      const response = await sendToMetaCAPI(payload);
      
      // Atualizar o evento com o resultado
      await prisma.$executeRaw`
        UPDATE "TrackingEvent"
        SET "status" = 'success', "response" = ${JSON.stringify(response || {})}::jsonb
        WHERE "id" = ${eventId}
      `;
      
      return response;
    } catch (error) {
      console.error('Erro ao enviar para Meta CAPI:', error);
      
      // Atualizar o evento com o erro
      await prisma.$executeRaw`
        UPDATE "TrackingEvent"
        SET "status" = 'error', "error" = ${error instanceof Error ? error.message : String(error)}
        WHERE "id" = ${eventId}
      `;
      
      throw error;
    }
  } catch (error) {
    console.error('Erro ao processar evento de rastreamento no servidor:', error);
    throw error;
  }
}

/**
 * Envia dados para o Meta CAPI
 * @param payload Payload do evento
 * @returns Resposta da API
 */
async function sendToMetaCAPI(payload: MetaEventPayload): Promise<MetaApiResponse> {
  if (!process.env.META_PIXEL_ID || !process.env.META_CAPI_TOKEN) {
    throw new Error('Configurações do Meta CAPI não definidas');
  }
  
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_TOKEN;
  
  const url = `https://graph.facebook.com/v23.0/${pixelId}/events?access_token=${accessToken}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      data: [payload]
    })
  });
  
  if (!response.ok) {
    throw new Error(`Erro ao enviar para Meta CAPI: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Função de utilidade para hash SHA-256 de dados sensíveis
 * @param input String a ser hasheada
 * @returns String hasheada ou undefined se input for falsy
 */
export function hashData(input: string | undefined | null): string | undefined {
  if (!input) return undefined;
  return crypto.createHash('sha256').update(input.toLowerCase()).digest('hex');
}
