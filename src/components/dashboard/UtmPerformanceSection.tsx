'use client';

import { useEffect, useState } from 'react';
import { UtmPerformanceCard } from './UtmPerformanceCard';

interface UtmItem {
  name: string;
  views: number;
  conversions: number;
  rate: number;
}

interface UtmData {
  source: UtmItem[];
  campaign: UtmItem[];
  medium: UtmItem[];
  term: UtmItem[];
}

interface UtmPerformanceSectionProps {
  testName?: string;
}

export function UtmPerformanceSection({ testName }: UtmPerformanceSectionProps) {
  const [data, setData] = useState<UtmData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUtmData() {
      try {
        setIsLoading(true);
        const queryParams = testName ? `?testName=${encodeURIComponent(testName)}` : '';
        const response = await fetch(`/api/admin/utm-performance${queryParams}`);
        
        if (!response.ok) {
          throw new Error('Falha ao carregar dados de UTM');
        }
        
        const utmData = await response.json();
        setData(utmData);
      } catch (err) {
        console.error('Erro ao buscar dados de UTM:', err);
        setError('Não foi possível carregar os dados de desempenho por origem');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUtmData();
  }, [testName]);

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800">Desempenho por Origem</h3>
        </div>
        <div className="p-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-800">Desempenho por Origem</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UtmPerformanceCard 
            title="Por Fonte (utm_source)" 
            data={data?.source || null} 
            isLoading={isLoading} 
          />
          <UtmPerformanceCard 
            title="Por Campanha (utm_campaign)" 
            data={data?.campaign || null} 
            isLoading={isLoading} 
          />
          <UtmPerformanceCard 
            title="Por Meio (utm_medium)" 
            data={data?.medium || null} 
            isLoading={isLoading} 
          />
          <UtmPerformanceCard 
            title="Por Termo (utm_term)" 
            data={data?.term || null} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </div>
  );
}
