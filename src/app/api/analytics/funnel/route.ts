import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Buscar eventos agrupados por nome e contar ocorrências
    const eventCounts = await prisma.trackingEvent.groupBy({
      by: ['eventName'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });
    
    console.log('Dados brutos de eventos:', JSON.stringify(eventCounts, null, 2));

    // Mapear os eventos específicos que queremos para o funil
    const funnelEvents = [
      { id: 'PageView', label: 'Visualização da Página', value: 0, dbEventName: 'PageView' },
      { id: 'InitiateCheckout', label: 'Início de Checkout', value: 0, dbEventName: 'InitiateCheckout' },
      { id: 'AddPaymentInfo', label: 'Adição de Pagamento', value: 0, dbEventName: 'AddPaymentInfo' },
      { id: 'Purchase', label: 'Compra Finalizada', value: 0, dbEventName: 'Purchase' }
    ];

    // Preencher os valores com dados reais
    for (const event of eventCounts) {
      const funnelEvent = funnelEvents.find(fe => fe.dbEventName === event.eventName);
      if (funnelEvent) {
        funnelEvent.value = event._count.id;
      }
    }
    
    console.log('Dados do funil formatados:', JSON.stringify(funnelEvents, null, 2));

    // Se não houver dados reais, usar dados de exemplo para visualização
    if (eventCounts.length === 0 || funnelEvents.every(e => e.value === 0)) {
      console.log('Sem dados reais, usando dados de exemplo');
      const exampleData = [
        { id: 'PageView', label: 'Visualização da Página', value: 1000 },
        { id: 'InitiateCheckout', label: 'Início de Checkout', value: 400 },
        { id: 'AddPaymentInfo', label: 'Adição de Pagamento', value: 300 },
        { id: 'Purchase', label: 'Compra Finalizada', value: 150 },
      ];
      return NextResponse.json(exampleData);
    }
    
    return NextResponse.json(funnelEvents);
  } catch (error) {
    console.error('Erro ao buscar dados do funil:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados do funil' },
      { status: 500 }
    );
  }
}
