'use client'

import { useCallback } from 'react';
import cuid from 'cuid';
import { getOrCreateSessionId } from '../utils/externalId';

type InitiateCheckoutData = {
  content_ids?: string[];
  content_type?: string;
  currency?: string;
  value?: number;
};

export function useInitiateCheckout() {
  return useCallback((customData: InitiateCheckoutData = {}) => {
    const eventId = cuid();

    // 1. Disparar o evento do Pixel no frontend
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        ...customData,
        event_id: eventId,
      });
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Meta Pixel (window.fbq) não está disponível.');
      }
    }

    // 2. Enviar o evento para o backend (para salvar no DB e enviar para CAPI)
    // Garante que temos uma sessão de tracking válida
    const trackingSessionId = getOrCreateSessionId();

    if (!trackingSessionId) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Não foi possível criar trackingSessionId para o evento InitiateCheckout.');
      }
      return eventId; // Retorna o eventId mesmo se não puder enviar ao backend
    }

    const payload = {
      trackingSessionId,
      eventName: 'InitiateCheckout',
      eventId,
      customData: {
        ...customData,
      },
    };

    // Envia para o backend de forma assíncrona (fire and forget)
    fetch('/api/tracking/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payload }),
    })
      .then(response => {
        if (!response.ok) {
          console.error('Falha ao enviar evento InitiateCheckout para o backend.');
        }
      })
      .catch(error => {
        console.error('Erro de rede ao enviar evento InitiateCheckout:', error);
      });

    return eventId;
  }, []);
}
