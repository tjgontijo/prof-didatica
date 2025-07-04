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
    // Verificar se a sessão de rastreamento existe
    const sessionExists = await prisma.trackingSession.findUnique({
      where: { id: trackingId }
    });
    
    if (!sessionExists) {
      console.warn(`[SERVER] Sessão de rastreamento não encontrada: ${trackingId}`);
      return {
        error: {
          message: `Sessão de rastreamento não encontrada: ${trackingId}`,
          type: 'not_found',
          code: 404
        }
      };
    }
    
    console.log('[SERVER] Registrando evento no banco:', payload.event_name);
    // Registrar o evento no banco de dados
    let event;
    try {
      event = await prisma.trackingEvent.create({
        data: {
          trackingSessionId: trackingId,
          eventName: payload.event_name,
          eventId: payload.event_id || crypto.randomUUID(), // Garantir que sempre tenha um eventId
          payload: payload.custom_data ? JSON.parse(JSON.stringify(payload.custom_data)) : {},
          status: 'queued'
        }
      });
      
      console.log('[SERVER] Evento registrado com sucesso:', event.id);
    } catch (dbError) {
      console.error('[SERVER] Erro ao registrar evento no banco:', dbError);
      return {
        error: {
          message: dbError instanceof Error ? dbError.message : String(dbError),
          type: 'database_error',
          code: 500
        }
      };
    }
    
    // Enviar para o Meta CAPI
    console.log('[SERVER] Enviando para Meta CAPI:', payload.event_name);
    const response = await sendToMetaCAPI(payload);
    
    // Atualizar o status do evento com a resposta
    try {
      await prisma.trackingEvent.update({
        where: { id: event.id },
        data: {
          status: response.error ? 'error' : 'success',
          response: response ? JSON.parse(JSON.stringify(response)) : {},
          error: response.error ? response.error.message : null
        }
      });
      
      console.log('[SERVER] Evento atualizado com sucesso:', event.id);
    } catch (updateError) {
      console.error('[SERVER] Erro ao atualizar evento:', updateError);
      // Não interromper o fluxo se falhar ao atualizar o status
    }
    
    return response;
  } catch (error) {
    console.error('[SERVER] Erro ao processar evento de rastreamento:', error);
    
    return {
      error: {
        message: error instanceof Error ? error.message : String(error),
        type: 'server_error',
        code: 500
      }
    };
  }
}

/**
 * Envia dados para o Meta CAPI
 * @param payload Payload do evento
 * @returns Resposta da API
 */
async function sendToMetaCAPI(payload: MetaEventPayload): Promise<MetaApiResponse> {
  console.log('[META CAPI] Iniciando envio para Meta:', payload.event_name);
  
  // Log detalhado do payload para depuração
  console.log('[META CAPI] Payload completo:', JSON.stringify(payload, null, 2));
  
  // Verificar se as variáveis de ambiente estão definidas
  if (!process.env.META_PIXEL_ID || !process.env.META_CAPI_TOKEN) {
    console.warn('[META CAPI] Configurações do Meta CAPI não definidas. Evento será registrado apenas localmente.');
    // Retornar uma resposta simulada para não interromper o fluxo
    return {
      events_received: 0,
      messages: ['Configurações do Meta CAPI não definidas']
    };
  }
  
  try {
    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_CAPI_TOKEN;
    
    const url = `https://graph.facebook.com/v23.0/${pixelId}/events?access_token=${accessToken}`;
    
    // Remover campos undefined ou null do payload para evitar erros
    const cleanPayload = JSON.parse(JSON.stringify(payload));
    
    // Verificar campos obrigatórios para o evento Purchase
    if (cleanPayload.event_name === 'Purchase') {
      if (!cleanPayload.custom_data?.value) {
        console.warn('[META CAPI] Evento Purchase sem valor definido. Isso causará erro 400.');
      }
      
      // Garantir que action_source esteja definido
      if (!cleanPayload.action_source) {
        cleanPayload.action_source = 'website';
        console.warn('[META CAPI] action_source não definido, definindo como "website"');
      }
    }
    
    const requestBody = JSON.stringify({
      data: [cleanPayload]
    });
    
    console.log('[META CAPI] Enviando request para Meta:', requestBody);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: requestBody
    });
    
    const responseData = await response.text();
    let parsedResponse;
    
    try {
      parsedResponse = JSON.parse(responseData);
    } catch {
      // Erro ao parsear a resposta JSON
      console.error('[META CAPI] Erro ao parsear resposta:', responseData);
      parsedResponse = { error: { message: 'Erro ao parsear resposta', type: 'parse_error', code: 500 } };
    }
    
    if (!response.ok) {
      console.error(`[META CAPI] Erro na resposta: ${response.status} ${response.statusText}`, responseData);
      
      // Extrair detalhes do erro da resposta da Meta
      if (parsedResponse && parsedResponse.error) {
        return {
          error: {
            message: parsedResponse.error.message || `Erro ${response.status}`,
            type: parsedResponse.error.type || 'api_error',
            code: parsedResponse.error.code || response.status,
            error_subcode: parsedResponse.error.error_subcode
          }
        };
      }
      
      return {
        error: {
          message: `Erro ao enviar para Meta CAPI: ${response.status} ${response.statusText}`,
          type: 'api_error',
          code: response.status
        }
      };
    }
    
    console.log('[META CAPI] Resposta da API:', responseData);
    return parsedResponse;
  } catch (error) {
    console.error('[META CAPI] Erro ao enviar evento:', error);
    // Retornar uma resposta de erro para que o sistema continue funcionando
    return {
      error: {
        message: error instanceof Error ? error.message : String(error),
        type: 'api_error',
        code: 500
      }
    };
  }
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
