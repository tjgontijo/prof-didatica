import { useState, useEffect } from 'react';
import { OrderFilters, AlertData } from '@/types/dashboard';

/**
 * Hook para buscar e gerenciar dados de alertas do dashboard
 * @param initialFilters Filtros iniciais para os alertas
 */
export function useAlerts(initialFilters?: OrderFilters) {
  const [filters, setFilters] = useState<OrderFilters>(initialFilters || {});
  const [data, setData] = useState<AlertData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Construir query string para GET ou usar POST para filtros mais complexos
        const usePost = Object.keys(filters).length > 3;
        
        let response;
        if (usePost) {
          response = await fetch('/api/dashboard/alerts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filters }),
          });
        } else {
          // Construir query string para GET
          const queryParams = new URLSearchParams();
          
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (Array.isArray(value)) {
                queryParams.append(key, value.join(','));
              } else {
                queryParams.append(key, String(value));
              }
            }
          });
          
          response = await fetch(`/api/dashboard/alerts?${queryParams.toString()}`);
        }
        
        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.error || 'Erro desconhecido');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar dados de alertas');
        console.error('Erro ao buscar dados de alertas:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters]);

  const updateFilters = (newFilters: Partial<OrderFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  return {
    data,
    loading,
    error,
    filters,
    updateFilters,
    setFilters
  };
}
