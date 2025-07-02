import { CustomerData, GeoData } from '../types';

/**
 * Interface para o objeto unificado de rastreamento
 */
interface TrackingData {
  // Identificador único da sessão
  tracking_id?: string;
  
  // Dados do navegador
  userAgent?: string;
  
  // Dados de localização
  location?: {
    ip?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    country_name?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
  
  // Cookies e identificadores
  cookies?: {
    fbp?: string; // Facebook Browser ID
    fbc?: string; // Facebook Click ID
  };
  
  // Dados de rastreamento de marketing
  trackMeta?: Record<string, string>;
  
  // Dados do cliente (quando disponíveis)
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    externalId?: string;
  };
  
  // Metadados do armazenamento
  lastUpdated?: number;
}

// Chave única para armazenamento
const STORAGE_KEY = 'tracking';

/**
 * Obtém todo o objeto de rastreamento
 * @returns Objeto completo de rastreamento ou objeto vazio
 */
function getTrackingData(): TrackingData {
  if (typeof window === 'undefined') return {};
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) as TrackingData : {};
  } catch (error) {
    console.error('Erro ao recuperar dados de rastreamento:', error);
    return {};
  }
}

/**
 * Salva o objeto completo de rastreamento
 * @param data Objeto de rastreamento para salvar
 */
function saveTrackingData(data: TrackingData): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Adiciona timestamp de última atualização
    data.lastUpdated = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar dados de rastreamento:', error);
  }
}

/**
 * Recupera o ID de rastreamento
 * @returns ID de rastreamento ou string vazia
 */
export function getStoredTrackingId(): string {
  const storage = getTrackingData();
  return storage.tracking_id || '';
}

/**
 * Armazena o ID de rastreamento
 * @param id ID de rastreamento gerado pelo backend
 */
export function storeTrackingId(id: string): void {
  if (typeof window === 'undefined' || !id) return;
  
  const storage = getTrackingData();
  storage.tracking_id = id;
  saveTrackingData(storage);
  
  // Remover chave antiga para migração
  try {
    localStorage.removeItem('tracking_id');
  } catch {}
}

/**
 * Recupera os dados do cliente formatados para o Meta Pixel
 * @returns Objeto com dados do cliente ou null se não existir
 */
export function getCustomerData(): CustomerData | null {
  const storage = getTrackingData();
  
  if (!storage) return null;
  
  // Construir objeto CustomerData a partir dos dados unificados
  const customerData: CustomerData = {
    userAgent: storage.userAgent,
    ip: storage.location?.ip,
    city: storage.location?.city,
    state: storage.location?.state,
    zipCode: storage.location?.zipCode,
    country: storage.location?.country,
    fbp: storage.cookies?.fbp,
    fbc: storage.cookies?.fbc,
    firstName: storage.customer?.firstName,
    lastName: storage.customer?.lastName,
    email: storage.customer?.email,
    phone: storage.customer?.phone,
    externalId: storage.customer?.externalId
  };
  
  // Filtrar propriedades undefined
  return Object.keys(customerData).some(key => customerData[key as keyof CustomerData] !== undefined) 
    ? customerData 
    : null;
}

/**
 * Armazena os dados do cliente de forma unificada
 * @param data Dados do cliente para armazenar
 */
