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
    
    // Obter o ID e os dados de geolocalização gerados pelo backend
    const responseData = await response.json() as { 
      id: string;
      geoData?: {
        city?: string;
        region?: string;
        postal?: string;
        country?: string;
        latitude?: number;
        longitude?: number;
      }
    };
    
    // Se o backend retornou dados de geolocalização, armazená-los
    if (responseData.geoData) {
      const { city, region, postal, country, latitude, longitude } = responseData.geoData;
      
      // Importar dinamicamente para evitar dependências cíclicas
      const Storage = await import('../utils/storage');
      
      // Armazenar os dados de geolocalização
      Storage.storeGeoData({
        city,
        region,
        postal,
        country,
        latitude,
        longitude,
        ip: data.ip
      });
    }
    
    return responseData.id;
  } catch (error) {
    console.error('Erro ao registrar sessão:', error);
    throw error;
  }
}

// Removida função generateUniqueId pois o Prisma já gera IDs automaticamente

/**
 * Envia um evento de rastreamento para a API
 * @param data Dados do evento a ser enviado
 * @returns O ID do evento gerado pelo backend
 */
export async function sendEventToApi(data: TrackingEventData): Promise<{ eventId: string }> {
  try {
    // Não precisamos mais gerar ID manualmente, o backend/Prisma irá gerar automaticamente
    // Removemos a geração de eventId aqui, pois o Prisma já gera um CUID por padrão
    
    const response = await fetch('/api/tracking/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao enviar evento: ${response.status} ${response.statusText}`);
    }
    
    // Obter o ID do evento gerado pelo backend
    const responseData = await response.json();
    console.log(`Evento ${data.eventName} enviado para API com sucesso, ID: ${responseData.eventId}`);
    
    return { eventId: responseData.eventId };
  } catch (error) {
    console.error(`Erro ao enviar evento ${data.eventName} para API:`, error);
    throw error;
  }
}
