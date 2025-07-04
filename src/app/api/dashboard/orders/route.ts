import { NextResponse } from 'next/server';
import ordersTableService from '@/services/dashboard/ordersTableService';
import { OrderFilters, OrderStatus } from '@/types/dashboard';

export async function GET(request: Request) {
  try {
    // Extrai parâmetros da URL
    const { searchParams } = new URL(request.url);
    
    // Constrói objeto de filtros
    const filters: OrderFilters = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      status: searchParams.get('status') ? 
        (searchParams.get('status')?.split(',') as OrderStatus[]) : 
        undefined,
      productId: searchParams.get('productId') || undefined,
      customerId: searchParams.get('customerId') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page') || '1', 10) : 1,
      pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize') || '10', 10) : 10,
      sortBy: searchParams.get('sortBy') || undefined,
      sortDirection: (searchParams.get('sortDirection') as 'asc' | 'desc') || 'desc',
      minAmount: searchParams.get('minAmount') ? 
        parseFloat(searchParams.get('minAmount') || '0') : 
        undefined,
      maxAmount: searchParams.get('maxAmount') ? 
        parseFloat(searchParams.get('maxAmount') || '0') : 
        undefined
    };

    // Obtém dados da tabela de pedidos
    const ordersData = await ordersTableService.getOrdersTable(filters);
    
    return NextResponse.json({
      success: true,
      data: ordersData
    });
  } catch (error) {
    console.error('Erro ao buscar dados da tabela de pedidos:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar dados da tabela de pedidos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Extrai filtros do corpo da requisição
    const body = await request.json();
    const filters: OrderFilters = body.filters || {};
    
    // Obtém dados da tabela de pedidos com filtros mais complexos
    const ordersData = await ordersTableService.getOrdersTable(filters);
    
    return NextResponse.json({
      success: true,
      data: ordersData
    });
  } catch (error) {
    console.error('Erro ao buscar dados da tabela de pedidos:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar dados da tabela de pedidos' },
      { status: 500 }
    );
  }
}
