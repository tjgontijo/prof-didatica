export interface FunnelStage {
  name: string;
  value: number;
  conversionRate?: number; // Taxa de conversão em relação ao estágio anterior
}

export interface FunnelData {
  stages: FunnelStage[];
  overallConversionRate: number; // Taxa de conversão total (do primeiro ao último estágio)
}

export interface FunnelChartProps {
  data: FunnelStage[];
  isLoading?: boolean;
  overallConversionRate?: number;
}

export interface FunnelFilters {
  startDate?: string;
  endDate?: string;
  productId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}