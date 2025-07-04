import { prisma } from '@/lib/prisma';
import { KpiData, KpiFilters } from '@/types/dashboard';
import dashboardCache from '@/lib/dashboardCache';


export class KpiService {
  /**
   * Obtém todos os KPIs principais do dashboard
   */
  async getKpis(filters?: KpiFilters): Promise<KpiData> {
    // Verifica se há dados em cache
    const cachedData = dashboardCache.getCachedKpis(filters);
    if (cachedData) {
      return cachedData;
    }

    // Define o período de análise
    const startDate = filters?.startDate ? new Date(filters.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = filters?.endDate ? new Date(filters.endDate) : new Date();

    // Parâmetros para as consultas SQL
    const dateParams = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };

    // Obtém a receita total
    const totalRevenueResult = await prisma.$queryRaw<{ total: number }[]>`
      SELECT SUM("paidAmount") as total
      FROM "Order"
      WHERE "status" = 'PAID'
        AND "createdAt" >= ${dateParams.startDate}::timestamp
        AND "createdAt" <= ${dateParams.endDate}::timestamp
        AND "deletedAt" IS NULL
    `;
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Obtém o total de pedidos
    const totalOrdersResult = await prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) as count
      FROM "Order"
      WHERE "status" = 'PAID'
        AND "createdAt" >= ${dateParams.startDate}::timestamp
        AND "createdAt" <= ${dateParams.endDate}::timestamp
        AND "deletedAt" IS NULL
    `;
    const totalOrders = parseInt(totalOrdersResult[0]?.count.toString() || '0');

    // Calcula o ticket médio
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calcula a taxa de conversão
    const totalSessionsResult = await prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(DISTINCT "sessionId") as count
      FROM "TrackingSession"
      WHERE "createdAt" >= ${dateParams.startDate}::timestamp
        AND "createdAt" <= ${dateParams.endDate}::timestamp
    `;
    const totalSessions = parseInt(totalSessionsResult[0]?.count.toString() || '0');
    const conversionRate = totalSessions > 0 ? (totalOrders / totalSessions) * 100 : 0;

    // Obtém o produto mais vendido
    const bestSellingProductResult = await prisma.$queryRaw<{
      id: string;
      name: string;
      totalSold: number;
      revenue: number;
    }[]>`
      SELECT 
        p.id,
        p.name,
        COUNT(o.id) as "totalSold",
        SUM(o."paidAmount") as revenue
      FROM "Product" p
      JOIN "Order" o ON o."productId" = p.id
      WHERE o."status" = 'PAID'
        AND o."createdAt" >= ${dateParams.startDate}::timestamp
        AND o."createdAt" <= ${dateParams.endDate}::timestamp
        AND o."deletedAt" IS NULL
      GROUP BY p.id, p.name
      ORDER BY "totalSold" DESC
      LIMIT 1
    `;
    const bestSellingProduct = bestSellingProductResult[0] || {
      id: '',
      name: 'Nenhum',
      totalSold: 0,
      revenue: 0
    };

    // Obtém o melhor dia de vendas
    const bestSalesDayResult = await prisma.$queryRaw<{
      date: string;
      totalSales: number;
      totalOrders: number;
    }[]>`
      SELECT
        DATE(o."createdAt") as date,
        SUM(o."paidAmount") as "totalSales",
        COUNT(o.id) as "totalOrders"
      FROM "Order" o
      WHERE o."status" = 'PAID'
        AND o."createdAt" >= ${dateParams.startDate}::timestamp
        AND o."createdAt" <= ${dateParams.endDate}::timestamp
        AND o."deletedAt" IS NULL
      GROUP BY DATE(o."createdAt")
      ORDER BY "totalSales" DESC
      LIMIT 1
    `;
    const bestSalesDay = bestSalesDayResult[0] || {
      date: new Date().toISOString().split('T')[0],
      totalSales: 0,
      totalOrders: 0
    };

    // Monta o objeto de resposta
    const kpiData: KpiData = {
      totalRevenue,
      totalOrders,
      averageTicket,
      conversionRate,
      bestSellingProduct,
      bestSalesDay
    };

    // Armazena em cache
    dashboardCache.cacheKpis(kpiData, filters);

    return kpiData;
  }

  /**
   * Obtém a receita total no período
   */
  async getTotalRevenue(filters?: KpiFilters): Promise<number> {
    const kpis = await this.getKpis(filters);
    return kpis.totalRevenue;
  }

  /**
   * Obtém o total de pedidos por status
   */
  async getOrderCounts(filters?: KpiFilters): Promise<Record<string, number>> {
    const startDate = filters?.startDate ? new Date(filters.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = filters?.endDate ? new Date(filters.endDate) : new Date();

    const orderCountsResult = await prisma.$queryRaw<{
      status: string;
      count: number;
    }[]>`
      SELECT 
        "status",
        COUNT(*) as count
      FROM "Order"
      WHERE "createdAt" >= ${startDate.toISOString()}::timestamp
        AND "createdAt" <= ${endDate.toISOString()}::timestamp
        AND "deletedAt" IS NULL
      GROUP BY "status"
    `;

    // Converte o resultado para um objeto
    const orderCounts: Record<string, number> = {};
    orderCountsResult.forEach((item: { status: string; count: number }) => {
      orderCounts[item.status] = parseInt(item.count.toString());
    });

    return orderCounts;
  }

  /**
   * Obtém o ticket médio
   */
  async getAverageTicket(filters?: KpiFilters): Promise<number> {
    const kpis = await this.getKpis(filters);
    return kpis.averageTicket;
  }

  /**
   * Obtém o produto mais vendido
   */
  async getBestSellingProduct(filters?: KpiFilters): Promise<KpiData['bestSellingProduct']> {
    const kpis = await this.getKpis(filters);
    return kpis.bestSellingProduct;
  }

  /**
   * Obtém o melhor dia de vendas
   */
  async getBestSalesDay(filters?: KpiFilters): Promise<KpiData['bestSalesDay']> {
    const kpis = await this.getKpis(filters);
    return kpis.bestSalesDay;
  }
}

// Exporta uma instância única do serviço
const kpiService = new KpiService();
export default kpiService;