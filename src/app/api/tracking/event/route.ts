import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Schema para validação dos dados do evento
const CustomerSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  externalId: z.string().optional()
}).optional();

const TrackingEventSchema = z.object({
  trackingSessionId: z.string(),
  orderId: z.string().optional(),
  eventName: z.string(),
  eventId: z.string(),

  ip: z.string().optional().nullable(),
  userAgent: z.string().optional(),
  customData: z.record(z.unknown()).optional(),
  customer: CustomerSchema
});

export type TrackingEventRequest = z.infer<typeof TrackingEventSchema>;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { payload } = await request.json();
    const data = TrackingEventSchema.parse(payload);
   
    console.log('[API EVENT] Dados recebidos:', {
      eventId: data.eventId,
      trackingId: data.trackingSessionId
    });
    
    console.log('[API EVENT] Buscando sessão com sessionId:', data.trackingSessionId);
    // Verificar se a sessão existe
    // Definindo um tipo mais específico para a sessão
    type TrackingSessionWithSessionId = {
      id: string;
      sessionId: string;
      fbp: string | null;
      fbc: string | null;
      ip: string | null;
      userAgent: string | null;
      country: string | null;
      city: string | null;
      region: string | null;
      zip: string | null;
      lat: number | null;
      lon: number | null;
      landingPage: string | null;
      createdAt: Date;
      // outros campos que possam existir
      [key: string]: unknown;
    };
    
    let session: TrackingSessionWithSessionId | null;
    try {
      // Busca a sessão pelo campo sessionId (não pelo campo id)
      // Usando findFirst com where como objeto genérico para evitar problemas de tipagem
      session = await prisma.trackingSession.findFirst({
        where: {           
          sessionId: data.trackingSessionId 
        }
      }) as TrackingSessionWithSessionId | null;

      if (!session) {
        console.log('[API EVENT] Sessão não encontrada com sessionId:', data.trackingSessionId);
        return NextResponse.json({ error: 'Sessão de rastreamento não encontrada' }, { status: 404 });
      }
      
      console.log('[API EVENT] Sessão encontrada:', { id: session.id, sessionId: session.sessionId });
    } catch (error) {
      console.error('[API EVENT] Erro ao buscar sessão:', error);
      return NextResponse.json({ error: 'Erro ao buscar sessão de rastreamento' }, { status: 500 });
    }
    
    console.log('[API EVENT] Criando evento no banco:', data.eventName);
    console.log('[API EVENT] Dados da sessão encontrada:', {
      id: session.id,
      sessionId: session.sessionId,
      trackingSessionId: data.trackingSessionId
    });
    
    // IMPORTANTE: Usar o ID da sessão (session.id) e não o sessionId 
    // O campo trackingSessionId na tabela TrackingEvent se refere ao campo id da tabela TrackingSession
    console.log('[API EVENT] Usando session.id como trackingSessionId para o evento:', session.id);
    
    // Criar o evento de rastreamento no banco
    const event = await prisma.trackingEvent.create({
      data: {
        trackingSessionId: session.id, // Usar o ID da sessão, não o sessionId
        eventName: data.eventName,
        // Usamos o eventId fornecido ou deixamos o Prisma gerar um novo
        eventId: data.eventId || crypto.randomUUID(),
        payload: data.customData ? JSON.parse(JSON.stringify(data.customData)) : {},
        status: 'queued',
        ip: data.ip,
        userAgent: data.userAgent
      }
    });
    
    console.log('[API EVENT] Evento criado com sucesso:', event.id);
    
    // Preparar dados para o CAPI do Meta
    // Converter a sessão para o formato esperado por prepareCAPIUserData
    const sessionForCAPI: TrackingSessionForCAPI = {
      id: session.id,
      sessionId: session.sessionId,
      fbp: session.fbp,
      fbc: session.fbc,
      ip: session.ip,
      userAgent: session.userAgent,
      country: session.country,
      city: session.city,
      region: session.region,
      zip: session.zip,
      lat: session.lat,
      lon: session.lon
    };
    
    const userData = prepareCAPIUserData(data, sessionForCAPI);
    console.log('[API EVENT] Dados de usuário preparados para CAPI:', userData);
    
    // Preparação do payload para Meta CAPI seguindo os padrões exatos
    // Primeiro, vamos processar e normalizar os dados do cliente se existirem
    let customData = { ...(data.customData || {}) };
    
    // Se for um evento AddPaymentInfo, remover dados não hashados do cliente
    if (data.eventName === 'AddPaymentInfo' && customData.customer) {
      // Remover dados do cliente do custom_data, pois já estão no user_data hashados
      const { ...restCustomData } = customData;
      customData = restCustomData;
      
      console.log('[API EVENT] Removendo dados não hashados do cliente do payload do AddPaymentInfo');
    }
    
    // Garantir que os nomes dos campos estejam corretos conforme documentação do Meta
    // Para eventos Purchase, garantir que temos os campos obrigatórios
    if (data.eventName === 'Purchase') {
      // Verificar se temos os campos obrigatórios
      if (!customData.value) {
        console.warn('[API EVENT] Evento Purchase sem valor definido');
      }
      
      // Garantir que o nome dos campos estejam corretos
      if (customData.order_id === undefined && customData.orderId !== undefined) {
        customData.order_id = customData.orderId;
        delete customData.orderId;
      }
      
      if (customData.content_name === undefined && customData.contentName !== undefined) {
        customData.content_name = customData.contentName;
        delete customData.contentName;
      }
    }
    
    const capiPayload = {
      // event_name: exatamente como especificado, com P maiúsculo para Purchase, etc.
      event_name: data.eventName,
      
      // event_time: timestamp Unix em segundos (não milissegundos)
      event_time: Math.floor(Date.now() / 1000),
      
      // event_source_url: URL completa da página
      event_source_url: session.landingPage || '',
      
      // action_source: sempre 'website' para eventos web
      action_source: 'website',
      
      // event_id: mesmo UUID usado no frontend para deduplicar eventos
      event_id: data.eventId,
      
      // user_data: dados do usuário normalizados e com hash SHA-256
      user_data: userData,
      
      // custom_data: dados específicos do evento, já normalizados
      custom_data: {
        // Garantir que os campos sigam os padrões exatos do Meta
        ...customData,
        
        // Garantir que currency seja BRL se não for especificado
        currency: (customData.currency as string) || 'BRL',
        
        // Garantir que content_type seja 'product' ou 'service' se não for especificado
        content_type: (customData.content_type as string) || 'product'
      }
    };
    
    // Log detalhado do payload para depuração
    console.log('[API EVENT] Payload preparado para Meta CAPI:', {
      event_name: capiPayload.event_name,
      event_id: capiPayload.event_id,
      custom_data: capiPayload.custom_data
    });
    
    // Enviar para o Meta CAPI
    try {
      console.log('[API EVENT] Enviando para Meta CAPI:', data.eventName);
      const response = await sendToMetaCAPI(capiPayload);
      
      // Atualizar o status do evento
      await prisma.trackingEvent.update({
        where: { id: event.id },
        data: {
          status: 'success',
          response: response ? JSON.parse(JSON.stringify(response)) : {}
        }
      });
      console.log('[API EVENT] Evento atualizado com sucesso no banco:', event.id);
    } catch (error) {
      console.error('Erro ao enviar para Meta CAPI:', error);
      
      // Atualizar o status do evento com erro
      await prisma.trackingEvent.update({
        where: { id: event.id },
        data: {
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
    
    console.log('[API EVENT] Retornando sucesso:', event.id);
    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    console.error('[API EVENT] Erro ao processar evento de rastreamento:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar evento' },
      { status: 500 }
    );
  }
}

interface TrackingSessionForCAPI {
  id: string;
  sessionId: string;
  fbp?: string | null;
  fbc?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  country?: string | null;
  city?: string | null;
  region?: string | null;
  zip?: string | null;
  lat?: number | null;
  lon?: number | null;
}

function prepareCAPIUserData(data: TrackingEventRequest, session: TrackingSessionForCAPI) {
  // Hash sensível dados para conformidade com CAPI
  const sha256 = (input: string) => {
    if (!input) return '';
    return crypto.createHash('sha256').update(input).digest('hex');
  };
  
  // Funções de normalização conforme padrões Meta CAPI
  const normalize = {
    // Remove espaços, acentos e converte para minúsculas
    text: (str: string | null | undefined): string => {
      if (!str) return '';
      return str.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove acentos
        .replace(/\s/g, '') // remove espaços
        .replace(/[^a-z0-9]/g, ''); // remove caracteres especiais
    },
    
    // Formata telefone: só dígitos, começando com 55 (BR)
    phone: (phone: string | null | undefined): string => {
      if (!phone) return '';
      const digits = phone.replace(/[^0-9]/g, '');
      // Adiciona código do país (55) se não existir
      if (digits.length > 0 && !digits.startsWith('55')) {
        return `55${digits}`;
      }
      return digits;
    },
    
    // Formata CEP: 8 dígitos sem hífen
    zipCode: (zip: string | null | undefined): string => {
      if (!zip) return '';
      return zip.replace(/[^0-9]/g, '');
    },
    
    // Formata país para ISO-3166 minúsculo
    country: (country: string | null | undefined): string => {
      if (!country) return '';
      // Se for Brasil ou Brazil, retorna 'br'
      if (/^bra[sz]il$/i.test(country.trim())) {
        return 'br';
      }
      return country.toLowerCase().trim().substring(0, 2);
    }
  };

  // Prepara os dados do usuário conforme padrões Meta CAPI
  return {
    // Email: minúsculas, sem espaço, SHA-256
    em: data.customer?.email ? sha256(data.customer.email.toLowerCase()) : undefined,
    
    // Telefone: só dígitos, começa com 55 (country code) + DDD + número, SHA-256
    ph: data.customer?.phone ? sha256(normalize.phone(data.customer.phone)) : undefined,
    
    // Nome: minúsculo, sem acento ou pontuação, SHA-256
    fn: data.customer?.firstName ? sha256(normalize.text(data.customer.firstName)) : undefined,
    
    // Sobrenome: minúsculo, sem acento ou pontuação, SHA-256
    ln: data.customer?.lastName ? sha256(normalize.text(data.customer.lastName)) : undefined,
    
    // Estado: por extenso, minúsculo, sem acento nem espaço, SHA-256
    st: data.customer?.state 
      ? sha256(normalize.text(data.customer.state)) 
      : (session.region ? sha256(normalize.text(session.region)) : undefined),
    
    // Cidade: minúsculo, sem acento, SHA-256
    ct: data.customer?.city 
      ? sha256(normalize.text(data.customer.city)) 
      : (session.city ? sha256(normalize.text(session.city)) : undefined),
    
    // CEP: 8 dígitos, sem hífen, SHA-256
    zp: data.customer?.zipCode 
      ? sha256(normalize.zipCode(data.customer.zipCode)) 
      : (session.zip ? sha256(normalize.zipCode(session.zip)) : undefined),
    
    // País: código ISO-3166 minúsculo (br), SHA-256
    country: data.customer?.country 
      ? sha256(normalize.country(data.customer.country)) 
      : (session.country ? sha256(normalize.country(session.country)) : undefined),
    
    // ID externo: ID interno do cliente, SHA-256
    external_id: sha256(data.trackingSessionId),
    
    // Cookies do Facebook: valores crus
    fbp: session.fbp || undefined,
    fbc: session.fbc || undefined,
    
    // IP do usuário (IPv4 ou IPv6)
    client_ip_address: session.ip || data.ip || undefined,
    
    // User Agent completo
    client_user_agent: session.userAgent || data.userAgent
  };
}

interface MetaEventPayload {
  event_name: string;
  event_time: number;
  event_source_url: string;
  action_source: string;
  event_id: string;
  user_data: Record<string, string | undefined>;
  custom_data: Record<string, unknown>;
}

interface MetaApiResponse {
  events_received?: number;
  messages?: string[];
  fbtrace_id?: string;
  error?: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
  };
}

