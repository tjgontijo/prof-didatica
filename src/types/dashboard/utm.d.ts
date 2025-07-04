export interface UtmPerformance {
  utmSource: string;
  utmMedium?: string;
  utmCampaign?: string;
  sessions: number;
  orders: number;
  conversionRate: number;
  revenue: number;
  averageTicket: number;
  bestSellingProduct?: {
    id: string;
    name: string;
    totalSold: number;
  };
  newCustomers?: number;
  returningCustomers?: number;
}

export interface UtmAnalysisData {
  utmPerformance: UtmPerformance[];
  totalSessions: number;
  totalOrders: number;
  totalRevenue: number;
  overallConversionRate: number;
}

export interface UtmAnalysisTableProps {
  data: UtmPerformance[];
  isLoading?: boolean;
  totalSessions?: number;
  totalOrders?: number;
  totalRevenue?: number;
  overallConversionRate?: number;
}

export interface UtmFilters {
  startDate?: string;
  endDate?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  productId?: string;
}