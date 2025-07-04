import { prisma } from '@/lib/prisma';
import { UtmAnalysisData, UtmFilters, UtmPerformance } from '@/types/dashboard';
import dashboardCache from '@/lib/dashboardCache';

export class UtmService {
  /**
   * Obtém os dados de análise de UTM
   */
  async getUtmAnalysis(filters?: UtmFilters): Promise<UtmAnalysisData> {
    // Verifica se há dados em cache
    const cachedData = dashboardCache.getCachedUtmAnalysis(filters);
    if (cachedData) {
      return cachedData;
    }

    // Define o período de análise
    const startDate = filters?.startDate ? new Date(filters.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = filters?.endDate ? new Date(filters.endDate) : new Date();

    // Parâmetros para as consultas SQL
    const queryParams = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      utmSource: filters?.utmSource || null,
      utmMedium: filters?.utmMedium || null,
      utmCampaign: filters?.utmCampaign || null,
      productId: filters?.productId || null
    };

    // Obtém o desempenho por UTM
    const utmPerformance = await this.getUtmPerformance(queryParams);

    // Calcula os totais
    const totalSessions = utmPerformance.reduce((sum, item) => sum + item.sessions, 0);
    const totalOrders = utmPerformance.reduce((sum, item) => sum + item.orders, 0);
    const totalRevenue = utmPerformance.reduce((sum, item) => sum + item.revenue, 0);
    const overallConversionRate = totalSessions > 0 ? (totalOrders / totalSessions) * 100 : 0;

    // Monta o objeto de resposta
    const utmAnalysisData: UtmAnalysisData = {
      utmPerformance,
      totalSessions,
      totalOrders,
      totalRevenue,
      overallConversionRate
    };

    // Armazena em cache
    dashboardCache.cacheUtmAnalysis(utmAnalysisData, filters);

    return utmAnalysisData;
  }

  /**
   * Obtém o desempenho por UTM
   */
  private async getUtmPerformance(params: {
    startDate: string;
    endDate: string;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    productId: string | null;
  }): Promise<UtmPerformance[]> {
    // Construção das condições de filtro para as consultas SQL
    const utmSourceFilter = params.utmSource ? `AND ts."utmSource" = '${params.utmSource}'` : '';
    const utmMediumFilter = params.utmMedium ? `AND ts."utmMedium" = '${params.utmMedium}'` : '';
    const utmCampaignFilter = params.utmCampaign ? `AND ts."utmCampaign" = '${params.utmCampaign}'` : '';
    const productFilter = params.productId ? `AND o."productId" = '${params.productId}'` : '';

    // Consulta para obter o desempenho por UTM
    const utmPerformanceResult = await prisma.$queryRaw<{
      utmSource: string;
      utmMedium: string | null;
      utmCampaign: string | null;
      sessions: number;
      orders: number;
      revenue: number;
      newCustomers: number;
    }[]>`
      WITH utm_sessions AS (
        SELECT 
          ts."utmSource",
          ts."utmMedium",
          ts."utmCampaign",
          COUNT(DISTINCT ts."sessionId") as sessions
        FROM "TrackingSession" ts
        WHERE ts."createdAt" >= ${params.startDate}::timestamp
          AND ts."createdAt" <= ${params.endDate}::timestamp
          AND ts."utmSource" IS NOT NULL
          ${utmSourceFilter}
          ${utmMediumFilter}
          ${utmCampaignFilter}
        GROUP BY ts."utmSource", ts."utmMedium", ts."utmCampaign"
      ),
      utm_orders AS (
        SELECT 
          ts."utmSource",
          ts."utmMedium",
          ts."utmCampaign",
          COUNT(DISTINCT o.id) as orders,
          SUM(o."paidAmount") as revenue,
          COUNT(DISTINCT CASE WHEN (
            SELECT COUNT(*) FROM "Order" o2 
            WHERE o2."customerId" = o."customerId" 
              AND o2."createdAt" < o."createdAt"
          ) = 0 THEN o."customerId" ELSE NULL END) as new_customers
        FROM "Order" o
        LEFT JOIN "TrackingSession" ts ON o."trackingSessionId" = ts.id
        WHERE o."createdAt" >= ${params.startDate}::timestamp
          AND o."createdAt" <= ${params.endDate}::timestamp
          AND o."status" = 'PAID'
          AND o."deletedAt" IS NULL
          AND ts."utmSource" IS NOT NULL
          ${utmSourceFilter}
          ${utmMediumFilter}
          ${utmCampaignFilter}
          ${productFilter}
        GROUP BY ts."utmSource", ts."utmMedium", ts."utmCampaign"
      )
      SELECT 
        s."utmSource",
        s."utmMedium",
        s."utmCampaign",
        s.sessions,
        COALESCE(o.orders, 0) as orders,
        COALESCE(o.revenue, 0) as revenue,
        COALESCE(o.new_customers, 0) as "newCustomers"
      FROM utm_sessions s
      LEFT JOIN utm_orders o ON 
        s."utmSource" = o."utmSource" AND
        (s."utmMedium" = o."utmMedium" OR (s."utmMedium" IS NULL AND o."utmMedium" IS NULL)) AND
        (s."utmCampaign" = o."utmCampaign" OR (s."utmCampaign" IS NULL AND o."utmCampaign" IS NULL))
      ORDER BY COALESCE(o.revenue, 0) DESC
      LIMIT 100
    `;

    // Obtém o produto mais vendido para cada UTM
    const bestSellingProducts = await this.getBestSellingProductsByUtm(params);

    // Processa os resultados
    return utmPerformanceResult.map((item: {
      utmSource: string;
      utmMedium: string | null;
      utmCampaign: string | null;
      sessions: number;
      orders: number;
      revenue: number;
      newCustomers: number;
    }) => {
      const utmKey = `${item.utmSource}|${item.utmMedium || ''}|${item.utmCampaign || ''}`;
      const bestProduct = bestSellingProducts[utmKey];
      const sessions = Number(item.sessions) || 0;
      const orders = Number(item.orders) || 0;
      const revenue = Number(item.revenue) || 0;
      const newCustomers = Number(item.newCustomers) || 0;
      const returningCustomers = orders - newCustomers;

      return {
        utmSource: item.utmSource,
        utmMedium: item.utmMedium || undefined,
        utmCampaign: item.utmCampaign || undefined,
        sessions,
        orders,
        conversionRate: sessions > 0 ? (orders / sessions) * 100 : 0,
        revenue,
        averageTicket: orders > 0 ? revenue / orders : 0,
        bestSellingProduct: bestProduct,
        newCustomers,
        returningCustomers
      };
    });
  }

