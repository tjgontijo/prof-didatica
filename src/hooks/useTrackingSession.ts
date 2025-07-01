import { useEffect, useState } from 'react';

interface UtmData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  fbclid?: string;
  gclid?: string;
}

interface TrackingSessionData extends UtmData {
  trackingId: string;
  fbp?: string;
  fbc?: string;
  landingPage: string;
  userAgent: string;
  ip?: string;
}

interface CustomerData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  externalId?: string;
}

interface TrackingEventData {
  trackingId: string;
  eventName: string;
  eventId: string;
  customData?: Record<string, unknown>;
  customer?: CustomerData;
  userAgent?: string;
  ip?: string;
  orderId?: string;
}

interface TrackingHookReturn {
  ready: boolean;
  trackingId: string;
  trackEvent: (eventName: string, customData?: Record<string, unknown>, customer?: CustomerData) => Promise<void>;
  trackEventBoth: (eventName: string, customData?: Record<string, unknown>, customer?: CustomerData) => Promise<void>;
}

// A declaração do tipo global do Facebook Pixel já está em custom.d.ts

import { generateTrackingId } from '../lib/utils';

/**
 * Gera ou recupera um ID de rastreamento único para o usuário
 * @returns ID de rastreamento no formato 'trk_[cuid]'
 */
export function getTrackingId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('tracking_id');
  if (!id) {
    id = generateTrackingId();
    localStorage.setItem('tracking_id', id);
  }
  return id;
}

/**
 * Busca o IP público do usuário
 * @returns IP público ou string vazia em caso de falha
 */
async function fetchPublicIp(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const { ip } = await res.json() as { ip: string };
    return ip;
  } catch {
    return '';
  }
}

/**
 * Coleta parâmetros UTM e outros identificadores da URL atual
 * @returns Objeto contendo os parâmetros UTM encontrados
 */
function collectUtms(): UtmData {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  const utmKeys = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'fbclid',
    'gclid'
  ];
  
  return utmKeys.reduce<UtmData>((acc, key) => {
    const value = params.get(key);
    if (value) {
      acc[key as keyof UtmData] = value;
    }
    return acc;
  }, {});
}

/**
 * Verifica se existem dados antigos de rastreamento para migrar
 * @returns Dados UTM migrados do sistema antigo, se disponíveis
 */
function migrateOldTrackingData(): UtmData {
  if (typeof window === 'undefined') return {};
  
  const legacyTracking = localStorage.getItem('trackingParameters');
  if (!legacyTracking) return {};
  
  try {
    const parsed = JSON.parse(legacyTracking);
    if (parsed.trackingParameters && parsed.expiresAt && Date.now() < parsed.expiresAt) {
      const result: UtmData = {};
      
      if (parsed.trackingParameters.utm_source) {
        result.utm_source = parsed.trackingParameters.utm_source;
      }
      if (parsed.trackingParameters.utm_medium) {
        result.utm_medium = parsed.trackingParameters.utm_medium;
      }
      if (parsed.trackingParameters.utm_campaign) {
        result.utm_campaign = parsed.trackingParameters.utm_campaign;
      }
      if (parsed.trackingParameters.utm_content) {
        result.utm_content = parsed.trackingParameters.utm_content;
      }
      if (parsed.trackingParameters.utm_term) {
        result.utm_term = parsed.trackingParameters.utm_term;
      }
      
      return result;
    }
  } catch (e) {
    console.error('Erro ao migrar dados de rastreamento antigos:', e);
  }
  
  return {};
}

/**
 * Hook para gerenciar sessão de rastreamento
 * Inicializa automaticamente a sessão e permite enviar eventos
 */
