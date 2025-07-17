'use client';

import React from 'react';
import { ResponsiveFunnel } from '@nivo/funnel';

export interface FunnelDataItem {
  id: string;
  label: string;
  value: number;
  color?: string;
  [key: string]: string | number | undefined; // Adiciona índice de assinatura para compatibilidade com FunnelDatum
}

interface FunnelChartProps {
  data: FunnelDataItem[];
}

/**
 * Componente para exibir o gráfico de funil de conversão horizontal
 */
export function Funnel({ data }: FunnelChartProps): JSX.Element {
  // Esquema de cores profissional para o funil
  const funnelColors = [
    '#2563EB', // Azul - Visitantes
    '#4F46E5', // Indigo - Visitantes únicos
    '#7C3AED', // Violeta - Conversões
  ];

  // Aplicar cores personalizadas aos dados
  const colorizedData = data.map((item, index) => ({
    ...item,
    color: item.color || funnelColors[index % funnelColors.length]
  }));
  
  // Calcular porcentagens para exibição
  const baseValue = colorizedData[0]?.value || 0;
  const formattedData = colorizedData.map(item => {
    const percentage = baseValue > 0 ? (item.value / baseValue * 100).toFixed(1) : '0';
    return {
      ...item,
      formattedValue: new Intl.NumberFormat('pt-BR').format(item.value),
      percentage: `${percentage}%`
    };
  });
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-800">Funil de Conversão</h3>
      </div>
      <div className="p-6">
        <div className="h-32 md:h-40">
          <ResponsiveFunnel
            data={colorizedData}
            margin={{ top: 10, right: 160, bottom: 10, left: 160 }}
            valueFormat={(value: number) => `${new Intl.NumberFormat('pt-BR').format(value)}`}
            colors={{ datum: 'color' }}
            direction="horizontal"
            shapeBlending={0.6}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
            labelColor={{ from: 'color', modifiers: [['darker', 3]] }}
            beforeSeparatorLength={20}
            beforeSeparatorOffset={10}
            afterSeparatorLength={20}
            afterSeparatorOffset={10}
            currentPartSizeExtension={10}
            currentBorderWidth={1}
            motionConfig="gentle"
            enableLabel={true}
            animate={true}
            tooltip={({ part }) => {
              // Acessar os dados de forma segura com verificação de tipo
              const label = part.data ? part.data.label : '';
              const value = part.data ? part.data.value : 0;
              
              return (
                <div style={{
                  padding: '12px 16px',
                  background: 'white',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  borderRadius: '4px',
                  color: '#333',
                  fontSize: '14px'
                }}>
                  <strong>{label}</strong><br />
                  <span>Total: {new Intl.NumberFormat('pt-BR').format(value)}</span>
                  {baseValue > 0 && (
                    <><br /><span>Taxa: {(value / baseValue * 100).toFixed(1)}%</span></>
                  )}
                </div>
              );
            }}
          />
        </div>
        
        {/* Legenda do funil */}
        <div className="flex justify-center mt-4 flex-wrap gap-4">
          {formattedData.map((item, index) => (
            <div key={item.id} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-700">
                {item.label}: <strong>{item.formattedValue}</strong>
                {index > 0 && baseValue > 0 && (
                  <span className="text-gray-500 ml-1">({item.percentage})</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
