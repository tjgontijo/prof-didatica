import { prisma } from '@/lib/prisma';
import { AlertData, OrderFilters, StuckOrder } from '@/types/dashboard';
import dashboardCache from '@/lib/dashboardCache';
import ordersTableService from './ordersTableService';

export class AlertsService {
  /**
   * Obtém todos os alertas ativos no sistema
   */
  async getAlerts(filters?: OrderFilters): Promise<AlertData> {
    // Verifica se há dados em cache
    const cachedData = dashboardCache.getCachedAlerts(filters);
    if (cachedData) {
      return cachedData;
    }

    // Busca os diferentes tipos de alertas em paralelo
    const [stuckOrders, failedWebhooks, anomalies] = await Promise.all([
      this.getStuckOrders(filters),
      this.getFailedWebhooks(filters),
      this.getAnomalies(filters)
    ]);

    // Monta o objeto de resposta
    const alertsData: AlertData = {
      stuckOrders,
      failedWebhooks,
      anomalies
    };

    // Armazena em cache
    dashboardCache.cacheAlerts(alertsData, filters);

    return alertsData;
  }

  /**
   * Obtém pedidos com problemas ou travados no processo
   */
  private async getStuckOrders(filters?: OrderFilters): Promise<StuckOrder[]> {
    // Usa o serviço de tabela de pedidos para obter pedidos travados
    return ordersTableService.getStuckOrders(filters);
  }

  /**
   * Obtém webhooks que falharam
   */
  private async getFailedWebhooks(filters?: OrderFilters): Promise<{
    id: string;
    event: string;
    sentAt: string;
    statusCode?: number;
    errorMessage?: string;
  }[]> {
    // Define o período de análise
    const startDate = filters?.startDate ? new Date(filters.startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
    const endDate = filters?.endDate ? new Date(filters.endDate) : new Date();

    // Busca webhooks falhos
    const failedWebhooks = await prisma.webhook.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        success: false,
        retries: {
          gte: 3 // Webhooks que falharam após 3 ou mais tentativas
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // Processa os resultados
    interface WebhookData {
      id: string;
      event: string;
      createdAt: Date;
      statusCode?: number | null;
      errorMessage?: string | null;
    }
    
    return failedWebhooks.map((webhook: WebhookData) => ({
      id: webhook.id,
      event: webhook.event,
      sentAt: webhook.createdAt.toISOString(),
      statusCode: webhook.statusCode ?? undefined,
      errorMessage: webhook.errorMessage ?? undefined
    }));
  }

  /**
   * Detecta anomalias nos dados de vendas e conversão
   */
  private async getAnomalies(filters?: OrderFilters): Promise<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    detectedAt: string;
  }[]> {
    // Define o período de análise
    const startDate = filters?.startDate ? new Date(filters.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = filters?.endDate ? new Date(filters.endDate) : new Date();

    // Lista para armazenar anomalias detectadas
    const anomalies: {
      type: string;
      message: string;
      severity: 'low' | 'medium' | 'high';
      detectedAt: string;
    }[] = [];

    // 1. Verifica queda abrupta nas vendas (mais de 50% em relação à média)
    const salesAnomaly = await this.detectSalesAnomaly(startDate, endDate);
    if (salesAnomaly) {
      anomalies.push(salesAnomaly);
    }

    // 2. Verifica aumento significativo na taxa de cancelamento
    const cancellationAnomaly = await this.detectCancellationAnomaly(startDate, endDate);
    if (cancellationAnomaly) {
      anomalies.push(cancellationAnomaly);
    }

    // 3. Verifica queda na taxa de conversão
    const conversionAnomaly = await this.detectConversionAnomaly(startDate, endDate);
    if (conversionAnomaly) {
      anomalies.push(conversionAnomaly);
    }

    return anomalies;
  }

  /**
   * Detecta anomalias nas vendas
   */
  private async detectSalesAnomaly(
    startDate: Date,
    endDate: Date
  ): Promise<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    detectedAt: string;
  } | null> {
    // Busca dados de vendas diárias para o período
    const dailySales = await prisma.$queryRaw<{ date: string; total: number }[]>`
      SELECT 
        DATE("createdAt") as date, 
        COUNT(*) as total
      FROM "Order"
      WHERE "createdAt" >= ${startDate}::timestamp
        AND "createdAt" <= ${endDate}::timestamp
        AND "status" = 'PAID'
        AND "deletedAt" IS NULL
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    `;

    // Se não houver dados suficientes, retorna null
    if (dailySales.length < 7) {
      return null;
    }

    // Calcula a média de vendas dos últimos 7 dias (excluindo hoje)
    const today = new Date().toISOString().split('T')[0];
    const recentSales = dailySales.filter((item: { date: string; total: number }) => item.date !== today).slice(0, 7);
    
    const avgSales = recentSales.reduce((sum: number, item: { date: string; total: number }) => sum + Number(item.total), 0) / recentSales.length;
    
    // Verifica se as vendas de hoje estão abaixo de 50% da média
    const todaySales = dailySales.find((item: { date: string; total: number }) => item.date === today);
    if (todaySales && Number(todaySales.total) < avgSales * 0.5) {
      return {
        type: 'sales_drop',
        message: `Queda abrupta nas vendas: ${todaySales.total} pedidos hoje vs. média de ${Math.round(avgSales)} pedidos/dia`,
        severity: 'high',
        detectedAt: new Date().toISOString()
      };
    }

    return null;
  }

  /**
   * Detecta anomalias na taxa de cancelamento
   */
  private async detectCancellationAnomaly(
    startDate: Date,
    endDate: Date
  ): Promise<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    detectedAt: string;
  } | null> {
    // Busca dados de cancelamentos diários para o período
    const dailyStats = await prisma.$queryRaw<{ date: string; total: number; canceled: number }[]>`
      SELECT 
        DATE("createdAt") as date, 
        COUNT(*) as total,
        SUM(CASE WHEN "status" = 'CANCELED' THEN 1 ELSE 0 END) as canceled
      FROM "Order"
      WHERE "createdAt" >= ${startDate}::timestamp
        AND "createdAt" <= ${endDate}::timestamp
        AND "deletedAt" IS NULL
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
      LIMIT 14
    `;

    // Se não houver dados suficientes, retorna null
    if (dailyStats.length < 7) {
      return null;
    }

    // Calcula a taxa média de cancelamento dos últimos 7 dias (excluindo hoje)
    const today = new Date().toISOString().split('T')[0];
    const recentStats = dailyStats.filter((item: { date: string; total: number; canceled: number }) => item.date !== today).slice(0, 7);
    
    let totalOrders = 0;
    let totalCanceled = 0;
    
    recentStats.forEach((day: { date: string; total: number; canceled: number }) => {
      totalOrders += Number(day.total);
      totalCanceled += Number(day.canceled);
    });
    
    const avgCancellationRate = totalOrders > 0 ? (totalCanceled / totalOrders) * 100 : 0;
    
    // Verifica se a taxa de cancelamento de hoje está acima de 200% da média
    const todayStats = dailyStats.find((item: { date: string; total: number; canceled: number }) => item.date === today);
    if (todayStats && todayStats.total > 5) { // Só considera se houver pelo menos 5 pedidos
      const todayRate = Number(todayStats.canceled) / Number(todayStats.total) * 100;
      
      if (todayRate > avgCancellationRate * 2 && todayRate > 10) { // Taxa acima de 200% da média e maior que 10%
        return {
          type: 'high_cancellation',
          message: `Aumento na taxa de cancelamento: ${todayRate.toFixed(1)}% hoje vs. média de ${avgCancellationRate.toFixed(1)}%`,
          severity: 'medium',
          detectedAt: new Date().toISOString()
        };
      }
    }

    return null;
  }

