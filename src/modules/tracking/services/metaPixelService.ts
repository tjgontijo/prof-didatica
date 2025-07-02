import { CustomerData } from '../types';

// Definimos tipos adicionais para o Meta Pixel
// Complementando os tipos já existentes em custom.d.ts
type FbqQueueItem = unknown[];

// Definimos os tipos de comandos que o fbq aceita
type FbqCommand = 'init' | 'track' | 'trackCustom' | 'set';

// Removemos o tipo não utilizado AdvancedMatchingData
// Usamos diretamente Record<string, string> para os dados de advanced matching

interface FbqFunction {
  (command: FbqCommand, ...params: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: FbqQueueItem[];
  push?: unknown;
  loaded?: boolean;
  version?: string;
}

declare global {
  interface Window {
    fbPixelId?: string;
    _fbq?: FbqFunction;
  }
}

// Controle de inicialização
let isPixelInitialized = false;

/**
 * Verifica se o pixel já foi inicializado
 * @returns true se o pixel já foi inicializado, false caso contrário
 */
export function isInitialized(): boolean {
  return isPixelInitialized;
}

/**
 * Formata os dados do cliente para o Advanced Matching do Meta Pixel
 * @param data Dados do cliente
 * @returns Objeto formatado para o Meta Pixel
 */
function formatCustomerData(data: CustomerData): Record<string, string> {
  if (!data) return {};
  
  // Função para limpar e normalizar strings
  const clean = (str?: string) =>
    str
      ?.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]/g, ''); // Mantém apenas letras e números

  // Formatar telefone no padrão internacional (com código do Brasil)
  const phoneDigits = data.phone?.replace(/\D/g, '') ?? '';
  const ph = phoneDigits ? (phoneDigits.startsWith('55') ? phoneDigits : `55${phoneDigits}`) : '';

  // Preparar todos os campos de advanced matching
  // https://developers.facebook.com/docs/meta-pixel/advanced-matching
  const obj: Record<string, string | undefined> = {
    // Campos de identificação pessoal
    em: data.email ? clean(data.email) : undefined, // Email (hash)
    ph: ph || undefined, // Telefone (hash)
    fn: data.firstName ? clean(data.firstName) : undefined, // Primeiro nome (hash)
    ln: data.lastName ? clean(data.lastName) : undefined, // Sobrenome (hash)
    
    // Campos de localização - garantir que todos sejam enviados se disponíveis
    ct: data.city ? clean(data.city) : undefined, // Cidade (hash)
    st: data.state ? data.state.toLowerCase().substring(0, 2) : undefined, // Estado (hash)
    zp: data.zipCode ? data.zipCode.replace(/[\s-]/g, '') : undefined, // CEP (hash)
    country: data.country?.toLowerCase().substring(0, 2) || 'br', // País (sempre incluir)
    
    // Campos de identificação externa
    external_id: data.externalId, // ID externo do cliente (hash)
    
    // Campos técnicos (não são hash)
    client_ip_address: data.ip, // IP do cliente
    client_user_agent: data.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : undefined),
    
    // Cookies do Facebook
    fbp: data.fbp, // Facebook Browser ID
    fbc: data.fbc  // Facebook Click ID
  };

  // Registrar os campos que estamos enviando para debug
  const fieldsBeingSent = Object.keys(obj).filter(k => obj[k] !== undefined);
  console.log('📊 Meta Pixel Advanced Matching campos enviados:', fieldsBeingSent);

  // Retorna apenas valores definidos
  return Object.entries(obj).reduce((acc, [k, v]) => {
    if (v) acc[k] = v;
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Inicializa o Meta Pixel com o snippet oficial
 * @param pixelId ID do Meta Pixel
 * @param customerData Dados do cliente para Advanced Matching inicial
 */
export function initializePixel(pixelId: string, customerData?: CustomerData): void {
  if (typeof window === 'undefined' || !pixelId) return;
  if (isPixelInitialized) return;

  try {
    // Snippet oficial do Meta Pixel adaptado para TypeScript
    (function(f: Window, b: Document, e: string, v: string) {
      if (f.fbq) return;
      // Criamos uma função fbq temporária e a atribuímos à janela
      const n: FbqFunction = function(...params: unknown[]) {
        const callMethod = n.callMethod;
        if (callMethod) {
          callMethod.apply(n, params);
        } else {
          if (!n.queue) n.queue = [];
          n.queue.push(params);
        }
      };
      f.fbq = n;
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.queue = [];
      n.loaded = true;
      n.version = '2.0';
      
      // Criamos o script e o adicionamos ao DOM
      const t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      const s = b.getElementsByTagName(e)[0];
      if (s && s.parentNode) {
        s.parentNode.insertBefore(t, s);
      } else {
        b.head.appendChild(t);
      }
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    // Advanced matching no init, se tiver dados
    const advancedMatching = customerData ? formatCustomerData(customerData) : undefined;
    window.fbPixelId = pixelId;
    
    // Inicializar o pixel com advanced matching
    window.fbq!('init', pixelId, advancedMatching);
    
    // Enviar PageView com parâmetros adicionais
    window.fbq!('track', 'PageView', {
      content_name: document.title || 'Página',
      content_category: 'Página',
      content_ids: [window.location.pathname],
      content_type: 'product_group',
      url: window.location.href,
      referrer: document.referrer || undefined
    });
    
    isPixelInitialized = true;
    console.log(`✅ Meta Pixel ${pixelId} inicializado${advancedMatching ? ' com advanced matching' : ''}`);
  } catch (error) {
    console.error('Erro ao inicializar Meta Pixel:', error);
  }
}

/**
 * Envia um evento para o Meta Pixel sem reinicializar
 * @param eventName Nome do evento
 * @param eventData Dados personalizados do evento
 * @param customerData Dados do cliente para advanced matching
 */
export function trackPixelEvent(
  eventName: string,
  eventData: Record<string, unknown> = {},
  customerData?: CustomerData
): void {
  if (typeof window === 'undefined' || !window.fbq || !isPixelInitialized) return;

  try {
    // Filtra valores válidos
    const payload: Record<string, string | number> = {};
    
    Object.entries(eventData).forEach(([k, v]) => {
      if (v == null) return;
      if (typeof v === 'object') {
        payload[k] = JSON.stringify(v);
      } else if (typeof v === 'string' || typeof v === 'number') {
        payload[k] = v;
      }
    });
    
    // Envia o evento sem advanced matching
    // O advanced matching já foi configurado durante a inicialização do pixel
    // e o Meta usa automaticamente os cookies para associar os eventos
    window.fbq!('track', eventName, payload);
    
    // Registra os dados enviados para debug
    if (customerData) {
      console.log(`🎯 Evento ${eventName} rastreado com customerData disponível`, { 
        payload,
        customerDataFields: Object.keys(customerData).filter(k => customerData[k as keyof CustomerData]) 
      });
    } else {
      console.log(`🎯 Evento ${eventName} rastreado`, payload);
    }
  } catch (error) {
    console.error(`Erro ao enviar evento ${eventName} para o Meta Pixel:`, error);
  }
}
