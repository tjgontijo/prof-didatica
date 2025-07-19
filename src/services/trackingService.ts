import { v4 as uuidv4 } from 'uuid';

// Chave usada para armazenar os dados no localStorage
const TRACKING_SESSION_KEY = '_ab_tracking_session';

// Interface para o objeto de sessão de rastreamento
interface TrackingSession {
  sessionId: string;
  visitorId: string;
  testName?: string;
  variant?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  fbclid?: string;
  createdAt: number; // timestamp para controle de expiração
}

/**
 * Gera um ID de visitante baseado em informações do navegador
 * Simplificado para demonstração - em produção, considere usar FingerprintJS
 */
const generateVisitorId = (): string => {
  try {
    const existingVisitorId = localStorage.getItem('_visitor_id');
    if (existingVisitorId) return existingVisitorId;
    
    // Gerar um ID simples baseado em UUID
    const visitorId = `visitor-${uuidv4().slice(0, 8)}`;
    
    // Salvar para uso futuro
    localStorage.setItem('_visitor_id', visitorId);
    return visitorId;
  } catch (error) {
    console.error('Erro ao gerar ID do visitante:', error);
    return `visitor-${Date.now().toString(36)}`;
  }
};

/**
 * Lê os cookies de rastreamento definidos pelo middleware
 */
const readTrackingCookies = (): Partial<TrackingSession> => {
  try {
    if (typeof document === 'undefined') return {};
    
    const cookies = document.cookie.split(';');
    const params: Partial<TrackingSession> = {};
    
    // Função auxiliar para ler um cookie específico
    const getCookieValue = (name: string): string | undefined => {
      const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
      return cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined;
    };
    
    // Ler cookies de UTM
    const utmSource = getCookieValue('utm_source');
    if (utmSource) params.utmSource = utmSource;
    
    const utmMedium = getCookieValue('utm_medium');
    if (utmMedium) params.utmMedium = utmMedium;
    
    const utmCampaign = getCookieValue('utm_campaign');
    if (utmCampaign) params.utmCampaign = utmCampaign;
    
    const utmContent = getCookieValue('utm_content');
    if (utmContent) params.utmContent = utmContent;
    
    const utmTerm = getCookieValue('utm_term');
    if (utmTerm) params.utmTerm = utmTerm;
    
    // Ler cookie de fbclid
    const fbclid = getCookieValue('fbclid');
    if (fbclid) params.fbclid = fbclid;
    
    // Ler cookie de sessionId
    const sessionId = getCookieValue('session_id');
    if (sessionId) params.sessionId = sessionId;
    
    // Ler cookie de visitorId
    const visitorId = getCookieValue('visitor-id');
    if (visitorId) params.visitorId = visitorId;
    
    return params;
  } catch (error) {
    console.error('Erro ao ler cookies de rastreamento:', error);
    return {};
  }
};

/**
 * Coleta os parâmetros UTM e fbclid da URL atual
 * Usado como fallback caso os cookies não estejam disponíveis
 */
const collectUtmParams = (): Partial<TrackingSession> => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const params: Partial<TrackingSession> = {};
    
    // Coletar parâmetros UTM
    const utmSource = urlParams.get('utm_source');
    if (utmSource) params.utmSource = utmSource;
    
    const utmMedium = urlParams.get('utm_medium');
    if (utmMedium) params.utmMedium = utmMedium;
    
    const utmCampaign = urlParams.get('utm_campaign');
    if (utmCampaign) params.utmCampaign = utmCampaign;
    
    const utmContent = urlParams.get('utm_content');
    if (utmContent) params.utmContent = utmContent;
    
    const utmTerm = urlParams.get('utm_term');
    if (utmTerm) params.utmTerm = utmTerm;
    
    // Coletar fbclid
    const fbclid = urlParams.get('fbclid');
    if (fbclid) {
      params.fbclid = fbclid;
      
      // Se tiver fbclid e não tiver utm_source, assume que veio do Facebook
      if (!params.utmSource) {
        params.utmSource = 'facebook';
        params.utmMedium = params.utmMedium || 'social';
        params.utmCampaign = params.utmCampaign || 'facebook_ads';
      }
    }
    
    return params;
  } catch (error) {
    console.error('Erro ao coletar parâmetros UTM da URL:', error);
    return {};
  }
};

/**
 * Inicializa ou recupera a sessão de rastreamento
 */
