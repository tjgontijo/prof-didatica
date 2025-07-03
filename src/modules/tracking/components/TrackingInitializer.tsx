"use client";

import { useTracking } from '../hooks/useTracking';

/**
 * Componente responsável por inicializar o tracking em toda a aplicação
 * Este componente deve ser adicionado no layout principal da aplicação
 */
export function TrackingInitializer(): null {
  // Inicializa o tracking e gerencia a sessão do usuário
  useTracking();
  
  // Este componente não renderiza nada, apenas inicializa o tracking
  return null;
}
