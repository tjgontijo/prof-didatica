'use client';

import { useEffect, useRef } from 'react';
import { useAbTracking } from '@/hooks/useAbTracking';

interface AbTrackerProps {
  testName: string;
  variant: string;
}

export function AbTracker({ testName, variant }: AbTrackerProps) {
  const { trackView } = useAbTracking(testName, variant);
  const viewFired = useRef(false);
    
  useEffect(() => {
    if (!viewFired.current) {
      trackView();
      viewFired.current = true;
    }
  }, [trackView]);
    
  return null;
}
