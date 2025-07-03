import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Schema para validar os dados recebidos na requisição
const TrackingSessionSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  fbclid: z.string().optional(),
  fbp: z.string().optional(),
  fbc: z.string().optional(),
  landingPage: z.string().optional(),
  userAgent: z.string().optional(),
  ip: z.string().optional().nullable(),
  city: z.string().optional(),
  region: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  lat: z.number().optional(),
  lon: z.number().optional()
});

export type TrackingSessionRequest = z.infer<typeof TrackingSessionSchema>;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('[API Tracking] Recebendo requisição POST para /api/tracking/session');
    const rawData = await request.json();
    console.log('[API Tracking] Dados recebidos:', JSON.stringify(rawData, null, 2));
    
    // Extrair dados de tracking do formato enviado pelo hook useTracking
    let sessionId, utmSource, utmMedium, utmCampaign, utmTerm, utmContent, 
        fbclid, fbp, fbc, landingPage, userAgent, ip, city, region, zip, country, lat, lon;
    
    // Verificar se os dados estão no formato esperado ou no formato enviado pelo hook
    if (rawData.id && rawData.sessionId) {
      console.log('[API Tracking] Processando dados no formato direto do schema');
      // Formato direto do schema
      const data = TrackingSessionSchema.parse(rawData);
      
      ({
        sessionId,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
        fbp,
        fbc,
        landingPage,
        userAgent,
        ip,
        city,
        region,
        zip,
        country,
        lat,
        lon
      } = data);
    } else if (rawData.sessionId) {
      console.log('[API Tracking] Processando dados no formato simplificado');
      // Formato simplificado enviado pelo hook useTracking após refatoração
      sessionId = rawData.sessionId;
      userAgent = rawData.userAgent;
      
      // Mapear campos UTM do formato enviado pelo frontend
      utmSource = rawData.utm_source;
      utmMedium = rawData.utm_medium;
      utmCampaign = rawData.utm_campaign;
      utmTerm = rawData.utm_term;
      utmContent = rawData.utm_content;
      
      // Mapear outros campos
      fbclid = rawData.fbclid;
      fbp = rawData.fbp;
      fbc = rawData.fbc;
      landingPage = rawData.landingPage;
      
      // Mapear campos de geolocalização
      ip = rawData.clientIpAddress || rawData.ip;
      city = rawData.city;
      region = rawData.region;
      zip = rawData.zip;
      country = rawData.country;
      lat = rawData.lat;
      lon = rawData.lon;
    } else if (rawData.urlParams && rawData.geoData) {
      console.log('[API Tracking] Processando dados no formato antigo (urlParams/geoData)');
      // Formato antigo enviado pelo hook useTracking
      sessionId = rawData.sessionId;
      userAgent = rawData.clientUserAgent;
      
      // Extrair parâmetros de URL
      const urlParams = rawData.urlParams || {};
      utmSource = urlParams.utmSource;
      utmMedium = urlParams.utmMedium;
      utmCampaign = urlParams.utmCampaign;
      utmTerm = urlParams.utmTerm;
      utmContent = urlParams.utmContent;
      fbclid = urlParams.fbclid;
      fbp = urlParams.fbp;
      fbc = urlParams.fbc;
      landingPage = urlParams.landingPage;
      
      // Extrair dados de geolocalização
      const geoData = rawData.geoData || {};
      ip = geoData.clientIpAddress;
      city = geoData.city;
      region = geoData.region;
      zip = geoData.zip;
      country = geoData.country;
      lat = geoData.lat;
      lon = geoData.lon;
    } else {
      console.error('[API Tracking] Formato de dados inválido:', rawData);
      throw new Error('Formato de dados inválido');
    }
    
    console.log('[API Tracking] Dados processados:', { 
      sessionId, 
      utmSource, 
      utmMedium, 
      utmCampaign, 
      utmTerm, 
      utmContent, 
      fbclid, 
      fbp, 
      fbc, 
      landingPage, 
      userAgent, 
      ip, 
      city, 
      region, 
      zip, 
      country, 
      lat, 
      lon 
    });

    // Verificar se já existe uma sessão com este sessionId
    console.log('[API Tracking] Buscando sessão existente com sessionId:', sessionId);
    try {
      const existingSession = await prisma.trackingSession.findUnique({
        where: { sessionId: sessionId }
      });
      
      console.log('[API Tracking] Resultado da busca:', existingSession ? 'Sessão encontrada' : 'Sessão não encontrada');

      if (existingSession) {
        console.log('[API Tracking] Atualizando sessão existente:', existingSession.id);
        try {
          // Atualizar a sessão existente
          // Nota: Não temos um campo lastActivity no schema, então vamos apenas retornar a sessão existente
          const updatedSession = await prisma.trackingSession.findUnique({
            where: { sessionId: sessionId }
          });
          
          if (!updatedSession) {
            throw new Error('Sessão não encontrada após confirmação de existência');
          }
          
          console.log('[API Tracking] Sessão atualizada com sucesso');
          return NextResponse.json({ 
            success: true, 
            id: updatedSession.id,
            sessionId: updatedSession.sessionId,
            isNewSession: false
          });
        } catch (updateError) {
          console.error('[API Tracking] Erro ao atualizar sessão:', updateError);
          throw updateError;
        }
      }

      console.log('[API Tracking] Criando nova sessão com sessionId:', sessionId);
      try {
        // Criar uma nova sessão (id gerado automaticamente pelo Prisma)
        const session = await prisma.trackingSession.create({
          data: {
            sessionId,
            utmSource,
            utmMedium,
            utmCampaign,
            utmTerm,
            utmContent,
            fbclid,
            fbp,
            fbc,
            landingPage,
            userAgent,
            ip,
            city,
            region,
            zip,
            country,
            lat,
            lon
            // lastActivity removido pois não existe no schema
          }
        });
        
        console.log('[API Tracking] Nova sessão criada com sucesso, id:', session.id);
        // Retornar o ID da sessão e o sessionId para o frontend
        return NextResponse.json({ 
          success: true, 
          id: session.id,
          sessionId: session.sessionId,
          isNewSession: true
        });
      } catch (createError) {
        console.error('[API Tracking] Erro ao criar sessão:', createError);
        throw createError;
      }
    } catch (findError) {
      console.error('[API Tracking] Erro ao buscar sessão:', findError);
      throw findError;
    }
  } catch (error: unknown) {
    console.error('[API Tracking] Erro na API de sessão:', error);
    
    // Capturar detalhes do erro para debug
    let errorMessage = 'Erro interno ao processar sessão';
    let errorDetails = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        stack: error.stack,
        // Convertendo para Record<string, unknown> para evitar erro de tipo unknown
        cause: error instanceof Error && 'cause' in error ? error.cause as Record<string, unknown> : undefined
      };
      
      // Log especial para erros do Prisma
      if (error.name === 'PrismaClientKnownRequestError' || 
          error.name === 'PrismaClientValidationError' ||
          error.name.includes('Prisma')) {
        console.error('[API Tracking] Erro do Prisma:', JSON.stringify(error, null, 2));
      }
    }
    
    console.error('[API Tracking] Detalhes completos do erro:', { errorMessage, errorDetails });
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined 
      },
      { status: 500 }
    );
  }
}