  /**
   * Obtém o produto mais vendido para cada combinação de UTM
   */
  private async getBestSellingProductsByUtm(params: {
    startDate: string;
    endDate: string;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    productId: string | null;
  }): Promise<Record<string, { id: string; name: string; totalSold: number }>> {
    // Construção das condições de filtro para as consultas SQL
    const utmSourceFilter = params.utmSource ? `AND ts."utmSource" = '${params.utmSource}'` : '';
    const utmMediumFilter = params.utmMedium ? `AND ts."utmMedium" = '${params.utmMedium}'` : '';
    const utmCampaignFilter = params.utmCampaign ? `AND ts."utmCampaign" = '${params.utmCampaign}'` : '';
    const productFilter = params.productId ? `AND o."productId" = '${params.productId}'` : '';

    // Consulta para obter o produto mais vendido por UTM
    const bestProductsResult = await prisma.$queryRaw<{
      utmSource: string;
      utmMedium: string | null;
      utmCampaign: string | null;
      productId: string;
      productName: string;
      totalSold: number;
    }[]>`
      WITH ranked_products AS (
        SELECT 
          ts."utmSource",
          ts."utmMedium",
          ts."utmCampaign",
          p.id as "productId",
          p.name as "productName",
          COUNT(o.id) as "totalSold",
          ROW_NUMBER() OVER (
            PARTITION BY ts."utmSource", ts."utmMedium", ts."utmCampaign" 
            ORDER BY COUNT(o.id) DESC
          ) as rank
        FROM "Order" o
        JOIN "Product" p ON o."productId" = p.id
        LEFT JOIN "TrackingSession" ts ON o."trackingSessionId" = ts.id
        WHERE o."createdAt" >= ${params.startDate}::timestamp
          AND o."createdAt" <= ${params.endDate}::timestamp
          AND o."status" = 'PAID'
          AND o."deletedAt" IS NULL
          AND ts."utmSource" IS NOT NULL
          ${utmSourceFilter}
          ${utmMediumFilter}
          ${utmCampaignFilter}
          ${productFilter}
        GROUP BY ts."utmSource", ts."utmMedium", ts."utmCampaign", p.id, p.name
      )
      SELECT 
        "utmSource",
        "utmMedium",
        "utmCampaign",
        "productId",
        "productName",
        "totalSold"
      FROM ranked_products
      WHERE rank = 1
    `;

    // Converte os resultados para um objeto indexado pela chave UTM
    const bestSellingProducts: Record<string, { id: string; name: string; totalSold: number }> = {};
    bestProductsResult.forEach((item: {
      utmSource: string;
      utmMedium: string | null;
      utmCampaign: string | null;
      productId: string;
      productName: string;
      totalSold: number;
    }) => {
      const utmKey = `${item.utmSource}|${item.utmMedium || ''}|${item.utmCampaign || ''}`;
      bestSellingProducts[utmKey] = {
        id: item.productId,
        name: item.productName,
        totalSold: Number(item.totalSold) || 0
      };
    });

    return bestSellingProducts;
  }

  /**
   * Obtém a receita por UTM
   */
  async getUtmRevenue(filters?: UtmFilters): Promise<Record<string, number>> {
    const utmAnalysis = await this.getUtmAnalysis(filters);
    
    // Extrai a receita por UTM
    const utmRevenue: Record<string, number> = {};
    utmAnalysis.utmPerformance.forEach(item => {
      const utmKey = item.utmCampaign ? 
        `${item.utmSource}/${item.utmMedium || 'direct'}/${item.utmCampaign}` : 
        `${item.utmSource}/${item.utmMedium || 'direct'}`;
      
      utmRevenue[utmKey] = item.revenue;
    });
    
    return utmRevenue;
  }

  /**
   * Obtém as taxas de conversão por campanha
   */
  async getCampaignConversion(filters?: UtmFilters): Promise<Record<string, number>> {
    const utmAnalysis = await this.getUtmAnalysis(filters);
    
    // Extrai as taxas de conversão por campanha
    const campaignConversion: Record<string, number> = {};
    utmAnalysis.utmPerformance.forEach(item => {
      if (item.utmCampaign) {
        campaignConversion[item.utmCampaign] = item.conversionRate;
      }
    });
    
    return campaignConversion;
  }

  /**
   * Obtém as principais campanhas por receita
   */
  async getTopCampaigns(limit: number = 5, filters?: UtmFilters): Promise<UtmPerformance[]> {
    const utmAnalysis = await this.getUtmAnalysis(filters);
    
    // Filtra apenas campanhas com utmCampaign definido
    const campaignsOnly = utmAnalysis.utmPerformance
      .filter(item => item.utmCampaign)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
    
    return campaignsOnly;
  }
}

// Exporta uma instância única do serviço
const utmService = new UtmService();
export default utmService;