import { TrackingSessionData, TrackingEventData } from '../types';

/**
 * Registra uma nova sessão de rastreamento no backend
 * @param data Dados da sessão a serem registrados
 * @returns ID da sessão criada
 */
export async function registerSession(data: TrackingSessionData): Promise<string> {
  try {
    const response = await fetch('/api/tracking/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao registrar sessão: ${response.status} ${response.statusText}`);
    }
    
    // Obter o ID gerado pelo backend
    const responseData = await response.json() as { id: string };
    return responseData.id;
  } catch (error) {
    console.error('Erro ao registrar sessão:', error);
    throw error;
  }
}

/**
 * Gera um ID único para eventos
 * @returns ID único no formato UUID v4
 */
function generateUniqueId(): string {
  // Implementação simples de UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Envia um evento de rastreamento para a API
 * @param data Dados do evento a ser enviado
 */
export async function sendEventToApi(data: TrackingEventData): Promise<void> {
  try {
    // Gerar ID do evento se não fornecido
    if (!data.eventId) {
      data.eventId = generateUniqueId();
    }
    
    const response = await fetch('/api/tracking/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao enviar evento: ${response.status} ${response.statusText}`);
    }
    
    console.log(`Evento ${data.eventName} enviado para API com sucesso`);
  } catch (error) {
    console.error(`Erro ao enviar evento ${data.eventName} para API:`, error);
    throw error;
  }
}
