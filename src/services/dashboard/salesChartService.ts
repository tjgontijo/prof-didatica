import { prisma } from '@/lib/prisma';
import { SalesEvolutionData, SalesFilters, SalesTimeSeriesPoint } from '@/types/dashboard';
import dashboardCache from '@/lib/dashboardCache';

export class SalesChartService {
  /**
   * Obtém os dados de evolução de vendas para o gráfico
   */
  async getSalesEvolution(filters?: SalesFilters): Promise<SalesEvolutionData> {
    // Verifica se há dados em cache
    const cachedData = dashboardCache.getCachedSalesChart(filters);
    if (cachedData) {
      return cachedData;
    }

    // Define o período de análise
    const startDate = filters?.startDate ? new Date(filters.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = filters?.endDate ? new Date(filters.endDate) : new Date();
    const groupBy = filters?.groupBy || 'day';

    // Obtém a série temporal de vendas
    const timeSeriesData = await this.getSalesTimeSeries(startDate, endDate, groupBy);

    // Calcula a comparação com período anterior se solicitado
    let periodComparison = {
      currentPeriodRevenue: 0,
      previousPeriodRevenue: 0,
      percentageChange: 0,
      currentPeriodOrders: 0,
      previousPeriodOrders: 0,
      ordersPercentageChange: 0
    };

    if (filters?.compareWithPrevious) {
      periodComparison = await this.getPeriodComparison(startDate, endDate);
    } else {
      // Se não estiver comparando, apenas soma os valores do período atual
      periodComparison.currentPeriodRevenue = timeSeriesData.reduce((sum, point) => sum + point.revenue, 0);
      periodComparison.currentPeriodOrders = timeSeriesData.reduce((sum, point) => sum + point.orders, 0);
    }

    // Monta o objeto de resposta
    const salesEvolutionData: SalesEvolutionData = {
      timeSeriesData,
      periodComparison
    };

    // Armazena em cache
    dashboardCache.cacheSalesChart(salesEvolutionData, filters);

    return salesEvolutionData;
  }

  /**
   * Obtém a série temporal de vendas
   */
  private async getSalesTimeSeries(
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<SalesTimeSeriesPoint[]> {
    // Define o formato de data e o intervalo de agrupamento com base no parâmetro groupBy
    let dateFormat: string;
    let dateInterval: string;

    switch (groupBy) {
      case 'week':
        dateFormat = 'YYYY-WW';
        dateInterval = 'week';
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        dateInterval = 'month';
        break;
      case 'day':
      default:
        dateFormat = 'YYYY-MM-DD';
        dateInterval = 'day';
        break;
    }

    // Consulta SQL para obter os dados agrupados por período
    const timeSeriesResult = await prisma.$queryRaw<{
      date: string;
      revenue: number;
      orders: number;
    }[]>`
      SELECT
        TO_CHAR(DATE_TRUNC(${dateInterval}, "createdAt"), ${dateFormat}) as date,
        SUM("paidAmount") as revenue,
        COUNT(id) as orders
      FROM "Order"
      WHERE "status" = 'PAID'
        AND "createdAt" >= ${startDate.toISOString()}::timestamp
        AND "createdAt" <= ${endDate.toISOString()}::timestamp
        AND "deletedAt" IS NULL
      GROUP BY DATE_TRUNC(${dateInterval}, "createdAt")
      ORDER BY DATE_TRUNC(${dateInterval}, "createdAt")
    `;

    // Converte os resultados para o formato esperado
    return timeSeriesResult.map((item: { date: string; revenue: number; orders: number }) => ({
      date: item.date,
      revenue: Number(item.revenue) || 0,
      orders: Number(item.orders) || 0
    }));
  }

  /**
   * Compara o período atual com o período anterior de mesmo tamanho
   */
  private async getPeriodComparison(
    currentStartDate: Date,
    currentEndDate: Date
  ): Promise<{
    currentPeriodRevenue: number;
    previousPeriodRevenue: number;
    percentageChange: number;
    currentPeriodOrders: number;
    previousPeriodOrders: number;
    ordersPercentageChange: number;
  }> {
    // Calcula o tamanho do período em milissegundos
    const periodDuration = currentEndDate.getTime() - currentStartDate.getTime();
    
    // Calcula as datas do período anterior
    const previousEndDate = new Date(currentStartDate.getTime() - 1); // Um dia antes do início do período atual
    const previousStartDate = new Date(previousEndDate.getTime() - periodDuration); // Mesmo tamanho do período atual

    // Consulta para o período atual
    const currentPeriodResult = await prisma.$queryRaw<{
      revenue: number;
      orders: number;
    }[]>`
      SELECT
        SUM("paidAmount") as revenue,
        COUNT(id) as orders
      FROM "Order"
      WHERE "status" = 'PAID'
        AND "createdAt" >= ${currentStartDate.toISOString()}::timestamp
        AND "createdAt" <= ${currentEndDate.toISOString()}::timestamp
        AND "deletedAt" IS NULL
    `;

    // Consulta para o período anterior
    const previousPeriodResult = await prisma.$queryRaw<{
      revenue: number;
      orders: number;
    }[]>`
      SELECT
        SUM("paidAmount") as revenue,
        COUNT(id) as orders
      FROM "Order"
      WHERE "status" = 'PAID'
        AND "createdAt" >= ${previousStartDate.toISOString()}::timestamp
        AND "createdAt" <= ${previousEndDate.toISOString()}::timestamp
        AND "deletedAt" IS NULL
    `;

    // Extrai os valores
    const currentPeriodRevenue = Number(currentPeriodResult[0]?.revenue || 0);
    const previousPeriodRevenue = Number(previousPeriodResult[0]?.revenue || 0);
    const currentPeriodOrders = Number(currentPeriodResult[0]?.orders || 0);
    const previousPeriodOrders = Number(previousPeriodResult[0]?.orders || 0);

    // Calcula as variações percentuais
    const percentageChange = previousPeriodRevenue > 0
      ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
      : currentPeriodRevenue > 0 ? 100 : 0;

    const ordersPercentageChange = previousPeriodOrders > 0
      ? ((currentPeriodOrders - previousPeriodOrders) / previousPeriodOrders) * 100
      : currentPeriodOrders > 0 ? 100 : 0;

    return {
      currentPeriodRevenue,
      previousPeriodRevenue,
      percentageChange,
      currentPeriodOrders,
      previousPeriodOrders,
      ordersPercentageChange
    };
  }
}

// Exporta uma instância única do serviço
const salesChartService = new SalesChartService();
export default salesChartService;