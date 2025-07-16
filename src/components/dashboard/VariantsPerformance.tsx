'use client';

import React from 'react';

interface VariantData {
  views: number;
  conversions: number;
  conversionRate: number;
  color: string;
  uniqueVisitors?: number;
}

interface VariantsPerformanceProps {
  variants: Record<string, VariantData>;
  winningVariant: string | null;
}

/**
 * Componente para exibir o gráfico de barras de taxa de conversão
 */
function ConversionRateBar({ rate, color, width }: { 
  rate: number;
  color: string;
  width: number;
}): JSX.Element {
  return (
    <div className="flex items-center w-full">
      <div className="h-4 rounded-full bg-gray-100 overflow-hidden w-full">
        <div 
          className="h-full rounded-full transition-all duration-500" 
          style={{ 
            width: `${Math.min(width, 100)}%`, // Garantir que o máximo seja 100%
            backgroundColor: color 
          }}
        />
      </div>
      <span className="ml-2 text-gray-900 font-medium">{rate.toFixed(2)}%</span>
    </div>
  );
}

/**
 * Componente para destacar a variante vencedora
 */
function WinnerBadge(): JSX.Element {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
      <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="3" />
      </svg>
      Vencedor
    </span>
  );
}

/**
 * Componente para exibir a performance das variantes
 */
export function VariantsPerformance({ variants, winningVariant }: VariantsPerformanceProps): JSX.Element {
  // Determinar a largura máxima para as barras de conversão (a maior taxa + 10% de margem)
  const getMaxConversionRate = (): number => {
    let maxRate = 5; // Valor mínimo base de 5%
    
    Object.values(variants).forEach(variant => {
      if (variant.conversionRate > maxRate) {
        maxRate = variant.conversionRate;
      }
    });
    
    return maxRate * 1.1; // Adicionar 10% de margem
  };
  
  const maxRate = getMaxConversionRate();
  
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Performance das Variantes</h3>
      
      <div className="space-y-5">
        {Object.entries(variants).map(([variant, variantData]) => {
          const isWinner = variant === winningVariant;
          
          return (
            <div key={variant} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: variantData.color }}></div>
                  <h4 className="text-gray-800 font-medium">
                    Variante {variant.toUpperCase()}
                    {isWinner && <WinnerBadge />}
                  </h4>
                </div>
                <div className="text-sm text-gray-500">
                  {variantData.views.toLocaleString('pt-BR')} visualizações · {variantData.conversions.toLocaleString('pt-BR')} conversões
                </div>
              </div>
              
              <ConversionRateBar 
                rate={variantData.conversionRate} 
                color={variantData.color}
                width={(variantData.conversionRate / maxRate) * 100}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
