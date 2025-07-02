import { GeoData } from '../types';
import * as Storage from './storage';

// Constante para o tempo de expiração do cache (24 horas em milissegundos)
export const GEO_CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Tipos para as respostas das APIs
type IpApiResponse = {
  status: string;
  country: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
};

type IpWhoResponse = {
  success: boolean;
  country: string;
  region: string;
  city: string;
  postal: string;
  latitude: number;
  longitude: number;
};

/**
 * Busca o IP público do usuário
 * @returns IP público ou string vazia em caso de falha
 */
export async function fetchPublicIp(): Promise<string> {
  try {
    // Verificar primeiro se já temos o IP armazenado
    const storedGeoData = Storage.getStoredGeoData();
    if (storedGeoData?.ip) {
      return storedGeoData.ip;
    }
    
    // Se não temos, buscar da API
    const res = await fetch('https://api.ipify.org?format=json');
    const { ip } = await res.json() as { ip: string };
    return ip;
  } catch (error) {
    console.error('Erro ao buscar IP público:', error);
    return '';
  }
}

/**
 * Obtém dados de geolocalização do armazenamento local
 * @returns Objeto com dados de geolocalização ou null se não existir ou estiver expirado
 */
export function getStoredGeoData(): GeoData | null {
  return Storage.getStoredGeoData();
}

/**
 * Obtém dados de geolocalização a partir de um IP
 * @param ip Endereço IP para geolocalização
 * @returns Dados de geolocalização ou null em caso de falha
 */
export async function getGeoFromIp(ip: string): Promise<GeoData | null> {
  const timeoutMs = 1500;
  
  const withTimeout = async (promise: Promise<Response>): Promise<Response | null> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await promise;
      clearTimeout(id);
      return res;
    } catch {
      return null;
    }
  };

  // Tentativa 1 - ip-api.com
  const ipApi = await withTimeout(
    fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,zip,lat,lon`)
  );

  if (ipApi?.ok) {
    const data = await ipApi.json() as IpApiResponse;
    if (data.status === 'success') {
      return {
        country: data.country,
        country_code: data.country,
        region: data.regionName,
        city: data.city,
        postal: data.zip,
        latitude: data.lat,
        longitude: data.lon,
        ip,
        timestamp: Date.now() // Adicionar timestamp para controle de expiração
      };
    }
  }

  // Fallback - ipwho.is
  const ipWho = await withTimeout(fetch(`https://ipwho.is/${ip}`));
  if (ipWho?.ok) {
    const data = await ipWho.json() as IpWhoResponse;
    if (data.success) {
      return {
        country: data.country,
        country_code: data.country,
        region: data.region,
        city: data.city,
        postal: data.postal,
        latitude: data.latitude,
        longitude: data.longitude,
        ip,
        timestamp: Date.now() // Adicionar timestamp para controle de expiração
      };
    }
  }

  // Segundo fallback - geolocation-db.com
  try {
    const backupGeoResponse = await fetch('https://geolocation-db.com/json/');
    const backupGeoData = await backupGeoResponse.json();
    
    if (backupGeoData && backupGeoData.country_code) {
      return {
        city: backupGeoData.city,
        region: backupGeoData.state,
        postal: backupGeoData.postal,
        country: backupGeoData.country_name,
        country_code: backupGeoData.country_code,
        ip,
        timestamp: Date.now() // Adicionar timestamp para controle de expiração
      };
    }
  } catch (error) {
    console.error('Erro ao buscar dados de geolocalização de backup:', error);
  }

  return null;
}