export const initTrackingSession = (testName?: string, variant?: string): TrackingSession => {
  try {
    // Verificar se já existe uma sessão no localStorage
    const existingSessionJson = localStorage.getItem(TRACKING_SESSION_KEY);
    let session: TrackingSession | null = null;
    
    if (existingSessionJson) {
      try {
        session = JSON.parse(existingSessionJson);
        
        // Verificar se a sessão expirou (30 minutos = 1800000 ms)
        const sessionAge = Date.now() - (session?.createdAt || 0);
        if (sessionAge > 1800000) {
          // Sessão expirada, criar nova
          session = null;
        }
      } catch (e) {
        console.error('Erro ao analisar sessão existente:', e);
        session = null;
      }
    }
    
    // Se não existe sessão ou está expirada, criar nova
    if (!session) {
      // Ler cookies definidos pelo middleware
      const cookieParams = readTrackingCookies();
      
      // Usar sessionId do cookie ou gerar um novo
      const sessionId = cookieParams.sessionId || uuidv4();
      
      // Usar visitorId do cookie ou gerar um novo
      const visitorId = cookieParams.visitorId || generateVisitorId();
      
      // Coletar parâmetros UTM da URL como fallback
      const urlUtmParams = collectUtmParams();
      
      // Criar nova sessão combinando cookies e parâmetros da URL
      session = {
        sessionId,
        visitorId,
        // Priorizar parâmetros dos cookies, depois da URL
        ...urlUtmParams,
        ...cookieParams,
        // Garantir que testName e variant sejam os fornecidos
        testName: testName || cookieParams.testName,
        variant: variant || cookieParams.variant,
        createdAt: Date.now()
      };
      
      // Salvar no localStorage
      localStorage.setItem(TRACKING_SESSION_KEY, JSON.stringify(session));
    } else {
      // Atualizar testName e variant se fornecidos e diferentes
      let updated = false;
      
      if (testName && (!session.testName || session.testName !== testName)) {
        session.testName = testName;
        updated = true;
      }
      
      if (variant && (!session.variant || session.variant !== variant)) {
        session.variant = variant;
        updated = true;
      }
      
      // Verificar se há novos parâmetros nos cookies que não estão na sessão
      const cookieParams = readTrackingCookies();
      
      // Garantir que session não é null
      if (session) {
        // Atualizar campos específicos de forma segura
        if (cookieParams.utmSource && !session.utmSource) {
          session.utmSource = cookieParams.utmSource;
          updated = true;
        }
        if (cookieParams.utmMedium && !session.utmMedium) {
          session.utmMedium = cookieParams.utmMedium;
          updated = true;
        }
        if (cookieParams.utmCampaign && !session.utmCampaign) {
          session.utmCampaign = cookieParams.utmCampaign;
          updated = true;
        }
        if (cookieParams.utmContent && !session.utmContent) {
          session.utmContent = cookieParams.utmContent;
          updated = true;
        }
        if (cookieParams.utmTerm && !session.utmTerm) {
          session.utmTerm = cookieParams.utmTerm;
          updated = true;
        }
        if (cookieParams.fbclid && !session.fbclid) {
          session.fbclid = cookieParams.fbclid;
          updated = true;
        }
      }
      
      // Se houve atualização, salvar novamente
      if (updated && session) {
        localStorage.setItem(TRACKING_SESSION_KEY, JSON.stringify(session));
      }
    }
    
    return session;
  } catch (error) {
    console.error('Erro ao inicializar sessão de rastreamento:', error);
    
    // Fallback para uma sessão básica
    const fallbackSession: TrackingSession = {
      sessionId: `fallback-${Date.now()}`,
      visitorId: 'unknown',
      testName,
      variant,
      createdAt: Date.now()
    };
    
    return fallbackSession;
  }
};

/**
 * Recupera a sessão de rastreamento atual
 */
export const getTrackingSession = (): TrackingSession | null => {
  try {
    const sessionJson = localStorage.getItem(TRACKING_SESSION_KEY);
    return sessionJson ? JSON.parse(sessionJson) : null;
  } catch (error) {
    console.error('Erro ao recuperar sessão de rastreamento:', error);
    return null;
  }
};

/**
 * Atualiza um campo específico na sessão de rastreamento
 */
export const updateTrackingSession = (updates: Partial<TrackingSession>): TrackingSession | null => {
  try {
    const session = getTrackingSession();
    if (!session) return null;
    
    // Aplicar atualizações
    const updatedSession = { ...session, ...updates };
    
    // Salvar no localStorage
    localStorage.setItem(TRACKING_SESSION_KEY, JSON.stringify(updatedSession));
    
    return updatedSession;
  } catch (error) {
    console.error('Erro ao atualizar sessão de rastreamento:', error);
    return null;
  }
};

/**
 * Constrói uma URL com os parâmetros UTM da sessão atual
 */
export const buildUrlWithTracking = (baseUrl: string): string => {
  try {
    const session = getTrackingSession();
    if (!session) return baseUrl;
    try {
      const url = new URL(baseUrl);
      const params = new URLSearchParams(url.search);
      
      // Adicionar parâmetros UTM da sessão
      if (session?.utmSource) params.set('utm_source', session.utmSource);
      if (session?.utmMedium) params.set('utm_medium', session.utmMedium);
      if (session?.utmCampaign) params.set('utm_campaign', session.utmCampaign);
      if (session?.utmContent) params.set('utm_content', session.utmContent);
      if (session?.utmTerm) params.set('utm_term', session.utmTerm);
      if (session?.fbclid) params.set('fbclid', session.fbclid);
      
      // Adicionar sessionId como parâmetro sck
      if (session?.sessionId) params.set('sck', session.sessionId);
      
      // Atualizar a URL com os parâmetros
      url.search = params.toString();
      
      return url.toString();
    } catch (error) {
      console.error('Erro ao construir URL com rastreamento:', error);
      return baseUrl;
    }
  } catch (error) {
    console.error('Erro ao construir URL com rastreamento:', error);
    return baseUrl;
  }
};
