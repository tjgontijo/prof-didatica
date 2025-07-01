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
    
    let session;
    
    // Dados comuns para criar/atualizar sessão
    const sessionData = {
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
    };
    
    // Verificar se o trackingId foi fornecido
    if (data.trackingId) {
      // Atualizar sessão existente
      session = await prisma.trackingSession.update({
        where: { id: data.trackingId },
        data: sessionData
      });
    } else {
      // Tentar encontrar sessão existente por IP e agente de usuário para evitar duplicações
      const existingSession = await prisma.trackingSession.findFirst({
        where: {
          ip: data.ip,
          userAgent: data.userAgent,
          // Considerar apenas sessões recentes (menos de 24 horas)
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      if (existingSession) {
        // Atualizar sessão existente
        session = await prisma.trackingSession.update({
          where: { id: existingSession.id },
          data: sessionData
        });
      } else {
        // Criar nova sessão (Prisma vai gerar ID com cuid())
        session = await prisma.trackingSession.create({
          data: sessionData
        });
      }
    }
    
    return NextResponse.json({ success: true, id: session.id });
  } catch (error) {
    console.error('Erro ao processar sessão de rastreamento:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar sessão' },
      { status: 500 }
    );
  }
}