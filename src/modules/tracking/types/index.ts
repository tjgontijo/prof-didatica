/**
 * Tipos e interfaces para o sistema de rastreamento
 */

/**
 * Interface para dados UTM
 */
export interface UtmData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  fbclid?: string;
  gclid?: string;
}

/**
 * Interface para dados de sessão de rastreamento
 */
export interface TrackingSessionData extends UtmData {
  trackingId?: string; // Opcional para permitir que o backend gere
  fbp?: string;
  fbc?: string;
  landingPage: string;
  userAgent: string;
  ip?: string;
  // Campos de geolocalização
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

/**
 * Interface para dados do cliente para advanced matching
 */
export interface CustomerData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  externalId?: string;
  fbp?: string; // Cookie do Facebook Pixel
  fbc?: string; // Cookie do Facebook Click ID
  ip?: string; // Endereço IP do cliente
  userAgent?: string; // User Agent do navegador do cliente
}

/**
 * Interface para eventos de rastreamento
 */
export interface TrackingEventData {
  trackingId: string;
  eventName: string;
  eventId?: string; // Opcional para permitir que o backend gere
  customData?: Record<string, unknown>;
  customer?: CustomerData;
  userAgent?: string;
  ip?: string;
  orderId?: string;
}

/**
 * Interface para o retorno do hook useTrackingSession
 */
export interface TrackingHookReturn {
  ready: boolean;
  trackingId: string;
  trackEvent: (eventName: string, customData?: Record<string, unknown>, customer?: CustomerData) => Promise<void>;
  trackEventBoth: (eventName: string, customData?: Record<string, unknown>, customer?: CustomerData) => Promise<void>;
}

/**
 * Interface para dados de geolocalização
 */
export interface GeoData {
  city?: string;
  region?: string;
  postal?: string;
  country?: string;
  country_code?: string;
  country_name?: string;
  latitude?: number;
  longitude?: number;
  ip?: string;
  error?: boolean;
  timestamp?: number; // Timestamp para controle de expiração
}
