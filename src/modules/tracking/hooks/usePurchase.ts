'use client'

import { useCallback } from 'react';
import { getStoredSessionId } from '../utils/storage';

/**
 * Interface para os dados do produto no evento Purchase
 */
export interface PurchaseProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

/**
 * Interface para os dados do evento Purchase
 * Seguindo os padrões do Meta CAPI
 */
export interface PurchaseData {
  // Dados financeiros da transação
  value: number;                  // Valor total da compra (com ponto decimal)
  currency?: string;              // Moeda (padrão: BRL)
  
  // Dados dos produtos
  content_ids: string[];          // Array com IDs dos produtos comprados
  content_type?: string;          // Tipo de conteúdo (product ou service)
  contents?: Array<{              // Detalhes dos produtos (opcional)
    id: string;
    quantity: number;
    item_price?: number;
  }>;
  num_items?: number;             // Quantidade total de itens
  
  // Dados da transação
  transaction_id?: string;        // ID único da transação
  eventId?: string;              // ID do evento para deduplicar no Meta
  
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
 * Hook para disparar o evento Purchase
 * Envia o evento tanto para o Meta Pixel (frontend) quanto para o Meta CAPI (backend)
 */
export function usePurchase() {
  return useCallback((purchaseData: PurchaseData) => {
    // Usar o eventId fornecido ou gerar um novo
    const eventId = purchaseData.eventId;
    
    // Garantir valores padrão
    const data: PurchaseData = {
      ...purchaseData,
      currency: purchaseData.currency || 'BRL',
      content_type: purchaseData.content_type || 'product',
    };
    
    // 1. Disparar o evento do Pixel no frontend
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        value: data.value,
        currency: data.currency,
        content_ids: data.content_ids,
        content_type: data.content_type,
        contents: data.contents,
        num_items: data.num_items,
        transaction_id: data.transaction_id,
        event_id: eventId,
      });
      
      console.log('[Tracking] Evento Purchase enviado para Meta Pixel:', {
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
    const trackingSessionId = getStoredSessionId();
    
    if (!trackingSessionId) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('trackingSessionId não encontrado para o evento Purchase.');
      }
      return eventId; // Retorna o eventId mesmo se não puder enviar ao backend
    }
    
    // Preparar o payload para o backend
    const payload = {
      trackingSessionId,
      eventName: 'Purchase',
      eventId,
      customData: {
        value: data.value,
        currency: data.currency,
        content_ids: data.content_ids,
        content_type: data.content_type,
        contents: data.contents,
        num_items: data.num_items,
        transaction_id: data.transaction_id,
      },
      customer: data.customer,
    };
    
    // Enviar para o backend de forma assíncrona (fire and forget)
    fetch('/api/tracking/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payload }),
    })
      .then(response => {
        if (!response.ok) {
          console.error('Falha ao enviar evento Purchase para o backend.');
        } else {
          console.log('[Tracking] Evento Purchase enviado para o backend com sucesso.');
        }
      })
      .catch(error => {
        console.error('Erro de rede ao enviar evento Purchase:', error);
      });
    
    return eventId;
  }, []);
}

/**
 * Função auxiliar para converter produtos em formato adequado para o evento Purchase
 */
export function preparePurchaseData(
  products: PurchaseProduct[], 
  transactionId?: string,
  customerData?: PurchaseData['customer']
): PurchaseData {
  // Calcular o valor total
  const totalValue = products.reduce((total, product) => 
    total + (product.price * product.quantity), 0);
  
  // Extrair IDs dos produtos
  const contentIds = products.map(product => product.id);
  
  // Preparar o conteúdo detalhado
  const contents = products.map(product => ({
    id: product.id,
    quantity: product.quantity,
    item_price: product.price,
  }));
  
  // Calcular o número total de itens
  const numItems = products.reduce((total, product) => total + product.quantity, 0);
  
  return {
    value: totalValue,
    currency: 'BRL',
    content_ids: contentIds,
    content_type: 'product',
    contents,
    num_items: numItems,
    transaction_id: transactionId,
    customer: customerData,
  };
}
