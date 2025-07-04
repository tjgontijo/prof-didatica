import { KpiData, SalesEvolutionData, FunnelData, UtmAnalysisData, OrdersTableData, AlertData, StuckOrder } from '../types/dashboard';

type CacheKey = string;
type CacheValue = unknown;
type CacheEntry = {
  value: CacheValue;
  expiresAt: number;
};

class DashboardCache {
  private cache: Map<CacheKey, CacheEntry>;
  private readonly DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutos por padrão

  constructor() {
    this.cache = new Map<CacheKey, CacheEntry>();
  }

  /**
   * Gera uma chave de cache baseada no tipo de dados e nos filtros aplicados
   */
  private generateKey(type: string, filters?: Record<string, unknown>): CacheKey {
    const filtersString = filters ? JSON.stringify(filters) : '';
    return `${type}:${filtersString}`;
  }

  /**
   * Armazena um valor no cache com TTL específico
   */
  set<T>(type: string, value: T, filters?: Record<string, unknown>, ttlMs: number = this.DEFAULT_TTL_MS): void {
    const key = this.generateKey(type, filters);
    const expiresAt = Date.now() + ttlMs;
    
    this.cache.set(key, {
      value,
      expiresAt
    });
  }

  /**
   * Recupera um valor do cache se estiver disponível e não expirado
   */
  get<T>(type: string, filters?: Record<string, unknown>): T | null {
    const key = this.generateKey(type, filters);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Verifica se o cache expirou
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Limpa uma entrada específica do cache
   */
  invalidate(type: string, filters?: Record<string, unknown>): void {
    const key = this.generateKey(type, filters);
    this.cache.delete(key);
  }

  /**
   * Limpa todo o cache ou um tipo específico
   */
  invalidateAll(type?: string): void {
    if (type) {
      // Remove apenas as entradas que começam com o tipo especificado
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${type}:`)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Limpa todo o cache
      this.cache.clear();
    }
  }

  // Métodos específicos para cada tipo de dados do dashboard
  cacheKpis(data: KpiData, filters?: Record<string, unknown>): void {
    this.set('kpis', data, filters);
  }

  getCachedKpis(filters?: Record<string, unknown>): KpiData | null {
    return this.get<KpiData>('kpis', filters);
  }

  cacheSalesChart(data: SalesEvolutionData, filters?: Record<string, unknown>): void {
    this.set('salesChart', data, filters);
  }

  getCachedSalesChart(filters?: Record<string, unknown>): SalesEvolutionData | null {
    return this.get<SalesEvolutionData>('salesChart', filters);
  }

  cacheFunnel(data: FunnelData, filters?: Record<string, unknown>): void {
    this.set('funnel', data, filters);
  }

  getCachedFunnel(filters?: Record<string, unknown>): FunnelData | null {
    return this.get<FunnelData>('funnel', filters);
  }

  cacheUtmAnalysis(data: UtmAnalysisData, filters?: Record<string, unknown>): void {
    this.set('utmAnalysis', data, filters);
  }

  getCachedUtmAnalysis(filters?: Record<string, unknown>): UtmAnalysisData | null {
    return this.get<UtmAnalysisData>('utmAnalysis', filters);
  }

  cacheOrdersTable(data: OrdersTableData, cacheKey: string, filters?: Record<string, unknown>): void {
    // TTL menor para dados de pedidos (5 minutos)
    this.set(`ordersTable:${cacheKey}`, data, filters, 5 * 60 * 1000);
  }

  getCachedOrdersTable(cacheKey: string, filters?: Record<string, unknown>): OrdersTableData | null {
    return this.get<OrdersTableData>(`ordersTable:${cacheKey}`, filters);
  }
  
  cacheStuckOrders(data: StuckOrder[], filters?: Record<string, unknown>): void {
    // TTL menor para pedidos presos (3 minutos)
    this.set('stuckOrders', data, filters, 3 * 60 * 1000);
  }

  getCachedStuckOrders(filters?: Record<string, unknown>): StuckOrder[] | null {
    return this.get<StuckOrder[]>('stuckOrders', filters);
  }
  
  cacheOrdersByStatus(data: Record<string, number>, filters?: Record<string, unknown>): void {
    // TTL para contagem de pedidos por status (5 minutos)
    this.set('ordersByStatus', data, filters, 5 * 60 * 1000);
  }

  getCachedOrdersByStatus(filters?: Record<string, unknown>): Record<string, number> | null {
    return this.get<Record<string, number>>('ordersByStatus', filters);
  }

  cacheAlerts(data: AlertData, filters?: Record<string, unknown>): void {
    // TTL menor para alertas (2 minutos)
    this.set('alerts', data, filters, 2 * 60 * 1000);
  }

  getCachedAlerts(filters?: Record<string, unknown>): AlertData | null {
    return this.get<AlertData>('alerts', filters);
  }
}

// Exporta uma instância única do cache para ser usada em toda a aplicação
const dashboardCache = new DashboardCache();
export default dashboardCache;