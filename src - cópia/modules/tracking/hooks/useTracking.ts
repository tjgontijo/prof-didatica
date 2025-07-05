"use client";

import { useEffect, useState } from 'react';
import { buildTrackingData } from '../services/trackingService';
import { TrackingData } from '../types/tracking';
import { updateSessionTimestamp } from '../utils/storage';

interface UseTrackingReturn {
  trackingData: TrackingData | null;
  isLoading: boolean;
  error: Error | null;
  refreshTracking: () => Promise<void>;
}

/**
 * Hook para gerenciar o tracking e a sessão do usuário
 * Inicializa os dados de tracking e atualiza o timestamp da sessão
 */
export function useTracking(): UseTrackingReturn {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTrackingData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[useTracking] Iniciando coleta de dados de tracking');
      
      // Construir os dados de tracking (isso já atualiza o timestamp da sessão)
      const data = await buildTrackingData();
      console.log('[useTracking] Dados coletados:', JSON.stringify(data, null, 2));
      setTrackingData(data);
      
      console.log('[useTracking] Enviando dados para a API de sessão');
      // Enviar os dados para a API de sessão
      const response = await fetch('/api/tracking/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        console.error('[useTracking] Erro na API de sessão:', response.status, errorData);
        throw new Error(`Erro ${response.status} na API de sessão: ${JSON.stringify(errorData)}`);
      }
      
      const responseData = await response.json();
      console.log('[useTracking] Resposta da API de sessão:', responseData);
    } catch (err) {
      console.error('[useTracking] Erro ao processar tracking:', err);
      setError(err instanceof Error ? err : new Error('Erro ao obter dados de tracking'));
    } finally {
      setIsLoading(false);
    }
  };

  // Inicializar os dados de tracking quando o componente for montado
  useEffect(() => {
    fetchTrackingData();
    
    // Configurar um intervalo para atualizar o timestamp da sessão a cada 5 minutos
    const intervalId = setInterval(() => {
      updateSessionTimestamp();
    }, 5 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return {
    trackingData,
    isLoading,
    error,
    refreshTracking: fetchTrackingData
  };
}
