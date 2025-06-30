// src/app/api/tracking/event/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

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
  try {
    const data = await request.json() as TrackingEventRequest;
    
    // Verificar se a sessão existe
    const session = await prisma.$queryRaw<Array<{id: string, landingPage: string | null}>>`
      SELECT id, "landingPage" FROM "TrackingSession" WHERE id = ${data.trackingId} LIMIT 1
    `;

    if (!session || session.length === 0) {
      return NextResponse.json({ error: 'Sessão de rastreamento não encontrada' }, { status: 404 });
    }
    
    // Criar o evento de rastreamento no banco
    const event = await prisma.$queryRaw<Array<{id: string}>>`
      INSERT INTO "TrackingEvent" (
        "id", "trackingSessionId", "eventName", "eventId", 
        "payload", "status", "ip", "userAgent"
      )
      VALUES (
        gen_random_uuid(), ${data.trackingId}, ${data.eventName}, ${data.eventId},
        ${JSON.stringify(data.customData || {})}::jsonb, 'queued', ${data.ip}, ${data.userAgent}
      )
      RETURNING "id"
    `;
    
    const eventId = event[0]?.id;
    
    // Preparar dados para o CAPI do Meta
    const userData = prepareCAPIUserData(data, session[0] as any);
    const capiPayload = {
      event_name: data.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: (session[0]?.landingPage || ''),
      action_source: 'website',
      event_id: data.eventId,
      user_data: userData,
      custom_data: data.customData || {}
    };
    
    // Enviar para o Meta CAPI
    try {
      const response = await sendToMetaCAPI(capiPayload);
      
      // Atualizar o status do evento
      await prisma.$executeRaw`
        UPDATE "TrackingEvent"
        SET "status" = 'success', "response" = ${JSON.stringify(response || {})}::jsonb
        WHERE "id" = ${eventId}
      `;
    } catch (error) {
      console.error('Erro ao enviar para Meta CAPI:', error);
      
      // Atualizar o status do evento com erro
      await prisma.$executeRaw`
        UPDATE "TrackingEvent"
        SET "status" = 'error', "error" = ${error instanceof Error ? error.message : String(error)}
        WHERE "id" = ${eventId}
      `;
    }
    
    return NextResponse.json({ success: true, eventId: eventId });
  } catch (error) {
    console.error('Erro ao processar evento de rastreamento:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar evento' },
      { status: 500 }
    );
  }
}

interface TrackingSessionData {
  id: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  fbclid?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  landingPage?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

function prepareCAPIUserData(data: TrackingEventRequest, session: TrackingSessionData) {
  // Hash sensível dados para conformidade com CAPI
  const sha256 = (input: string) => {
    if (!input) return '';
    return crypto.createHash('sha256').update(input).digest('hex');
  };
  
  return {
    em: data.customer?.email ? sha256(data.customer.email.toLowerCase()) : undefined,
    ph: data.customer?.phone ? sha256(data.customer.phone) : undefined,
    fn: data.customer?.firstName ? sha256(data.customer.firstName) : undefined,
    ln: data.customer?.lastName ? sha256(data.customer.lastName) : undefined,
    st: data.customer?.state ? sha256(data.customer.state) : undefined,
    ct: data.customer?.city ? sha256(data.customer.city) : undefined,
    zp: data.customer?.zipCode ? sha256(data.customer.zipCode) : undefined,
    country: data.customer?.country ? sha256(data.customer.country) : undefined,
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
  
  const url = `https://graph.facebook.com/v16.0/${pixelId}/events?access_token=${accessToken}`;
  
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