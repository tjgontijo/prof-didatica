import { UtmData } from '../types';
import * as Storage from './storage';

/**
 * Coleta parâmetros UTM e outros identificadores da URL atual
 * @returns Objeto contendo os parâmetros UTM encontrados
 */
export function collectUtms(): UtmData {
  if (typeof window === 'undefined') return {};
  
  const urlParams = new URLSearchParams(window.location.search);
  const utmData: UtmData = {};
  
  // Parâmetros UTM padrão
  const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  
  // Adicionar cada parâmetro UTM se existir
  for (const param of utmParams) {
    const value = urlParams.get(param);
    if (value) {
      utmData[param as keyof UtmData] = value;
    }
  }
  
  // Parâmetros adicionais
  const fbclid = urlParams.get('fbclid');
  const gclid = urlParams.get('gclid');
  
  if (fbclid) utmData.fbclid = fbclid;
  if (gclid) utmData.gclid = gclid;
  
  return utmData;
}

/**
 * Migra dados de rastreamento antigos para o novo formato
 * @returns Dados UTM do formato antigo
 */
export function migrateOldTrackingData(): UtmData {
  if (typeof window === 'undefined') return {};
  
  const migratedData: UtmData = {};
  
  try {
    // Verificar cookie antigo de UTM
    const legacyUtmCookie = localStorage.getItem('utm_data_legacy');
    if (legacyUtmCookie) {
      try {
        const legacy = JSON.parse(legacyUtmCookie);
        
        // Mapear campos antigos para novos
        if (legacy.source) migratedData.utm_source = legacy.source;
        if (legacy.medium) migratedData.utm_medium = legacy.medium;
        if (legacy.campaign) migratedData.utm_campaign = legacy.campaign;
        if (legacy.term) migratedData.utm_term = legacy.term;
        if (legacy.content) migratedData.utm_content = legacy.content;
        if (legacy.fbclid) migratedData.fbclid = legacy.fbclid;
        if (legacy.gclid) migratedData.gclid = legacy.gclid;
        
        // Remover dados antigos após migração
        localStorage.removeItem('utm_data_legacy');
        
        // Armazenar dados migrados no novo formato
        Storage.storeUtmData(migratedData as Record<string, string>);
      } catch (error) {
        console.error('Erro ao processar cookie UTM legado:', error);
      }
    }
  } catch (e) {
    console.error('Erro ao migrar dados antigos:', e);
  }
  
  return migratedData;
}

/**
 * Mescla dados UTM de várias fontes, priorizando os mais recentes
 * @returns Dados UTM combinados
 */
export function mergeUtmData(): Record<string, string> {
  // Recuperar UTMs armazenados
  const storedUtmData = Storage.getStoredUtmData();
  
  // Migrar dados antigos se necessário
  const legacyData = migrateOldTrackingData();
  
  // Coletar parâmetros UTM da URL atual
  const currentUtmData = collectUtms();
  
  // Mesclar todos os UTMs, priorizando os novos
  const allUtmData = { ...storedUtmData, ...legacyData, ...currentUtmData };
  
  // Armazenar UTMs atualizados
  Storage.storeUtmData(allUtmData);
  
  return allUtmData;
}
