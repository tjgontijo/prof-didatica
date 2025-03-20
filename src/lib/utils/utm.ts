/**
 * Utilitário para gerenciar parâmetros UTM e sessões
 */

import { v4 as uuidv4 } from 'uuid';

// Chaves para armazenamento local
const SESSION_ID_KEY = 'ab_test_session_id';
const UTM_PARAMS_KEY = 'utm_params';
const FAILED_EVENTS_KEY = 'ab_test_failed_events';

// Interface para dados de eventos
export interface AbTestEventData {
  testId: string;
  variantId: string;
  eventType: string;
  url?: string;
  
  // Dados de localização
  country?: string;
  state?: string;
  city?: string;
  
  // Dados de UTM
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  
  // Dados adicionais
  [key: string]: unknown;
}

// Interface para eventos falhos
export interface FailedEvent {
  eventData: AbTestEventData;
  timestamp: number;
  retryCount: number;
}

/**
 * Gera ou recupera um ID de sessão
 */
export function getSessionId(): string {
  const existingSessionId = localStorage.getItem(SESSION_ID_KEY);
  
  if (existingSessionId) {
    return existingSessionId;
  }
  
  const newSessionId = uuidv4();
  localStorage.setItem(SESSION_ID_KEY, newSessionId);
  return newSessionId;
}

/**
 * Extrai parâmetros UTM da URL atual
 */
export function extractUtmParams(): Record<string, string | undefined> {
  try {
    const url = window.location.href;
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    const utmParams = {
      utmSource: params.get('utm_source') || undefined,
      utmMedium: params.get('utm_medium') || undefined,
      utmCampaign: params.get('utm_campaign') || undefined,
      utmTerm: params.get('utm_term') || undefined,
      utmContent: params.get('utm_content') || undefined,
    };
    
    // Salvar parâmetros UTM no localStorage para uso futuro
    if (Object.values(utmParams).some(value => value !== undefined)) {
      localStorage.setItem(UTM_PARAMS_KEY, JSON.stringify(utmParams));
    }
    
    return utmParams;
  } catch (error) {
    console.error('Erro ao extrair parâmetros UTM:', error);
    return {};
  }
}

/**
 * Recupera parâmetros UTM armazenados
 */
export function getStoredUtmParams(): Record<string, string | undefined> {
  try {
    const storedParams = localStorage.getItem(UTM_PARAMS_KEY);
    return storedParams ? JSON.parse(storedParams) : {};
  } catch (error) {
    console.error('Erro ao recuperar parâmetros UTM armazenados:', error);
    return {};
  }
}

/**
 * Salva um evento que falhou para tentar novamente mais tarde
 */
export function saveFailedEvent(eventData: AbTestEventData): void {
  try {
    const failedEvents = JSON.parse(localStorage.getItem(FAILED_EVENTS_KEY) || '[]') as FailedEvent[];
    failedEvents.push({
      eventData,
      timestamp: Date.now(),
      retryCount: 0
    });
    
    localStorage.setItem(FAILED_EVENTS_KEY, JSON.stringify(failedEvents));
  } catch (error) {
    console.error('Erro ao salvar evento falho:', error);
  }
}

/**
 * Recupera eventos que falharam para tentar novamente
 */
export function getFailedEvents(): FailedEvent[] {
  try {
    return JSON.parse(localStorage.getItem(FAILED_EVENTS_KEY) || '[]') as FailedEvent[];
  } catch (error) {
    console.error('Erro ao recuperar eventos falhos:', error);
    return [];
  }
}

/**
 * Atualiza a lista de eventos falhos
 */
export function updateFailedEvents(events: FailedEvent[]): void {
  try {
    localStorage.setItem(FAILED_EVENTS_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Erro ao atualizar eventos falhos:', error);
  }
}
