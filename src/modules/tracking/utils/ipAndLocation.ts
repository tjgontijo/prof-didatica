import { GeoData } from '../types';
import * as Storage from './storage';

/**
 * Busca o IP público do usuário
 * @returns IP público ou string vazia em caso de falha
 */
export async function fetchPublicIp(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const { ip } = await res.json() as { ip: string };
    return ip;
  } catch {
    console.error('Erro ao buscar IP público:');
    return '';
  }
}

/**
 * Busca dados de geolocalização
 * @param useCache Se deve usar dados em cache, se disponíveis
 * @returns Objeto com dados de geolocalização
 */
export async function fetchGeoLocation(useCache: boolean = true): Promise<GeoData> {
  // Verificar se há dados em cache
  if (useCache) {
    const cachedData = Storage.getStoredGeoData();
    if (cachedData && cachedData.postal) {
      return cachedData as GeoData;
    }
  }
  
  // Se não há cache ou não deve usar, buscar novos dados
  try {
    const geoResponse = await fetch('https://ipapi.co/json/');
    const geoData = await geoResponse.json() as GeoData;
    
    if (geoData && !geoData.error && geoData.postal) {
      // Armazenar os dados de geolocalização para uso futuro
      Storage.storeGeoData(geoData);
      return geoData;
    }
    
    throw new Error('Dados de geolocalização inválidos ou incompletos');
  } catch {
    console.error('Erro ao buscar dados de geolocalização:');
    throw new Error('Falha ao buscar dados de geolocalização');
  }
}

/**
 * Busca dados de geolocalização com fallback para serviço alternativo
 * @returns Objeto com dados de geolocalização
 */
export async function fetchGeoLocationWithFallback(): Promise<GeoData> {
  try {
    // Tentar primeiro o serviço principal
    return await fetchGeoLocation();
  } catch {
    console.warn('Usando serviço de geolocalização alternativo...');
    
    try {
      // Tentar serviço alternativo
      const backupGeoResponse = await fetch('https://geolocation-db.com/json/');
      const backupGeoData = await backupGeoResponse.json();
      
      if (backupGeoData && backupGeoData.postal) {
        // Converter para o formato GeoData
        const geoData: GeoData = {
          city: backupGeoData.city,
          region: backupGeoData.state,
          postal: backupGeoData.postal,
          country: backupGeoData.country_code,
          country_name: backupGeoData.country_name
        };
        
        // Armazenar os dados de geolocalização para uso futuro
        Storage.storeGeoData(geoData);
        return geoData;
      }
      
      throw new Error('Dados de geolocalização de backup inválidos ou incompletos');
    } catch (backupError) {
      console.error('Erro ao buscar dados de geolocalização de backup:', backupError);
      // Retornar objeto vazio em caso de falha total
      return {
        error: true
      };
    }
  }
}
