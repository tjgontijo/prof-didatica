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
  console.log('[SERVER] trackServerEvent iniciado:', { 
    evento: payload.event_name, 
    eventId: payload.event_id, 
    trackingId 
  });
  try {
    console.log('[SERVER] Registrando evento no banco:', payload.event_name);
    // Registrar o evento no banco de dados
    const event = await prisma.trackingEvent.create({
      data: {
        trackingSessionId: trackingId,
        eventName: payload.event_name,
        eventId: payload.event_id,
        payload: payload.custom_data ? JSON.parse(JSON.stringify(payload.custom_data)) : {},
        status: 'queued'
      }
    });
    
    console.log('[SERVER] Evento registrado com sucesso:', event.id);
    
    // Enviar para o Meta CAPI
    try {
      console.log('[SERVER] Enviando para Meta CAPI:', payload.event_name);
      const response = await sendToMetaCAPI(payload);
      
      // Atualizar o evento com o resultado
      await prisma.trackingEvent.update({
        where: { id: event.id },
        data: {
          status: 'success',
          response: response ? JSON.parse(JSON.stringify(response)) : {}
        }
      });
      
      console.log('[SERVER] Resposta do Meta CAPI:', response);
      return response;
    } catch (error) {
      console.error('Erro ao enviar para Meta CAPI:', error);
      
      // Atualizar o evento com o erro
      await prisma.trackingEvent.update({
        where: { id: event.id },
        data: {
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        }
      });
      
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
  console.log('[META CAPI] Iniciando envio para Meta:', payload.event_name);
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
