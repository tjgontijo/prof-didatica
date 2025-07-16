import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
}

/**
 * Componente para exibir um card de métrica individual
 */
export function MetricCard({ title, value, subtitle }: MetricCardProps): JSX.Element {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
      <span className="text-gray-500 text-sm mb-1">{title}</span>
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      {subtitle && <span className="text-gray-500 text-xs mt-1">{subtitle}</span>}
    </div>
  );
}

interface MetricCardsProps {
  totalViews: number;
  totalUniqueViews: number;
  totalConversions: number;
  averageConversionRate: number;
  winningVariant: string | null;
}

/**
 * Componente para exibir o conjunto de cards de métricas
 */
export function MetricCards({
  totalViews,
  totalUniqueViews,
  totalConversions,
  averageConversionRate,
  winningVariant
}: MetricCardsProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-gray-200">
      <MetricCard 
        title="Total de Visualizações" 
        value={totalViews.toLocaleString('pt-BR')} 
      />
      <MetricCard 
        title="Visitantes Únicos" 
        value={totalUniqueViews.toLocaleString('pt-BR')} 
      />
      <MetricCard 
        title="Total de Conversões" 
        value={totalConversions.toLocaleString('pt-BR')} 
      />
      <MetricCard 
        title="Taxa Média de Conversão" 
        value={`${averageConversionRate.toFixed(2)}%`} 
        subtitle={winningVariant ? `Melhor variante: ${winningVariant.toUpperCase()}` : 'Sem dados suficientes'}
      />
    </div>
  );
}
