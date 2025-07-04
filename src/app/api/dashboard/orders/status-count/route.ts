import { NextResponse } from 'next/server';
import ordersTableService from '@/services/dashboard/ordersTableService';
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

    // Obtém contagem de pedidos por status
    const ordersByStatus = await ordersTableService.getOrdersByStatus(filters);
    
    return NextResponse.json({
      success: true,
      data: ordersByStatus
    });
  } catch (error) {
    console.error('Erro ao buscar contagem de pedidos por status:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar contagem de pedidos por status' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Extrai filtros do corpo da requisição
    const body = await request.json();
    const filters: OrderFilters = body.filters || {};
    
    // Obtém contagem de pedidos por status com filtros mais complexos
    const ordersByStatus = await ordersTableService.getOrdersByStatus(filters);
    
    return NextResponse.json({
      success: true,
      data: ordersByStatus
    });
  } catch (error) {
    console.error('Erro ao buscar contagem de pedidos por status:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar contagem de pedidos por status' },
      { status: 500 }
    );
  }
}
