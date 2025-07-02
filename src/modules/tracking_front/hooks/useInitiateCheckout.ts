'use client'

import { useCallback } from 'react'
import cuid from 'cuid'

type InitiateCheckoutData = {
  content_ids?: string[]
  content_type?: string
  currency?: string
  value?: number
}

export function useInitiateCheckout() {
    return useCallback((customData: InitiateCheckoutData = {}) => {
      if (typeof window === 'undefined' || !window.fbq) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Meta Pixel não está disponível no window.fbq');
        }
        return;
      }  
      const eventId = cuid();
      window.fbq('track', 'InitiateCheckout', {
        ...customData,
        event_id: eventId
      });
  
      return eventId;
    }, []);
  }
