import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const abEventSchema = z.object({
  testName: z.string().min(1, 'Nome do teste é obrigatório'),
  variant: z.string().min(1, 'Variante é obrigatória'),
  event: z.enum(['view', 'conversion'] as const),
  visitorId: z.string().min(1, 'ID do visitante é obrigatório'),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional()
});

type AbEventData = z.infer<typeof abEventSchema>;

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const validationResult = abEventSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const eventData: AbEventData = validationResult.data;

    if (eventData.event === 'view') {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const existingEvent = await prisma.abResult.findFirst({
        where: {
          testName: eventData.testName,
          variant: eventData.variant,
          event: eventData.event,
          visitorId: eventData.visitorId,
          createdAt: {
            gte: fiveMinutesAgo
          }
        }
      });

      if (existingEvent) {
        return NextResponse.json({ message: 'Evento já registrado' }, { status: 200 });
      }
    }
    
    const result = await prisma.abResult.create({
      data: {
        testName: eventData.testName,
        variant: eventData.variant,
        event: eventData.event,
        visitorId: eventData.visitorId,
        utmSource: eventData.utmSource,
        utmMedium: eventData.utmMedium,
        utmCampaign: eventData.utmCampaign,
        utmContent: eventData.utmContent,
        utmTerm: eventData.utmTerm
      }
    });

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Erro ao processar evento A/B:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar evento' },
      { status: 500 }
    );
  }
}
