import { getSessionId, getStoredUtmParams, saveFailedEvent, getFailedEvents, updateFailedEvents, AbTestEventData } from '../utils/utm';
import { saveEventToDatabaseAction, getVariantDistributionAction } from './abTestServer';

/**
 * Salva um evento de teste A/B no banco de dados
 */
export async function saveEventToDatabase(eventData: AbTestEventData): Promise<void> {
  try {
    console.log(`Iniciando salvamento do evento ${eventData.eventType} no banco de dados`);
    
    // Verificar se temos os IDs necessários
    if (!eventData.testId || !eventData.variantId) {
      console.error('Erro: testId ou variantId não fornecidos', { testId: eventData.testId, variantId: eventData.variantId });
      return;
    }
    
    // Obter ID de sessão
    const sessionId = getSessionId();
    console.log(`ID de sessão: ${sessionId}`);
    
    // Obter parâmetros UTM armazenados se não fornecidos no evento
    const storedUtmParams = getStoredUtmParams();
    
    // Preparar dados para a Server Action
    const serverData = {
      testId: eventData.testId,
      variantId: eventData.variantId,
      eventType: eventData.eventType,
      sessionId: sessionId,
      url: eventData.url || window.location.href,
      
      // Dados de localização
      country: eventData.country,
      state: eventData.state,
      city: eventData.city,
      
      // Dados de UTM - usar os fornecidos no evento ou os armazenados
      utmSource: eventData.utmSource || storedUtmParams.utmSource,
      utmMedium: eventData.utmMedium || storedUtmParams.utmMedium,
      utmCampaign: eventData.utmCampaign || storedUtmParams.utmCampaign,
      utmTerm: eventData.utmTerm || storedUtmParams.utmTerm,
      utmContent: eventData.utmContent || storedUtmParams.utmContent,
    };
    
    console.log('Dados preparados para Server Action:', serverData);
    
    // Chamar a Server Action para salvar no banco de dados
    const result = await saveEventToDatabaseAction(serverData);
    
    if (result.success) {
      console.log(`Evento ${eventData.eventType} salvo no banco de dados com sucesso`);
    } else {
      console.error(`Erro ao salvar evento: ${result.error}`);
      // Não lançar erro, apenas registrar e salvar para retry
      saveFailedEvent(eventData);
    }
  } catch (error) {
    console.error('Erro ao salvar evento no banco de dados:', error);
    // Implementar retry aqui
    saveFailedEvent(eventData);
  }
}

/**
 * Processa eventos que falharam anteriormente
 */
export function processFailedEvents(): void {
  const failedEvents = getFailedEvents();
  
  if (failedEvents.length === 0) {
    return;
  }
  
  // Processar apenas o primeiro evento para evitar sobrecarga
  const event = failedEvents.shift();
  if (!event) return;
  
  // Incrementar contador de tentativas
  event.retryCount += 1;
  
  // Se já tentou mais de 5 vezes, desistir deste evento
  if (event.retryCount > 5) {
    updateFailedEvents(failedEvents);
    
    // Agendar o próximo processamento se houver mais eventos
    if (failedEvents.length > 0) {
      setTimeout(processFailedEvents, 5000);
    }
    return;
  }
  
  // Tentar salvar novamente
  saveEventToDatabase(event.eventData)
    .then(() => {
      // Evento salvo com sucesso, atualizar a lista
      updateFailedEvents(failedEvents);
      
      // Agendar o próximo processamento se houver mais eventos
      if (failedEvents.length > 0) {
        setTimeout(processFailedEvents, 5000);
      }
    })
    .catch(() => {
      // Falha ao salvar, colocar de volta na lista
      failedEvents.push(event);
      updateFailedEvents(failedEvents);
      
      // Agendar o próximo processamento com um tempo de espera maior
      setTimeout(processFailedEvents, 10000);
    });
}

/**
 * Obtém a distribuição atual das variantes para um teste
 */
export async function getVariantDistribution(testId: string) {
  try {
    return await getVariantDistributionAction(testId);
  } catch (error) {
    console.error('Erro ao obter distribuição de variantes:', error);
    return { success: false, error: 'Erro ao obter distribuição de variantes' };
  }
}
