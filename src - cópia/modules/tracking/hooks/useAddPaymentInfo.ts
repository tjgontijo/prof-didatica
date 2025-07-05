'use client'

import { useCallback } from 'react';
import cuid from 'cuid';
import { getOrCreateSessionId } from '../utils/externalId';

/**
 * Interface para os dados do evento AddPaymentInfo
 * Seguindo os padrões do Meta CAPI
 */
export interface AddPaymentInfoData {
  // Dados financeiros da transação
  value: number;                  // Valor total da compra (com ponto decimal)
  currency?: string;              // Moeda (padrão: BRL)
  
  // Dados dos produtos
  content_ids?: string[];         // Array com IDs dos produtos
  content_type?: string;          // Tipo de conteúdo (product ou service)
  contents?: Array<{              // Detalhes dos produtos (opcional)
    id: string;
    quantity: number;
    item_price?: number;
  }>;
  
  // Dados do cliente (serão hashados antes do envio)
  customer?: {
    email?: string;               // Email (será convertido para minúsculas e hashado)
    phone?: string;               // Telefone (apenas dígitos, começando com 55)
    firstName?: string;           // Primeiro nome (minúsculo, sem acento)
    lastName?: string;            // Sobrenome (minúsculo, sem acento)
    city?: string;                // Cidade (minúsculo, sem acento)
    state?: string;               // Estado (minúsculo, sem acento nem espaço)
    zipCode?: string;             // CEP (8 dígitos, sem hífen)
    country?: string;             // País (código ISO-3166 minúsculo)
  };
}

/**
 * Hook para disparar o evento AddPaymentInfo
 * Envia o evento tanto para o Meta Pixel (frontend) quanto para o Meta CAPI (backend)
 */
export function useAddPaymentInfo() {
  return useCallback((paymentInfoData: AddPaymentInfoData) => {
    // Gerar um ID único para o evento (para deduplicação)
    const eventId = cuid();
    
    // Garantir valores padrão
    const data: AddPaymentInfoData = {
      ...paymentInfoData,
      currency: paymentInfoData.currency || 'BRL',
      content_type: paymentInfoData.content_type || 'product',
    };
    
    // 1. Disparar o evento do Pixel no frontend
    if (typeof window !== 'undefined' && window.fbq) {
      // Preparar dados do cliente para o Pixel (sem hash no frontend)
      const customerData = data.customer ? {
        em: data.customer.email,         // Email
        ph: data.customer.phone,         // Telefone
        fn: data.customer.firstName,     // Primeiro nome
        ln: data.customer.lastName,      // Sobrenome
        ct: data.customer.city,          // Cidade
        st: data.customer.state,         // Estado
        zp: data.customer.zipCode,       // CEP
        country: data.customer.country,  // País
      } : {};
      
      window.fbq('track', 'AddPaymentInfo', {
        value: data.value,
        currency: data.currency,
        content_ids: data.content_ids,
        content_type: data.content_type,
        contents: data.contents,
        event_id: eventId,
        ...customerData, // Incluir dados do cliente
      });
      
      console.log('[Tracking] Evento AddPaymentInfo enviado para Meta Pixel:', {
        eventId,
        value: data.value,
        currency: data.currency,
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
        console.warn('Não foi possível criar trackingSessionId para o evento AddPaymentInfo.');
      }
      return eventId; // Retorna o eventId mesmo se não puder enviar ao backend
    }
    
    const payload = {
      trackingSessionId,
      eventName: 'AddPaymentInfo',
      eventId,
      customData: {
        ...data,
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
      .then((response) => {
        if (!response.ok) {
          console.error('[Tracking] Erro ao enviar evento AddPaymentInfo para o backend:', response.status);
        } else {
          console.log('[Tracking] Evento AddPaymentInfo enviado para o backend com sucesso');
        }
      })
      .catch((error) => {
        console.error('[Tracking] Erro ao enviar evento AddPaymentInfo para o backend:', error);
      });
    
    return eventId;
  }, []);
}

/**
 * Função auxiliar para preparar os dados do evento AddPaymentInfo
 * a partir dos dados do cliente e do pedido
 */
export function prepareAddPaymentInfoData(
  orderValue: number,
  products: Array<{
    id: string;
    price: number;
    quantity: number;
  }>,
  customerData: {
    name: string;
    email: string;
    phone: string;
  }
): AddPaymentInfoData {
  // Separar nome e sobrenome
  const nameParts = customerData.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');
  
  return {
    value: orderValue,
    currency: 'BRL',
    content_ids: products.map(product => product.id),
    content_type: 'product',
    contents: products.map(product => ({
      id: product.id,
      quantity: product.quantity,
      item_price: product.price,
    })),
    customer: {
      email: customerData.email,
      phone: customerData.phone,
      firstName,
      lastName,
    }
  };
}
