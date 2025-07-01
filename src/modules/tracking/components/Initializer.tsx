'use client';

import { useTrackingSession } from '@/modules/tracking/hooks/useTrackingSession';

export default function TrackingInitializer() {
  useTrackingSession();
  return null;
}
