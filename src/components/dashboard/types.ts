// Interface para os dados da variante
export interface VariantData {
  views: number;
  conversions: number;
  conversionRate: number;
  color: string;
  uniqueVisitors: number;
}

// Interface para os dados do teste
export interface TestData {
  name: string;
  totalViews: number;
  totalUniqueViews: number;
  totalConversions: number;
  averageConversionRate: number;
  variants: Record<string, VariantData>;
  winningVariant: string | null;
  funnelData: Array<{id: string; label: string; value: number; color: string}>;
}

// Interface para os dados do dashboard
export interface DashboardData {
  testsData: Record<string, TestData>;
}