/**
 * Atualiza apenas os campos fbp e fbc de uma sessão existente
 * Usado após a inicialização do Meta Pixel, quando os cookies já estão disponíveis
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('[API Tracking] Recebendo requisição PATCH para /api/tracking/session');
    const rawData = await request.json();
    console.log('[API Tracking] Dados recebidos:', JSON.stringify(rawData, null, 2));
    
    // Extrair apenas sessionId, fbp e fbc
    const { sessionId, fbp, fbc } = rawData;
    
    if (!sessionId) {
      console.error('[API Tracking] PATCH: sessionId é obrigatório');
      return NextResponse.json({ success: false, error: 'sessionId é obrigatório' }, { status: 400 });
    }
    
    // Verificar se pelo menos um dos campos a serem atualizados está presente
    if (!fbp && !fbc) {
      console.error('[API Tracking] PATCH: pelo menos um dos campos fbp ou fbc deve ser fornecido');
      return NextResponse.json({ success: false, error: 'Pelo menos um dos campos fbp ou fbc deve ser fornecido' }, { status: 400 });
    }
    
    // Buscar a sessão existente
    console.log('[API Tracking] PATCH: Buscando sessão com sessionId:', sessionId);
    const existingSession = await prisma.trackingSession.findUnique({
      where: { sessionId: sessionId }
    });
    
    if (!existingSession) {
      console.error('[API Tracking] PATCH: Sessão não encontrada para o sessionId:', sessionId);
      return NextResponse.json({ success: false, error: 'Sessão não encontrada' }, { status: 404 });
    }
    
    // Preparar dados para atualização (apenas os campos fornecidos)
    const updateData: { fbp?: string; fbc?: string } = {};
    if (fbp) updateData.fbp = fbp;
    if (fbc) updateData.fbc = fbc;
    
    // Atualizar a sessão
    console.log('[API Tracking] PATCH: Atualizando campos fbp/fbc da sessão:', existingSession.id);
    const updatedSession = await prisma.trackingSession.update({
      where: { id: existingSession.id },
      data: updateData
    });
    
    console.log('[API Tracking] PATCH: Sessão atualizada com sucesso');
    return NextResponse.json({ 
      success: true, 
      id: updatedSession.id,
      sessionId: updatedSession.sessionId,
      fbp: updatedSession.fbp,
      fbc: updatedSession.fbc
    });
  } catch (error) {
    console.error('[API Tracking] PATCH: Erro ao processar requisição:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
