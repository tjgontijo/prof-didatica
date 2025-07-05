/**
 * Utilitário para coletar dados de rastreamento do localStorage
 */

export interface LeadData {
  pixelId?: string;
  _id?: string;
  metaPixelIds?: string[];
  geolocation?: {
    country?: string;
    city?: string;
    state?: string;
    zipcode?: string;
  };
  userAgent?: string;
  ip?: string;
  ipv6?: string;
  fbc?: string;
  fbp?: string;
  updatedAt?: string;
  icTextMatch?: string | null;
  icCSSMatch?: string | null;
  icURLMatch?: string | null;
  leadTextMatch?: string | null;
  addToCartTextMatch?: string | null;
  ipConfiguration?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  parameters?: string;
  // Adicionando quaisquer outros campos que possam aparecer no futuro
  [key: string]: unknown;
}

export interface TrackingData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  multiFbc?: string;
  lead?: LeadData;
}

/**
 * Coleta dados de rastreamento do localStorage
 */
export function collectTrackingData(): TrackingData {
  // Função segura para obter dados do localStorage (funciona apenas no cliente)
  const getFromStorage = (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };

  // Coletar UTMs e outros parâmetros
  const trackingData: TrackingData = {
    utm_source: getFromStorage('utm_source') || undefined,
    utm_medium: getFromStorage('utm_medium') || undefined,
    utm_campaign: getFromStorage('utm_campaign') || undefined,
    utm_content: getFromStorage('utm_content') || undefined,
    utm_term: getFromStorage('utm_term') || undefined,
    multiFbc: getFromStorage('multiFbc') || undefined,
  };

  // Tentar obter e parsear os dados do lead
  try {
    const leadData = getFromStorage('lead');
    if (leadData) {
      const parsedLeadData = JSON.parse(leadData);
      console.log('Lead data coletado do localStorage:', parsedLeadData);
      trackingData.lead = parsedLeadData;
      
      // Se o lead contiver campo fbc, verificar se deve ser usado no multiFbc também
      if (parsedLeadData.fbc && !trackingData.multiFbc) {
        trackingData.multiFbc = parsedLeadData.fbc;
        console.log('Usando fbc do lead como multiFbc:', parsedLeadData.fbc);
      }
    }
  } catch (error) {
    console.error('Erro ao parsear dados do lead:', error);
  }
  
  console.log('TrackingData completo coletado:', trackingData);

  return trackingData;
}
// Quando fazemos o primeiro insert de order, aquela com o status em DRAFT ele já deveria inserir os valores de track no banco.