export function storeCustomerData(data: CustomerData): void {
  if (typeof window === 'undefined' || !data) return;
  
  const storage = getTrackingData();
  
  // Inicializar objetos aninhados se não existirem
  if (!storage.location) storage.location = {};
  if (!storage.cookies) storage.cookies = {};
  if (!storage.customer) storage.customer = {};
  
  // Atualizar dados do navegador
  if (data.userAgent) storage.userAgent = data.userAgent;
  
  // Atualizar dados de localização
  if (data.ip) storage.location.ip = data.ip;
  if (data.city) storage.location.city = data.city;
  if (data.state) storage.location.state = data.state;
  if (data.zipCode) storage.location.zipCode = data.zipCode;
  if (data.country) storage.location.country = data.country;
  
  // Atualizar cookies
  if (data.fbp) storage.cookies.fbp = data.fbp;
  if (data.fbc) storage.cookies.fbc = data.fbc;
  
  // Atualizar dados do cliente
  if (data.firstName) storage.customer.firstName = data.firstName;
  if (data.lastName) storage.customer.lastName = data.lastName;
  if (data.email) storage.customer.email = data.email;
  if (data.phone) storage.customer.phone = data.phone;
  if (data.externalId) storage.customer.externalId = data.externalId;
  
  // Salvar dados unificados
  saveTrackingData(storage);
  
  // Remover chave antiga para migração
  try {
    localStorage.removeItem('customerData');
  } catch {}
}

/**
 * Recupera os dados UTM armazenados
 * @returns Objeto com dados UTM ou objeto vazio
 */
export function getStoredUtmData(): Record<string, string> {
  const storage = getTrackingData();
  return storage.trackMeta || {};
}

/**
 * Armazena os dados UTM
 * @param data Dados UTM para armazenar
 */
export function storeUtmData(data: Record<string, string>): void {
  if (typeof window === 'undefined' || !data) return;
  
  const storage = getTrackingData();
  
  // Inicializar objeto trackMeta se não existir
  if (!storage.trackMeta) storage.trackMeta = {};
  
  // Atualizar dados UTM
  // Agora podemos usar diretamente o objeto Record<string, string>
  Object.entries(data).forEach(([key, value]) => {
    if (value && storage.trackMeta) {
      storage.trackMeta[key] = value;
    }
  });
  
  // Salvar dados unificados
  saveTrackingData(storage);
  
  // Remover chave antiga para migração
  try {
    localStorage.removeItem('utm_data');
  } catch {}
}

/**
 * Recupera os dados de geolocalização armazenados
 * @returns Objeto com dados de geolocalização ou null
 */
export function getStoredGeoData(): GeoData | null {
  const storage = getTrackingData();
  
  if (!storage.location) return null;
  
  // Verificar se os dados estão expirados (24 horas)
  if (storage.lastUpdated) {
    const now = Date.now();
    const expirationTime = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
    
    if ((now - storage.lastUpdated) > expirationTime) {
      // Dados expirados, retornar null para forçar nova busca
      return null;
    }
  }
  
  // Construir objeto GeoData a partir dos dados de localização
  const geoData: GeoData = {
    ip: storage.location.ip,
    city: storage.location.city,
    region: storage.location.state,
    country: storage.location.country,
    postal: storage.location.zipCode,
    latitude: storage.location.latitude,
    longitude: storage.location.longitude,
    timestamp: storage.lastUpdated // Usar o timestamp de atualização do storage
  };
  
  return Object.keys(geoData).some(key => geoData[key as keyof GeoData] !== undefined) 
    ? geoData 
    : null;
}

/**
 * Armazena os dados de geolocalização
 * @param data Dados de geolocalização para armazenar
 */
export function storeGeoData(data: GeoData): void {
  if (typeof window === 'undefined' || !data) return;
  
  const storage = getTrackingData();
  
  // Inicializar objeto location se não existir
  if (!storage.location) storage.location = {};
  
  // Atualizar dados de localização
  if (data.ip) storage.location.ip = data.ip;
  if (data.city) storage.location.city = data.city;
  if (data.region) storage.location.state = data.region;
  if (data.postal) storage.location.zipCode = data.postal;
  if (data.country) storage.location.country = data.country;
  if (data.latitude) storage.location.latitude = data.latitude;
  if (data.longitude) storage.location.longitude = data.longitude;
  
  // Forçar timestamp para controle de expiração
  storage.lastUpdated = data.timestamp || Date.now();
  
  // Salvar dados unificados
  saveTrackingData(storage);
  
  // Remover chave antiga para migração
  try {
    localStorage.removeItem('_meta_geo_data');
  } catch {}
}
