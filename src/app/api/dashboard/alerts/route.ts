import { NextResponse } from 'next/server';
import alertsService from '@/services/dashboard/alertsService';
import { OrderFilters } from '@/types/dashboard';

export async function GET(request: Request) {
  try {
    // Extrai parâmetros da URL
    const { searchParams } = new URL(request.url);
    
    // Constrói objeto de filtros
    const filters: OrderFilters = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      productId: searchParams.get('productId') || undefined
    };

    // Obtém dados de alertas
    const alertsData = await alertsService.getAlerts(filters);
    
    return NextResponse.json({
      success: true,
      data: alertsData
    });
  } catch (error) {
    console.error('Erro ao buscar dados de alertas:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar dados de alertas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Extrai filtros do corpo da requisição
    const body = await request.json();
    const filters: OrderFilters = body.filters || {};
    
    // Obtém dados de alertas com filtros mais complexos
    const alertsData = await alertsService.getAlerts(filters);
    
    return NextResponse.json({
      success: true,
      data: alertsData
    });
  } catch (error) {
    console.error('Erro ao buscar dados de alertas:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar dados de alertas' },
      { status: 500 }
    );
  }
}
