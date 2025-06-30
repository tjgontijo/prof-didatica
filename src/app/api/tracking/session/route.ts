// src/app/api/tracking/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TrackingSessionRequest {
  trackingId: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  fbclid?: string;
  fbp?: string;
  fbc?: string;
  landingPage?: string;
  userAgent?: string;
  ip?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await request.json() as TrackingSessionRequest;
    
    // Enriquecimento de dados geográficos via IP
    let geoData = null;
    if (data.ip) {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${data.ip}?fields=status,country,regionName,city,zip,lat,lon`);
        if (geoResponse.ok) {
          geoData = await geoResponse.json();
        }
      } catch (error) {
        console.error('Erro ao buscar dados geográficos:', error);
      }
    }
    
    // Upsert na tabela TrackingSession
    const session = await prisma.trackingSession.upsert({
      where: { id: data.trackingId },
      update: {
        utmSource: data.utm_source,
        utmMedium: data.utm_medium,
        utmCampaign: data.utm_campaign,
        utmTerm: data.utm_term,
        utmContent: data.utm_content,
        fbclid: data.fbclid,
        fbp: data.fbp,
        fbc: data.fbc,
        landingPage: data.landingPage,
        userAgent: data.userAgent,
        ip: data.ip,
        country: geoData?.status === 'success' ? geoData.country : null,
        region: geoData?.status === 'success' ? geoData.regionName : null,
        city: geoData?.status === 'success' ? geoData.city : null,
        zip: geoData?.status === 'success' ? geoData.zip : null,
        lat: geoData?.status === 'success' ? geoData.lat : null,
        lon: geoData?.status === 'success' ? geoData.lon : null
      },
      create: {
        id: data.trackingId,
        utmSource: data.utm_source,
        utmMedium: data.utm_medium,
        utmCampaign: data.utm_campaign,
        utmTerm: data.utm_term,
        utmContent: data.utm_content,
        fbclid: data.fbclid,
        fbp: data.fbp,
        fbc: data.fbc,
        landingPage: data.landingPage,
        userAgent: data.userAgent,
        ip: data.ip,
        country: geoData?.status === 'success' ? geoData.country : null,
        region: geoData?.status === 'success' ? geoData.regionName : null,
        city: geoData?.status === 'success' ? geoData.city : null,
        zip: geoData?.status === 'success' ? geoData.zip : null,
        lat: geoData?.status === 'success' ? geoData.lat : null,
        lon: geoData?.status === 'success' ? geoData.lon : null
      }
    });
    
    return NextResponse.json({ success: true, id: session.id });
  } catch (error) {
    console.error('Erro ao processar sessão de rastreamento:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar sessão' },
      { status: 500 }
    );
  }
}