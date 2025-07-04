import { NextResponse } from 'next/server';
import utmService from '@/services/dashboard/utmService';
import { OrderFilters } from '@/types/dashboard';

export async function GET(request: Request) {
  try {
    // Extrai parâmetros da URL
    const { searchParams } = new URL(request.url);
    
    // Constrói objeto de filtros
    const filters: OrderFilters = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      utmSource: searchParams.get('utmSource') || undefined,
      utmCampaign: searchParams.get('utmCampaign') || undefined,
      productId: searchParams.get('productId') || undefined
    };

    // Obtém dados de desempenho UTM
    const utmPerformance = await utmService.getUtmPerformance(filters);
    
    return NextResponse.json({
      success: true,
      data: utmPerformance
    });
  } catch (error) {
    console.error('Erro ao buscar dados de UTM:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar dados de UTM' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Extrai filtros do corpo da requisição
    const body = await request.json();
    const filters: OrderFilters = body.filters || {};
    
    // Obtém dados de desempenho UTM com filtros mais complexos
    const utmPerformance = await utmService.getUtmPerformance(filters);
    
    return NextResponse.json({
      success: true,
      data: utmPerformance
    });
  } catch (error) {
    console.error('Erro ao buscar dados de UTM:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar dados de UTM' },
      { status: 500 }
    );
  }
}