export function useTrackingSession(): TrackingHookReturn {
  const [ready, setReady] = useState<boolean>(false);
  const [trackingId, setTrackingId] = useState<string>('');

  useEffect(() => {
    async function initSession(): Promise<void> {
      const id = getTrackingId();
      setTrackingId(id);
      
      // Coletar UTMs da URL atual
      const utmData = collectUtms();
      
      // Migrar dados antigos se necessário
      const legacyData = migrateOldTrackingData();
      
      // Mesclar dados, priorizando os novos
      const mergedUtmData: UtmData = {
        ...legacyData,
        ...utmData
      };
      
      const fbp = document.cookie.match(/_fbp=([^;]+)/)?.[1] || '';
      const fbc = document.cookie.match(/_fbc=([^;]+)/)?.[1] || '';
      const landing = window.location.href;
      const ua = navigator.userAgent;
      const ip = await fetchPublicIp();

      try {
        const response = await fetch('/api/tracking/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trackingId: id,
            ...mergedUtmData,
            fbp,
            fbc,
            landingPage: landing,
            userAgent: ua,
            ip
          } as TrackingSessionData)
        });

        if (response.ok) {
          setReady(true);
        } else {
          console.error('Falha ao registrar sessão de rastreamento:', await response.text());
        }
      } catch (error) {
        console.error('Erro ao registrar sessão de rastreamento:', error);
      }
    }

    if (typeof window !== 'undefined') {
      initSession();
    }
  }, []);

  /**
   * Envia um evento de rastreamento para o backend (CAPI)
   * @param eventName Nome do evento (InitiateCheckout, AddPaymentInfo, Purchase)
   * @param customData Dados personalizados do evento (valor, moeda, content_ids)
   * @param customer Dados do cliente para advanced matching
   */
  const trackEvent = async (
    eventName: string, 
    customData: Record<string, unknown> = {},
    customer?: CustomerData
  ): Promise<void> => {
    if (!ready || !trackingId) {
      console.warn('Sessão de rastreamento não está pronta');
      return;
    }

    try {
      const eventId = `${trackingId}_${eventName.toUpperCase()}`;
      
      // Salvar dados do cliente no localStorage para uso futuro no advanced matching
      if (customer && typeof window !== 'undefined') {
        try {
          // Salvar apenas se tivermos pelo menos um dado relevante
          if (customer.email || customer.phone || customer.firstName || customer.lastName) {
            localStorage.setItem('customerData', JSON.stringify(customer));
          }
        } catch (storageError) {
          console.warn('Não foi possível salvar dados do cliente no localStorage:', storageError);
        }
      }
      
      await fetch('/api/tracking/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingId,
          eventName,
          eventId,
          customData,
          customer,
          userAgent: navigator.userAgent,
          ip: await fetchPublicIp()
        } as TrackingEventData)
      });
    } catch (error) {
      console.error(`Erro ao enviar evento de rastreamento ${eventName}:`, error);
    }
  };
  
  /**
   * Envia um evento de rastreamento tanto para o Pixel (cliente) quanto para o CAPI (servidor)
   * @param eventName Nome do evento (InitiateCheckout, AddPaymentInfo, Purchase)
   * @param customData Dados personalizados do evento (valor, moeda, content_ids)
   * @param customer Dados do cliente para advanced matching
   */
  const trackEventBoth = async (
    eventName: string, 
    customData: Record<string, unknown> = {},
    customer?: CustomerData
  ): Promise<void> => {
    if (!trackingId) {
      console.warn('ID de rastreamento não disponível');
      return;
    }
    
    // Gerar ID de evento consistente para deduplicação
    const eventId = `${trackingId}_${eventName.toUpperCase()}`;
    
    // Salvar dados do cliente no localStorage para uso futuro no advanced matching
    if (customer && typeof window !== 'undefined') {
      try {
        // Salvar apenas se tivermos pelo menos um dado relevante
        if (customer.email || customer.phone || customer.firstName || customer.lastName) {
          localStorage.setItem('customerData', JSON.stringify(customer));
        }
      } catch (storageError) {
        console.warn('Não foi possível salvar dados do cliente no localStorage:', storageError);
      }
    }
    
    // Evento no lado do cliente (Pixel)
    if (typeof window !== 'undefined' && window.fbq) {
      // Guardar referência segura para fbq
      const fbq = window.fbq;
      
      // Buscar dados de geolocalização para advanced matching
      const fetchGeoData = async () => {
        try {
          // Usar dados do cliente se disponíveis, caso contrário tentar obter via IP
          if (!customer || (!customer.city && !customer.state && !customer.country)) {
            const response = await fetch('https://ipapi.co/json/');
            if (response.ok) {
              const geoData = await response.json();
              
              // Inicializar o pixel com advanced matching
              fbq('init', window.pixelId, {
                em: customer?.email,
                ph: customer?.phone,
                fn: customer?.firstName,
                ln: customer?.lastName,
                ct: customer?.city || geoData.city,
                st: customer?.state || geoData.region,
                zp: customer?.zipCode || geoData.postal,
                country: customer?.country || geoData.country_name,
                external_id: customer?.externalId
              });
            }
          } else {
            // Usar apenas os dados do cliente
            fbq('init', window.pixelId, {
              em: customer?.email,
              ph: customer?.phone,
              fn: customer?.firstName,
              ln: customer?.lastName,
              ct: customer?.city,
              st: customer?.state,
              zp: customer?.zipCode,
              country: customer?.country,
              external_id: customer?.externalId
            });
          }
          
          // Enviar o evento com dados personalizados
          fbq('track', eventName, {
            ...customData,
            event_id: eventId
          });
        } catch (error) {
          console.error('Erro ao obter dados de geolocalização:', error);
          
          // Enviar o evento mesmo sem dados de geolocalização
          fbq('track', eventName, {
            ...customData,
            event_id: eventId
          });
        }
      };
      
      fetchGeoData();
    }
    
    // Evento no lado do servidor (CAPI)
    await trackEvent(eventName, customData, customer);
  };

  return { ready, trackingId, trackEvent, trackEventBoth };
}
