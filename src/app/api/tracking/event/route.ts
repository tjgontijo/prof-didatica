// src/app/api/tracking/event/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

interface TrackingEventRequest {
  trackingId: string;
  eventName: string;
  eventId: string;
  customData?: Record<string, unknown>;
  userAgent?: string;
  ip?: string;
  customer?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    externalId?: string;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('[API EVENT] Recebendo requisição de evento');
  try {
    const data = await request.json() as TrackingEventRequest;
    console.log('[API EVENT] Dados recebidos:', {
      eventName: data.eventName,
      eventId: data.eventId,
      trackingId: data.trackingId
    });
    
    console.log('[API EVENT] Buscando sessão:', data.trackingId);
    // Verificar se a sessão existe
    const session = await prisma.trackingSession.findUnique({
      where: { id: data.trackingId }
    });

    if (!session) {
      console.log('[API EVENT] Sessão não encontrada:', data.trackingId);
      return NextResponse.json({ error: 'Sessão de rastreamento não encontrada' }, { status: 404 });
    }
    
    console.log('[API EVENT] Criando evento no banco:', data.eventName);
    // Criar o evento de rastreamento no banco
    const event = await prisma.trackingEvent.create({
      data: {
        trackingSessionId: data.trackingId,
        eventName: data.eventName,
        eventId: data.eventId,
        payload: data.customData ? JSON.parse(JSON.stringify(data.customData)) : {},
        status: 'queued',
        ip: data.ip,
        userAgent: data.userAgent
      }
    });
    
    console.log('[API EVENT] Evento criado com sucesso:', event.id);
    
    // Preparar dados para o CAPI do Meta
    const userData = prepareCAPIUserData(data, session);
    console.log('[API EVENT] Dados de usuário preparados para CAPI:', userData);
    
    const capiPayload = {
      event_name: data.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: session.landingPage || '',
      action_source: 'website',
      event_id: data.eventId,
      user_data: userData,
      custom_data: data.customData || {}
    };
    
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
  
  // Priorizar dados do cliente, mas usar dados da sessão como fallback
  return {
    em: data.customer?.email ? sha256(data.customer.email.toLowerCase()) : undefined,
    ph: data.customer?.phone ? sha256(data.customer.phone) : undefined,
    fn: data.customer?.firstName ? sha256(data.customer.firstName) : undefined,
    ln: data.customer?.lastName ? sha256(data.customer.lastName) : undefined,
    st: data.customer?.state ? sha256(data.customer.state) : (session.region ? sha256(session.region) : undefined),
    ct: data.customer?.city ? sha256(data.customer.city) : (session.city ? sha256(session.city) : undefined),
    zp: data.customer?.zipCode ? sha256(data.customer.zipCode) : (session.zip ? sha256(session.zip) : undefined),
    country: data.customer?.country ? sha256(data.customer.country) : (session.country ? sha256(session.country) : undefined),
    external_id: data.customer?.externalId ? sha256(data.customer.externalId) : undefined,
    fbp: session.fbp || undefined,
    fbc: session.fbc || undefined,
    client_ip_address: session.ip || data.ip,
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
  if (!process.env.META_PIXEL_ID || !process.env.META_CAPI_TOKEN) {
    throw new Error('Configurações do Meta CAPI não definidas');
  }
  
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_TOKEN;
  
  const url = `https://graph.facebook.com/v23.0/${pixelId}/events?access_token=${accessToken}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      data: [payload]
    })
  });
  
  return response.json();
}