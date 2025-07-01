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
  fbp?: string; // Cookie do Facebook Pixel
  fbc?: string; // Cookie do Facebook Click ID
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

// Interface para dados de geolocalização
interface GeoData {
  city?: string;
  region?: string;
  postal?: string;
  country?: string;
  country_name?: string; // Nome completo do país usado pelo ipapi.co
}

/**
 * Recupera o ID de rastreamento do localStorage, se existir
 * @returns ID de rastreamento ou string vazia
 */
export function getStoredTrackingId(): string {
  if (typeof window === 'undefined') return '';
  const id = localStorage.getItem('tracking_id');
  return id || '';
}

/**
 * Armazena o ID de rastreamento no localStorage
 * @param id ID de rastreamento gerado pelo backend
 */
export function storeTrackingId(id: string): void {
  if (typeof window === 'undefined' || !id) return;
  localStorage.setItem('tracking_id', id);
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

  const utmData: UtmData = {};
  
  utmKeys.forEach(key => {
    const value = params.get(key);
    if (value) {
      utmData[key as keyof UtmData] = value;
    }
  });
  
  return utmData;
}

/**
 * Migra dados de rastreamento antigos para o novo formato
 * @returns Dados UTM do formato antigo
 */
function migrateOldTrackingData(): UtmData {
  if (typeof window === 'undefined') return {};
  
  const legacyKeys = [
    { old: 'utm_source', new: 'utm_source' },
    { old: 'utm_medium', new: 'utm_medium' },
    { old: 'utm_campaign', new: 'utm_campaign' },
    { old: 'utm_term', new: 'utm_term' },
    { old: 'utm_content', new: 'utm_content' },
    { old: 'fbclid', new: 'fbclid' }
  ];
  
  const migratedData: UtmData = {};
  
  legacyKeys.forEach(({ old, new: newKey }) => {
    const value = localStorage.getItem(old);
    if (value) {
      migratedData[newKey as keyof UtmData] = value;
      // Limpar dados antigos
      localStorage.removeItem(old);
    }
  });
  
  return migratedData;
}

/**
 * Hook para gerenciar sessão de rastreamento
 * @returns Objeto contendo o estado da sessão e funções para enviar eventos
 */
export function useTrackingSession(): TrackingHookReturn {
  const [ready, setReady] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  useEffect(() => {
    // Função para inicializar a sessão
    async function initSession(): Promise<void> {
      try {
        // Coletar parâmetros UTM da URL atual
        const utmData = collectUtms();
        
        // Migrar dados antigos se necessário
        const legacyData = migrateOldTrackingData();
        
        // Recuperar UTMs armazenados
        const storedUtmDataStr = localStorage.getItem('utm_data');
        const parsedUtmData = storedUtmDataStr ? JSON.parse(storedUtmDataStr) : {};
        
        // Mesclar todos os UTMs, priorizando os novos
        const allUtmData = { ...parsedUtmData, ...legacyData, ...utmData };
        
        // Armazenar UTMs atualizados
        localStorage.setItem('utm_data', JSON.stringify(allUtmData));

        // Buscar IP público
        const ip = await fetchPublicIp();

        // Inicializar objeto de dados do cliente
        let customerData: CustomerData = {
          city: '',
          state: '',
          zipCode: '',
          country: ''
        };

        // Tentar recuperar dados existentes do cliente
        try {
          const storedData = localStorage.getItem('customerData');
          if (storedData) {
            customerData = JSON.parse(storedData);
          }
        } catch (error) {
          console.error('Erro ao recuperar dados do cliente:', error);
        }

        // Buscar dados de geolocalização
        try {
          const geoResponse = await fetch('https://ipapi.co/json/');
          const geoData = await geoResponse.json() as GeoData;
          
          // Atualizar dados do cliente com geolocalização
          customerData.city = geoData.city || customerData.city;
          customerData.state = geoData.region || customerData.state;
          customerData.zipCode = geoData.postal || customerData.zipCode;
          customerData.country = geoData.country || customerData.country;
          
          // Coletar cookies do Facebook
          const getCookie = (name: string): string | null => {
            if (typeof document === 'undefined') return null;
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i].trim();
              if (cookie.indexOf(`${name}=`) === 0) {
                return cookie.substring(`${name}=`.length);
              }
            }
            return null;
          };
          
          // Adicionar cookies do Facebook
          customerData.fbp = getCookie('_fbp') || customerData.fbp;
          customerData.fbc = getCookie('_fbc') || customerData.fbc;
          
          // Salvar no localStorage
          localStorage.setItem('customerData', JSON.stringify(customerData));
          
          // Registrar a sessão no servidor
          const response = await fetch('/api/tracking/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              // Deixamos o backend gerar o ID
              landingPage: window.location.href,
              userAgent: navigator.userAgent,
              ip,
              // Incluir dados de geolocalização no registro da sessão
              city: customerData.city,
              state: customerData.state,
              zipCode: customerData.zipCode,
              country: customerData.country,
              // Incluir cookies do Facebook
              fbp: customerData.fbp,
              fbc: customerData.fbc,
              ...allUtmData
            } as TrackingSessionData)
          });

          // Verificar se a resposta foi bem-sucedida
          if (!response.ok) {
            throw new Error(`Erro ao registrar sessão: ${response.status}`);
          }
          
          // Obter o ID gerado pelo backend
          const responseData = await response.json() as { id: string };
          const sessionId = responseData.id;
          
          // Armazenar o ID recebido do backend
          if (sessionId) {
            storeTrackingId(sessionId);
            setTrackingId(sessionId);
          }

          // Marcar como pronto
          setReady(true);
        } catch (error) {
          console.error('Erro ao buscar dados de geolocalização:', error);
          // Mesmo com erro, tentar registrar a sessão com os dados disponíveis
          try {
            const response = await fetch('/api/tracking/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                landingPage: window.location.href,
                userAgent: navigator.userAgent,
                ip,
                ...allUtmData
              } as TrackingSessionData)
            });
            
            if (response.ok) {
              // Obter o ID gerado pelo backend
              const responseData = await response.json() as { id: string };
              const sessionId = responseData.id;
              
              // Armazenar o ID recebido do backend
              if (sessionId) {
                storeTrackingId(sessionId);
                setTrackingId(sessionId);
              }
            }
            
            setReady(true);
          } catch (sessionError) {
            console.error('Erro ao registrar sessão:', sessionError);
          }
        }
      } catch (error) {
        console.error('Erro na inicialização da sessão:', error);
      }
    }

    // Iniciar a sessão se estivermos no navegador
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
    // Verificar se temos um ID de rastreamento válido
    const currentTrackingId = trackingId;
    if (!ready || !currentTrackingId) {
      console.warn('Sessão de rastreamento não está pronta');
      return;
    }

    try {
      const eventId = `${currentTrackingId}_${eventName.toUpperCase()}`;
      
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
          trackingId: currentTrackingId,
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
    // Verificar se temos um ID de rastreamento válido
    const currentTrackingId = trackingId;
    if (!currentTrackingId) {
      console.warn('ID de rastreamento não disponível');
      return;
    }
    
    // Gerar ID de evento consistente para deduplicação
    const eventId = `${currentTrackingId}_${eventName.toUpperCase()}`;
    
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
      const fetchGeoData = async (): Promise<void> => {
        try {
          // Usar dados do cliente se disponíveis, caso contrário tentar obter via IP
          if (!customer || (!customer.city && !customer.state && !customer.country)) {
            const response = await fetch('https://ipapi.co/json/');
            if (response.ok) {
              const geoData = await response.json() as GeoData;
              
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
