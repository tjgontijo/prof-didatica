export interface KpiData {
  totalRevenue: number;
  totalOrders: number;
  averageTicket: number;
  conversionRate: number;
  bestSellingProduct: {
    id: string;
    name: string;
    totalSold: number;
    revenue: number;
  };
  bestSalesDay: {
    date: string;
    totalSales: number;
    totalOrders: number;
  };
}

export interface KpiCardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  percentageChange?: number;
  isPositiveChange?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export interface KpiFilters {
  startDate?: string;
  endDate?: string;
  compareWithPrevious?: boolean;
}