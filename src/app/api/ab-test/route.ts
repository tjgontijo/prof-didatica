import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// Função para extrair parâmetros UTM da URL
function extractUtmParams(queryString: string) {
  const params = new URLSearchParams(queryString);
  return {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
    utmContent: params.get('utm_content') || undefined,
    utmTerm: params.get('utm_term') || undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar campos obrigatórios
    if (!body.testId || !body.variantId || !body.eventType) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes: testId, variantId, eventType' },
        { status: 400 }
      );
    }

    // Verificar se o teste existe, se não, criar
    let test = await prisma.abTest.findUnique({
      where: { testId: body.testId },
    });

    if (!test) {
      test = await prisma.abTest.create({
        data: {
          testId: body.testId,
          name: body.testName || body.testId,
          description: body.description,
        },
      });
    }

    // Verificar se a variante existe, se não, criar
    let variant = await prisma.variant.findFirst({
      where: {
        testId: test.id,
        variantId: body.variantId,
      },
    });

    if (!variant) {
      variant = await prisma.variant.create({
        data: {
          variantId: body.variantId,
          name: `Variante ${body.variantId}`,
          weight: body.weight || 1.0,
          testId: test.id,
        },
      });
    }

    // Extrair dados do lead do localStorage (enviados no corpo da requisição)
    const lead = body.lead || {};
    const geolocation = lead.geolocation || {};
    
    // Extrair parâmetros UTM
    const utmParams = extractUtmParams(body.parameters || '');

    // Criar o evento
    const event = await prisma.abEvent.create({
      data: {
        eventType: body.eventType,
        eventTime: new Date(body.eventTime ? body.eventTime * 1000 : Date.now()),
        sessionId: body.sessionId || uuidv4(),
        url: body.eventSourceUrl || body.url,
        
        // Dados de UTM
        utmSource: utmParams.utmSource,
        utmMedium: utmParams.utmMedium,
        utmCampaign: utmParams.utmCampaign,
        utmTerm: utmParams.utmTerm,
        utmContent: utmParams.utmContent,
        
        // Dados do lead
        leadId: lead._id || body.externalId,
        leadEmail: lead.email,
        leadName: lead.firstName ? `${lead.firstName} ${lead.lastName || ''}`.trim() : null,
        leadPhone: lead.phone,
        
        // Dados de geolocalização
        country: geolocation.country,
        city: geolocation.city,
        state: geolocation.state,
        latitude: geolocation.latitude,
        longitude: geolocation.longitude,
        
        // Relações
        test: {
          connect: { id: test.id }
        },
        variant: {
          connect: { id: variant.id }
        }
      },
    });

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    console.error('Erro ao processar evento de teste A/B:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
