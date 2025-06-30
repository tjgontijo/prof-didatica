'use client';

import { useTrackingSession } from '@/hooks/useTrackingSession';

export default function TrackingInitializer() {
  useTrackingSession();
  return null; // Componente não renderiza nada visualmente
}