async function sendToMetaCAPI(payload: MetaEventPayload): Promise<MetaApiResponse> {
  // Verificar se as variáveis de ambiente estão definidas
  if (!process.env.META_PIXEL_ID || !process.env.META_CAPI_TOKEN) {
    console.warn('[META CAPI] Configurações do Meta CAPI não definidas. Evento será registrado apenas localmente.');
    // Retornar uma resposta simulada para não interromper o fluxo
    return {
      events_received: 0,
      messages: ['Configurações do Meta CAPI não definidas']
    };
  }
  
  try {
    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_CAPI_TOKEN;
    
    // Validar e limpar o payload antes de enviar
    // Remover campos undefined ou null para evitar erros de validação
    const cleanUserData: Record<string, string> = {};
    Object.entries(payload.user_data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cleanUserData[key] = value;
      }
    });
    
    // Limpar custom_data também
    const cleanCustomData: Record<string, unknown> = {};
    Object.entries(payload.custom_data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cleanCustomData[key] = value;
      }
    });
    
    // Garantir que campos obrigatórios para o evento Purchase estejam presentes
    if (payload.event_name === 'Purchase' && !cleanCustomData.value) {
      console.warn('[META CAPI] Evento Purchase sem valor definido');
      // Adicionar valor padrão para evitar erro
      cleanCustomData.value = 0;
    }
    
    // Criar payload limpo
    const cleanPayload = {
      ...payload,
      user_data: cleanUserData,
      custom_data: cleanCustomData
    };
    
    console.log('[META CAPI] Enviando payload limpo:', {
      event_name: cleanPayload.event_name,
      event_id: cleanPayload.event_id,
      user_data_keys: Object.keys(cleanPayload.user_data),
      custom_data: cleanPayload.custom_data
    });
    
    const url = `https://graph.facebook.com/v23.0/${pixelId}/events?access_token=${accessToken}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: [cleanPayload]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[META CAPI] Erro na resposta: ${response.status} ${response.statusText}`, errorText);
      return {
        error: {
          message: `Erro ao enviar para Meta CAPI: ${response.status} ${response.statusText}`,
          type: 'api_error',
          code: response.status
        }
      };
    }
    
    const responseData = await response.json();
    console.log('[META CAPI] Resposta do servidor:', responseData);
    return responseData;
  } catch (error) {
    console.error('[META CAPI] Erro ao enviar evento:', error);
    // Retornar uma resposta de erro para que o sistema continue funcionando
    return {
      error: {
        message: error instanceof Error ? error.message : String(error),
        type: 'api_error',
        code: 500
      }
    };
  }
}