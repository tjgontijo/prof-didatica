'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function UtmTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const existing = localStorage.getItem('trackingParameters');

    // Verifica se já existe e ainda está válido
    if (existing) {
      const parsed = JSON.parse(existing);
      if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
        return; // Já salvo e válido
      }
    }

    const trackingParams = {
      src: searchParams.get('src') || null,
      sck: searchParams.get('sck') || null,
      utm_source: searchParams.get('utm_source') || '',
      utm_campaign: searchParams.get('utm_campaign') || '',
      utm_medium: searchParams.get('utm_medium') || '',
      utm_content: searchParams.get('utm_content') || '',
      utm_term: searchParams.get('utm_term') || '',
    };

    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 dias

    localStorage.setItem(
      'trackingParameters',
      JSON.stringify({ trackingParameters: trackingParams, expiresAt })
    );
  }, [searchParams]);

  return null;
}
