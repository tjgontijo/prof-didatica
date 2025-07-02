import { useEffect, useState } from 'react';
import { TrackingHookReturn, CustomerData, TrackingSessionData } from '../types';
import * as Storage from '../utils/storage';
import * as IpLocation from '../utils/ipAndLocation';
import * as Cookies from '../utils/cookies';
import * as UtmCollector from '../utils/utmCollector';
import * as PixelService from '../services/metaPixelService';
import * as ApiService from '../services/trackingApiService';

/**
 * Hook para gerenciar sessão de rastreamento
 * @returns Objeto contendo o estado da sessão e funções para enviar eventos
 */
export function useTrackingSession(): TrackingHookReturn {
  const [ready, setReady] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  // Obter o Meta Pixel ID da variável de ambiente
  const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';
  
  useEffect(() => {
    // Função para inicializar a sessão
    async function initSession(): Promise<void> {
      try {
        // Verificar se já existe um ID de rastreamento armazenado
        const existingTrackingId = Storage.getStoredTrackingId();
        
        if (existingTrackingId) {
          console.log('ID de rastreamento já existe:', existingTrackingId);
          setTrackingId(existingTrackingId);
          setReady(true);
          return; // Não criar nova sessão se já existe um ID
        }
        
        // Mesclar dados UTM de várias fontes
        const allUtmData = UtmCollector.mergeUtmData();
        
        // Buscar IP público
        const ip = await IpLocation.fetchPublicIp();
        
        // Obter User Agent do navegador
        const userAgent = navigator.userAgent;

        // Inicializar objeto de dados do cliente
        let customerData: CustomerData = {
          city: '',
          state: '',
          zipCode: '',
          country: '',
          ip,
          userAgent
        };

        // Tentar recuperar dados existentes do cliente
        const storedData = Storage.getCustomerData();
        if (storedData) {
          customerData = {...customerData, ...storedData};
        }
        
        // Verificar e recuperar cookies do Facebook
        const { fbp, fbc } = Cookies.getFacebookCookies();
        customerData.fbp = fbp || customerData.fbp;
        customerData.fbc = fbc || customerData.fbc;
        
        // Armazenar os cookies para uso futuro
        Cookies.storeFacebookCookies(fbp, fbc);
        
        // Não buscamos dados de geolocalização aqui, apenas enviamos o IP para o backend
        // O backend fará a geolocalização e retornará os dados completos
        // Armazenamos os dados do cliente atualizados (sem geolocalização por enquanto)
        Storage.storeCustomerData(customerData);
          
        try {
          // Registrar sessão no backend
          const sessionData: TrackingSessionData = {
            landingPage: window.location.href,
            userAgent,
            ip,
            fbp: customerData.fbp,
            fbc: customerData.fbc,
            city: customerData.city,
            state: customerData.state,
            zipCode: customerData.zipCode,
            country: customerData.country,
            ...allUtmData
          };
          
          const sessionId = await ApiService.registerSession(sessionData);
          
          // Armazenar o ID recebido do backend
          if (sessionId) {
            Storage.storeTrackingId(sessionId);
            setTrackingId(sessionId);
            
            // Recuperar os dados de geolocalização atualizados pelo backend
            const geoData = IpLocation.getStoredGeoData();
            if (geoData) {
              // Atualizar os dados do cliente com as informações de geolocalização
              customerData.city = geoData.city || customerData.city;
              customerData.state = geoData.region || customerData.state;
              customerData.zipCode = geoData.postal || customerData.zipCode;
              customerData.country = geoData.country || customerData.country || 'br';
              
              // Armazenar os dados atualizados
              Storage.storeCustomerData(customerData);
              
              console.log('Dados de geolocalização atualizados:', {
                city: customerData.city,
                state: customerData.state,
                zipCode: customerData.zipCode,
                country: customerData.country
              });
            }
          }
          
          // Marcar como pronto
          setReady(true);
        } catch (sessionError) {
          console.error('Erro ao registrar sessão:', sessionError);
          setReady(true); // Marcar como pronto mesmo com erro
        }
      } catch (error) {
        console.error('Erro na inicialização da sessão:', error);
        setReady(true); // Marcar como pronto mesmo com erro
      }
    }

    // Iniciar a sessão se estivermos no navegador
    if (typeof window !== 'undefined') {
      // Função para enriquecer os dados do cliente com informações adicionais
      const enrichCustomerData = async () => {
        // Criar um objeto básico de dados do cliente com informações disponíveis
        const baseCustomerData: CustomerData = {
          userAgent: navigator.userAgent
        };
        
        try {
          // Tentar obter o IP do cliente
          const ip = await IpLocation.fetchPublicIp();
          if (ip) baseCustomerData.ip = ip;
          
          // Verificar se já temos dados de geolocalização armazenados
          const storedGeoData = IpLocation.getStoredGeoData();
          if (storedGeoData) {
            baseCustomerData.city = storedGeoData.city || '';
            baseCustomerData.state = storedGeoData.region || '';
            baseCustomerData.zipCode = storedGeoData.postal || '';
            baseCustomerData.country = storedGeoData.country || 'br';
          }
          
          // Tentar obter dados do usuário logado do localStorage
          try {
            const userDataStr = localStorage.getItem('userData');
            if (userDataStr) {
              const userData = JSON.parse(userDataStr);
              
              // Adicionar dados pessoais se disponíveis
              if (userData.email) baseCustomerData.email = userData.email;
              if (userData.name) {
                const nameParts = userData.name.split(' ');
                baseCustomerData.firstName = nameParts[0] || '';
                baseCustomerData.lastName = nameParts.slice(1).join(' ') || '';
              }
              if (userData.phone) baseCustomerData.phone = userData.phone;
              if (userData.id) baseCustomerData.externalId = String(userData.id);
            }
          } catch (userError) {
            console.error('Erro ao obter dados do usuário:', userError);
          }
        } catch (error) {
          console.error('Erro ao obter dados de geolocalização:', error);
        }
        
        // Recuperar cookies do Facebook para advanced matching
        const { fbp, fbc } = Cookies.getFacebookCookies();
        if (fbp) baseCustomerData.fbp = fbp;
        if (fbc) baseCustomerData.fbc = fbc;
        
        // Recuperar dados do cliente existentes para complementar
        const storedCustomer = Storage.getCustomerData();
        
        // Mesclar dados básicos com dados armazenados (se existirem)
        const customerData = storedCustomer ? {
          ...baseCustomerData,
          ...storedCustomer,
          // Garantir que os cookies mais recentes sejam usados
          fbp: fbp || storedCustomer.fbp,
          fbc: fbc || storedCustomer.fbc
        } : baseCustomerData;
        
        // Armazenar os dados mesclados para uso futuro
        Storage.storeCustomerData(customerData);
        
        return customerData;
      };
      
      // Inicializar o Meta Pixel e a sessão de rastreamento
      const initializeTracking = async () => {
        // Obter dados enriquecidos do cliente
        const customerData = await enrichCustomerData();
        
        // Inicializar o Meta Pixel se temos um ID e o pixel ainda não foi inicializado
        if (META_PIXEL_ID && !PixelService.isInitialized()) {
          // Sempre inicializar com dados de advanced matching
          PixelService.initializePixel(META_PIXEL_ID, customerData);
          console.log('Meta Pixel inicializado com advanced matching no useTrackingSession');
        }
        
        // Iniciar a sessão de rastreamento
        initSession();
      };
      
      // Iniciar o processo de inicialização
      initializeTracking();
    }
  }, [META_PIXEL_ID]);

  /**
   * Envia um evento de rastreamento para o backend (CAPI)
   * @param eventName Nome do evento (InitiateCheckout, AddPaymentInfo, Purchase)
   * @param customData Dados personalizados do evento (valor, moeda, content_ids)
   * @param customer Dados do cliente para advanced matching
   */
  async function trackEvent(
    eventName: string, 
    customData: Record<string, unknown> = {},
    customer?: CustomerData
  ): Promise<void> {
    // Não fazer nada se não estamos prontos ou não temos ID de rastreamento
    if (!ready || !trackingId) return;
    
    try {
      // Obter dados do cliente armazenados
      const storedCustomer = Storage.getCustomerData();
      
      // Mesclar com os dados fornecidos
      const mergedCustomer = {
        ...storedCustomer,
        ...customer,
        ip: customer?.ip || storedCustomer?.ip || '',
        userAgent: customer?.userAgent || storedCustomer?.userAgent || navigator.userAgent
      };
      
      // Enviar evento para o backend
      // Não enviamos mais um eventId - o backend/Prisma irá gerar
      const response = await ApiService.sendEventToApi({
        trackingId,
        eventName,
        // Removemos a geração de eventId aqui para usar o ID gerado pelo backend
        customData,
        customer: mergedCustomer,
        userAgent: mergedCustomer.userAgent,
        ip: mergedCustomer.ip,
      });
      
      // O backend deve retornar o ID do evento para que possamos usar na deduplicação
      console.log(`Evento ${eventName} enviado para API com sucesso`, response);
    } catch (error) {
      console.error(`Erro ao enviar evento ${eventName}:`, error);
    }
  }

  /**
   * Envia um evento de rastreamento tanto para o Pixel (cliente) quanto para o CAPI (servidor)
   * @param eventName Nome do evento (InitiateCheckout, AddPaymentInfo, Purchase)
   * @param customData Dados personalizados do evento (valor, moeda, content_ids)
   * @param customer Dados do cliente para advanced matching
   */
  async function trackEventBoth(
    eventName: string, 
    customData: Record<string, unknown> = {},
    customer?: CustomerData
  ): Promise<void> {
    // Não fazer nada se não estamos prontos
    if (!ready) return;
    
    try {
      // Verificar e atualizar cookies do Facebook
      Cookies.checkAndStoreFacebookCookies();
      
      // Obter dados do cliente armazenados
      const storedCustomer = Storage.getCustomerData();
      
      // Mesclar com os dados fornecidos
      const mergedCustomer = {
        ...storedCustomer,
        ...customer
      };
      
      // Obter os cookies do Facebook
      const { fbp, fbc } = Cookies.getFacebookCookies();
      
      // Atualizar cookies na mesclagem de dados
      mergedCustomer.fbp = fbp || mergedCustomer.fbp;
      mergedCustomer.fbc = fbc || mergedCustomer.fbc;
      mergedCustomer.ip = customer?.ip || storedCustomer?.ip || '';
      mergedCustomer.userAgent = customer?.userAgent || storedCustomer?.userAgent || navigator.userAgent;
      
      // Verificar se o Meta Pixel já foi inicializado
      if (META_PIXEL_ID && !PixelService.isInitialized()) {
        // Se não foi inicializado, inicializar com advanced matching
        console.log('Inicializando Meta Pixel com advanced matching durante o envio de evento');
        PixelService.initializePixel(META_PIXEL_ID, mergedCustomer);
      }
      
      let eventId: string | undefined;
      
      // 1. PRIMEIRO enviar para a API (servidor CAPI) para obter o ID do evento
      if (trackingId) {
        try {
          const response = await ApiService.sendEventToApi({
            trackingId,
            eventName,
            // Não enviamos eventId - o backend irá gerar
            customData,
            customer: mergedCustomer,
            userAgent: mergedCustomer.userAgent,
            ip: mergedCustomer.ip
          });
          
          // Obter o ID do evento gerado pelo backend para deduplicação
          eventId = response.eventId;
          console.log(`Evento ${eventName} enviado para API com sucesso, ID: ${eventId}`);
        } catch (apiError) {
          console.error(`Erro ao enviar evento ${eventName} para API:`, apiError);
          // Continuamos com o envio para o pixel mesmo se falhar o backend
        }
      } else {
        console.warn('Tentativa de enviar evento sem ID de rastreamento');
      }
      
      // 2. DEPOIS enviar para o Meta Pixel (browser) com o mesmo ID
      if (META_PIXEL_ID) {
        try {
          // Se temos um eventId do backend, vamos usá-lo para deduplicação
          if (eventId) {
            // Adicionar o eventId aos dados customizados para deduplicação
            const pixelData = {
              ...customData,
              // Adicionar o event_id para deduplicação com o CAPI
              event_id: eventId
            };
            
            console.log(`Enviando evento ${eventName} para o Meta Pixel com ID para deduplicação: ${eventId} e advanced matching`, pixelData);
            // Passar os dados do cliente para o Meta Pixel para advanced matching
            PixelService.trackPixelEvent(eventName, pixelData, mergedCustomer);
          } else {
            // Fallback: enviar sem ID de deduplicação, mas com advanced matching
            console.log(`Enviando evento ${eventName} para o Meta Pixel sem ID de deduplicação, mas com advanced matching`, customData);
            // Passar os dados do cliente para o Meta Pixel para advanced matching
            PixelService.trackPixelEvent(eventName, customData, mergedCustomer);
          }
        } catch (pixelError) {
          console.error(`Erro ao enviar evento ${eventName} para o Meta Pixel:`, pixelError);
        }
      }
    } catch (error) {
      console.error(`Erro ao enviar evento ${eventName}:`, error);
    }
  }

  return { ready, trackingId, trackEvent, trackEventBoth };
}
