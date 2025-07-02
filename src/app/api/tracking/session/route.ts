import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getGeoFromIp } from '@/modules/tracking/utils/ipAndLocation';

// Define o schema com validação Zod
const TrackingSessionSchema = z.object({
  trackingId: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  fbclid: z.string().optional(),
  fbp: z.string().optional(),
  fbc: z.string().optional(),
  landingPage: z.string().optional(),
  userAgent: z.string().optional(),
  ip: z.string().ip().optional()
});

export type TrackingSessionRequest = z.infer<typeof TrackingSessionSchema>;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const rawData = await request.json();

    // Validação com Zod
    const data = TrackingSessionSchema.parse(rawData);

    const {
      trackingId,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      fbclid,
      fbp,
      fbc,
      landingPage,
      userAgent,
      ip
    } = data;

    const geoData = ip ? await getGeoFromIp(ip) : null;

    const sessionData = {
      utmSource: utm_source,
      utmMedium: utm_medium,
      utmCampaign: utm_campaign,
      utmTerm: utm_term,
      utmContent: utm_content,
      fbclid,
      fbp,
      fbc,
      landingPage,
      userAgent,
      ip,
      country: geoData?.country,
      region: geoData?.region,
      city: geoData?.city,
      zip: geoData?.postal,
      lat: geoData?.latitude,
      lon: geoData?.longitude
    };

    let session;

    if (trackingId) {
      session = await prisma.trackingSession.update({
        where: { id: trackingId },
        data: sessionData
      });
    } else {
      const existingSession = await prisma.trackingSession.findFirst({
        where: {
          ip,
          userAgent,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (existingSession) {
        session = await prisma.trackingSession.update({
          where: { id: existingSession.id },
          data: sessionData
        });
      } else {
        session = await prisma.trackingSession.create({ data: sessionData });
      }
    }

    // Retornar o ID da sessão e os dados de geolocalização para o frontend
    return NextResponse.json({ 
      success: true, 
      id: session.id,
      geoData: geoData ? {
        city: geoData.city,
        region: geoData.region,
        postal: geoData.postal,
        country: geoData.country,
        latitude: geoData.latitude,
        longitude: geoData.longitude
      } : null
    });
  } catch (error: unknown) {
    console.error('[TRACKING_SESSION_ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno ao processar sessão';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
