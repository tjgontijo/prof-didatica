/**
 * Utilitário para armazenamento local de eventos de teste A/B
 */

// Tipos
export interface AbTestEvent {
  testId: string;
  variantId: string;
  eventType: string;
  timestamp: number;
  additionalData?: Record<string, unknown>;
}

// Chaves de armazenamento
const STORAGE_KEYS = {
  EVENTS: 'ab_test_events',
  LAST_CLICK: 'ab_test_last_click',
};

/**
 * Salva um evento de teste A/B no armazenamento local
 */
export function saveAbTestEvent(event: AbTestEvent): void {
  try {
    // Obter eventos existentes
    const events = getAbTestEvents();
    
    // Adicionar novo evento
    events.push(event);
    
    // Salvar eventos atualizados
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (error) {
    console.error('Erro ao salvar evento de teste A/B:', error);
  }
}

/**
 * Obtém todos os eventos de teste A/B do armazenamento local
 */
export function getAbTestEvents(): AbTestEvent[] {
  try {
    const eventsJson = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return eventsJson ? JSON.parse(eventsJson) : [];
  } catch (error) {
    console.error('Erro ao obter eventos de teste A/B:', error);
    return [];
  }
}

/**
 * Salva o timestamp do último clique para um teste específico
 */
export function saveLastClick(testId: string, timestamp: number): void {
  try {
    const lastClicksJson = localStorage.getItem(STORAGE_KEYS.LAST_CLICK);
    const lastClicks = lastClicksJson ? JSON.parse(lastClicksJson) : {};
    
    lastClicks[testId] = timestamp;
    
    localStorage.setItem(STORAGE_KEYS.LAST_CLICK, JSON.stringify(lastClicks));
  } catch (error) {
    console.error('Erro ao salvar último clique:', error);
  }
}

/**
 * Obtém o timestamp do último clique para um teste específico
 */
export function getLastClick(testId: string): number {
  try {
    const lastClicksJson = localStorage.getItem(STORAGE_KEYS.LAST_CLICK);
    const lastClicks = lastClicksJson ? JSON.parse(lastClicksJson) : {};
    
    return lastClicks[testId] || 0;
  } catch (error) {
    console.error('Erro ao obter último clique:', error);
    return 0;
  }
}

/**
 * Verifica se um clique recente foi registrado para um teste específico
 */
export function hasRecentClick(testId: string, timeWindow: number = 5000): boolean {
  const lastClick = getLastClick(testId);
  const now = Date.now();
  
  return now - lastClick < timeWindow;
}
