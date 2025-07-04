import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// ——— SCHEMAS DRY ———
const textField = z.string().optional()

const CustomerSchema = z.object({
  email: textField,
  phone:   textField,
  firstName: textField,
  lastName:  textField,
  state:     textField,
  city:      textField,
  zipCode:   textField,
  country:   textField,
  externalId:textField,
}).optional()

const TrackingEventSchema = z.object({
  trackingSessionId: z.string(),
  orderId:           z.string().optional(),
  eventName:         z.string(),
  eventId:           z.string(),
  ip:       z.string().nullable().optional(),
  userAgent:z.string().optional(),
  customData:z.record(z.unknown()).optional(),
  customer: CustomerSchema,
})

export type TrackingEventRequest = z.infer<typeof TrackingEventSchema>

// ——— HELPERS DE RESPOSTA ———
function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status })
}

function handleError(e: unknown) {
  if (e instanceof z.ZodError) {
    return json({ success: false, error: e.errors }, 422)
  }
  const msg = e instanceof Error ? e.message : 'Erro inesperado'
  return json({ success: false, error: msg }, 500)
}

// ——— NORMALIZAÇÃO E HASH PARA CAPI ———
function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex')
}

function normalizeText(s?: string): string {
  return s
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s/g, '')
    .replace(/[^a-z0-9]/g, '') ?? ''
}

function normalizePhone(s?: string): string {
  const d = s?.replace(/\D/g, '') ?? ''
  return d.startsWith('55') ? d : `55${d}`
}

// agora limita ao CEP de 5 dígitos
function normalizeZip(s?: string): string {
  const digits = s?.replace(/\D/g, '') ?? ''
  return digits.slice(0, 5)
}

function normalizeCountry(s?: string): string {
  if (!s) return ''
  if (/^bra[sz]il$/i.test(s)) return 'br'
  return s.slice(0, 2).toLowerCase()
}

interface TrackingSessionForCAPI {
  id: string
  sessionId: string
  fbp?: string | null
  fbc?: string | null
  ip?: string | null
  userAgent?: string | null
  country?: string | null
  city?: string | null
  region?: string | null
  zip?: string | null
  lat?: number | null
  lon?: number | null
}

function prepareCAPIUserData(
  data: TrackingEventRequest,
  session: TrackingSessionForCAPI
): Record<string, string | undefined> {
  const cust = data.customer ?? {}

  return {
    em: cust.email     ? sha256(cust.email.toLowerCase())            : undefined,
    ph: cust.phone     ? sha256(normalizePhone(cust.phone))          : undefined,
    fn: cust.firstName ? sha256(normalizeText(cust.firstName))       : undefined,
    ln: cust.lastName  ? sha256(normalizeText(cust.lastName))        : undefined,
    st: cust.state
      ? sha256(normalizeText(cust.state))
      : session.region
      ? sha256(normalizeText(session.region))
      : undefined,
    ct: cust.city
      ? sha256(normalizeText(cust.city))
      : session.city
      ? sha256(normalizeText(session.city))
      : undefined,
    zp: cust.zipCode
      ? sha256(normalizeZip(cust.zipCode))
      : session.zip
      ? sha256(normalizeZip(session.zip))
      : undefined,
    country: cust.country
      ? sha256(normalizeCountry(cust.country))
      : session.country
      ? sha256(normalizeCountry(session.country))
      : undefined,
    external_id: sha256(data.trackingSessionId),
    fbp: session.fbp   ?? undefined,
    fbc: session.fbc   ?? undefined,
    client_ip_address: session.ip     ?? data.ip        ?? undefined,
    client_user_agent: session.userAgent ?? data.userAgent ?? undefined,
  }
}

// ——— PAYLOAD E ENVIO AO META CAPI ———
interface MetaEventPayload {
  event_name:      string
  event_time:      number
  event_source_url:string
  action_source:   string
  event_id:        string
  user_data:       Record<string, string | undefined>
  custom_data:     Record<string, unknown>
}

interface MetaApiResponse {
  events_received?: number
  messages?:        string[]
  fbtrace_id?:      string
  error?: {
    message: string
    type:    string
    code:    number
    error_subcode?: number
  }
}

async function sendToMetaCAPI(payload: MetaEventPayload): Promise<MetaApiResponse> {
  const pixelId     = process.env.META_PIXEL_ID
  const accessToken = process.env.META_CAPI_TOKEN

  if (!pixelId || !accessToken) {
    return { messages: ['Meta CAPI não configurado'] }
  }

  const user_data = Object.fromEntries(
    Object.entries(payload.user_data).filter(([, v]) => v != null)
  )
  const custom_data = Object.fromEntries(
    Object.entries(payload.custom_data).filter(([, v]) => v != null)
  )

  const cleanPayload = {
    ...payload,
    user_data,
    custom_data: {
      currency:     (custom_data.currency as string) || 'BRL',
      content_type: (custom_data.content_type as string) || 'product',
      ...custom_data,
    },
  }

  const url = `https://graph.facebook.com/v23.0/${pixelId}/events?access_token=${accessToken}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [cleanPayload] }),
  })

  if (!res.ok) {
    return {
      error: {
        message: `Erro ${res.status}: ${res.statusText}`,
        type:    'api_error',
        code:     res.status,
      },
    }
  }

  return res.json()
}

// ——— HANDLER POST ———
export async function POST(request: NextRequest) {
  try {
    const { payload } = await request.json()
    const data       = TrackingEventSchema.parse(payload)

    const session = await prisma.trackingSession.findUnique({
      where: { sessionId: data.trackingSessionId },
    })
    if (!session) {
      return json({ success: false, error: 'Sessão não encontrada' }, 404)
    }

    const event = await prisma.trackingEvent.create({
      data: {
        trackingSessionId: session.id,
        eventName:         data.eventName,
        eventId:           data.eventId || crypto.randomUUID(),
        payload:           data.customData ? JSON.parse(JSON.stringify(data.customData)) : {},
        status:            'queued',
        ip:                data.ip,
        userAgent:         data.userAgent,
      },
    })

    const sessionForCAPI: TrackingSessionForCAPI = { ...session }
    const userData  = prepareCAPIUserData(data, sessionForCAPI)
    const capiPayload: MetaEventPayload = {
      event_name:      data.eventName,
      event_time:      Math.floor(Date.now() / 1000),
      event_source_url: session.landingPage || '',
      action_source:   'website',
      event_id:        data.eventId,
      user_data:       userData,
      custom_data:     data.customData || {},
    }

    try {
      const response = await sendToMetaCAPI(capiPayload)
      await prisma.trackingEvent.update({
        where: { id: event.id },
        data:  {
          status:   'success',
          response: response ? JSON.parse(JSON.stringify(response)) : {},
        },
      })
    } catch (e) {
      await prisma.trackingEvent.update({
        where: { id: event.id },
        data:  {
          status: 'error',
          error:  e instanceof Error ? e.message : String(e),
        },
      })
    }

    return json({ success: true, eventId: event.id })
  } catch (e) {
    return handleError(e)
  }
}
