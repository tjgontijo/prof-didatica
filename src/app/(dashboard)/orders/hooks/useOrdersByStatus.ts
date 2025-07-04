import { useState, useEffect } from 'react';
import { OrderFilters, OrderStatus } from '@/types/dashboard';

/**
 * Interface para os dados de contagem de pedidos por status
 */
interface OrderStatusCount {
  status: OrderStatus;
  count: number;
}

/**
 * Hook para buscar e gerenciar dados de contagem de pedidos por status
 * @param initialFilters Filtros iniciais para a contagem de pedidos
 */
export function useOrdersByStatus(initialFilters?: OrderFilters) {
  const [filters, setFilters] = useState<OrderFilters>(initialFilters || {});
  const [data, setData] = useState<OrderStatusCount[]>([]);
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
          response = await fetch('/api/dashboard/orders/status-count', {
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
          
          response = await fetch(`/api/dashboard/orders/status-count?${queryParams.toString()}`);
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
        setError(err instanceof Error ? err.message : 'Erro ao buscar contagem de pedidos por status');
        console.error('Erro ao buscar contagem de pedidos por status:', err);
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