  /**
   * Detecta anomalias na taxa de conversão
   */
  private async detectConversionAnomaly(
    startDate: Date,
    endDate: Date
  ): Promise<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    detectedAt: string;
  } | null> {
    // Busca dados de conversão diários para o período
    const dailyConversion = await prisma.$queryRaw<{ date: string; sessions: number; orders: number }[]>`
      WITH daily_sessions AS (
        SELECT 
          DATE("createdAt") as date, 
          COUNT(DISTINCT "sessionId") as sessions
        FROM "TrackingSession"
        WHERE "createdAt" >= ${startDate}::timestamp
          AND "createdAt" <= ${endDate}::timestamp
        GROUP BY DATE("createdAt")
      ),
      daily_orders AS (
        SELECT 
          DATE("createdAt") as date, 
          COUNT(*) as orders
        FROM "Order"
        WHERE "createdAt" >= ${startDate}::timestamp
          AND "createdAt" <= ${endDate}::timestamp
          AND "status" = 'PAID'
          AND "deletedAt" IS NULL
        GROUP BY DATE("createdAt")
      )
      SELECT 
        s.date,
        s.sessions,
        COALESCE(o.orders, 0) as orders
      FROM daily_sessions s
      LEFT JOIN daily_orders o ON s.date = o.date
      ORDER BY s.date DESC
      LIMIT 14
    `;

    // Se não houver dados suficientes, retorna null
    if (dailyConversion.length < 7) {
      return null;
    }

    // Calcula a taxa média de conversão dos últimos 7 dias (excluindo hoje)
    const today = new Date().toISOString().split('T')[0];
    const recentData = dailyConversion.filter((item: { date: string; sessions: number; orders: number }) => item.date !== today).slice(0, 7);
    
    let totalSessions = 0;
    let totalOrders = 0;
    
    recentData.forEach((day: { date: string; sessions: number; orders: number }) => {
      totalSessions += Number(day.sessions);
      totalOrders += Number(day.orders);
    });
    
    const avgConversionRate = totalSessions > 0 ? (totalOrders / totalSessions) * 100 : 0;
    
    // Verifica se a taxa de conversão de hoje está abaixo de 50% da média
    const todayData = dailyConversion.find((item: { date: string; sessions: number; orders: number }) => item.date === today);
    if (todayData && todayData.sessions > 20) { // Só considera se houver pelo menos 20 sessões
      const todayRate = Number(todayData.orders) / Number(todayData.sessions) * 100;
      
      if (todayRate < avgConversionRate * 0.5 && avgConversionRate > 1) { // Taxa abaixo de 50% da média e média maior que 1%
        return {
          type: 'conversion_drop',
          message: `Queda na taxa de conversão: ${todayRate.toFixed(2)}% hoje vs. média de ${avgConversionRate.toFixed(2)}%`,
          severity: 'high',
          detectedAt: new Date().toISOString()
        };
      }
    }

    return null;
  }

  /**
   * Obtém o resumo dos alertas (contagens por tipo)
   */
  async getAlertsSummary(filters?: OrderFilters): Promise<Record<string, number>> {
    const alerts = await this.getAlerts(filters);
    
    return {
      stuckOrders: alerts.stuckOrders.length,
      failedWebhooks: alerts.failedWebhooks.length,
      anomalies: alerts.anomalies.length,
      total: alerts.stuckOrders.length + alerts.failedWebhooks.length + alerts.anomalies.length
    };
  }
}

// Exporta uma instância única do serviço
const alertsService = new AlertsService();
export default alertsService;