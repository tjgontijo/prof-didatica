/**
 * Exportações públicas do módulo de tracking
 */

// Tipos
export * from './types';

// Hook principal
export { useTrackingSession } from './hooks/useTrackingSession';

// Utilitários (opcionais)
export * as StorageUtils from './utils/storage';
export * as IpLocationUtils from './utils/ipAndLocation';
export * as CookieUtils from './utils/cookies';
export * as UtmUtils from './utils/utmCollector';

// Serviços (opcionais)
export * as MetaPixelService from './services/metaPixelService';
export * as TrackingApiService from './services/trackingApiService';
