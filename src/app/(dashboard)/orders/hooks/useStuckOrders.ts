import { useState, useEffect } from 'react';
import { OrderFilters, StuckOrder } from '@/types/dashboard';

/**
 * Hook para buscar e gerenciar dados de pedidos travados
 * @param initialFilters Filtros iniciais para os pedidos travados
 */
export function useStuckOrders(initialFilters?: OrderFilters) {
  const [filters, setFilters] = useState<OrderFilters>(initialFilters || {});
  const [data, setData] = useState<StuckOrder[]>([]);
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
          response = await fetch('/api/dashboard/orders/stuck', {
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
          
          response = await fetch(`/api/dashboard/orders/stuck?${queryParams.toString()}`);
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
        setError(err instanceof Error ? err.message : 'Erro ao buscar pedidos travados');
        console.error('Erro ao buscar pedidos travados:', err);
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
