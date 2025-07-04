export interface SalesTimeSeriesPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface SalesEvolutionData {
  timeSeriesData: SalesTimeSeriesPoint[];
  periodComparison: {
    currentPeriodRevenue: number;
    previousPeriodRevenue: number;
    percentageChange: number;
    currentPeriodOrders: number;
    previousPeriodOrders: number;
    ordersPercentageChange: number;
  };
}

export interface SalesChartProps {
  data: SalesTimeSeriesPoint[];
  isLoading?: boolean;
  periodComparison?: {
    percentageChange: number;
    ordersPercentageChange: number;
  };
}

export interface SalesFilters {
  startDate?: string;
  endDate?: string;
  groupBy: 'day' | 'week' | 'month';
  compareWithPrevious?: boolean;
}