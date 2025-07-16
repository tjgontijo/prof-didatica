'use client';

import React from 'react';
import { ResponsiveFunnel } from '@nivo/funnel';

export interface FunnelDataItem {
  id: string;
  label: string;
  value: number;
  color: string;
  [key: string]: string | number; // Adiciona índice de assinatura para compatibilidade com FunnelDatum
}

interface FunnelChartProps {
  data: FunnelDataItem[];
}

/**
 * Componente para exibir o gráfico de funil de conversão
 */
// Esquema de cores personalizado para o funil
const funnelColors = [
  '#4F46E5', // Indigo - Topo do funil (Visitantes)
  '#6366F1', // Indigo mais claro (Interagiram)
  '#8B5CF6', // Violeta (Interessados)
  '#A855F7', // Violeta mais claro (Iniciaram compra)
  '#EC4899', // Rosa (Convertidos)
];

export function Funnel({ data }: FunnelChartProps): JSX.Element {
  // Aplicar cores personalizadas aos dados se não tiverem cores definidas
  const colorizedData = data.map((item, index) => ({
    ...item,
    color: item.color || funnelColors[index % funnelColors.length]
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Funil de Conversão</h3>
      <div className="h-80">
        <ResponsiveFunnel
          data={colorizedData}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          valueFormat={(value) => `${Number(value).toLocaleString('pt-BR')}`}
          colors={{ datum: 'color' }}
          borderWidth={20}
          borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
          labelColor={{ from: 'color', modifiers: [['darker', 3]] }}
          beforeSeparatorLength={100}
          beforeSeparatorOffset={20}
          afterSeparatorLength={100}
          afterSeparatorOffset={20}
          currentPartSizeExtension={10}
          currentBorderWidth={40}
          motionConfig="gentle"
          enableLabel={true}
          tooltip={({ part }) => (
            <div style={{
              padding: '12px 16px',
              background: 'white',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              borderRadius: '4px',
              color: '#333',
              fontSize: '14px'
            }}>
              <strong>{part.data.label}</strong><br />
              <span>Total: {Number(part.formattedValue).toLocaleString('pt-BR')}</span>
            </div>
          )}
        />
      </div>
    </div>
  );
}
