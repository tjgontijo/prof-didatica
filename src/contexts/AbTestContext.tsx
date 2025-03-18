"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

type TestVariant = {
  id: string;
  component: React.ComponentType<{ testId: string } & Record<string, unknown>>;
  weight?: number;
  props?: Record<string, unknown>;
};

type TestConfig = {
  testId: string;
  variants: TestVariant[];
};

type AbTestContextType = {
  getVariant: (testId: string) => TestVariant | null;
  trackEvent: (testId: string, eventName: string, additionalData?: Record<string, unknown>) => Promise<void>;
};

const AbTestContext = createContext<AbTestContextType>({
  getVariant: () => null,
  trackEvent: async () => {},
});

export const useAbTest = () => useContext(AbTestContext);

type AbTestProviderProps = {
  children: ReactNode;
  tests: TestConfig[];
};

export function AbTestProvider({ children, tests }: AbTestProviderProps) {
  const [activeVariants, setActiveVariants] = useState<Record<string, TestVariant>>({});

  // Função para obter dados da utmify
  const getUtmifyData = () => {
    const utmifyLead = JSON.parse(localStorage.getItem('lead') || '{}');
    
    return {
      event_time: Math.floor(new Date().getTime() / 1000),
      event_source_url: window.location.href,
      traffic_source: document.referrer || undefined,
      parameters: window.location.search,
      external_id: utmifyLead._id || undefined,
      em: utmifyLead.email || undefined,
      ph: utmifyLead.phone || undefined,
      fn: utmifyLead.firstName || undefined,
      ln: utmifyLead.lastName || undefined,
      country: utmifyLead.geolocation?.country || undefined,
      ct: utmifyLead.geolocation?.city || undefined,
      st: utmifyLead.geolocation?.state || undefined,
      zp: utmifyLead.geolocation?.zipcode || undefined,
      client_user_agent: navigator.userAgent,
      client_ip_address: utmifyLead.ip || utmifyLead.ipv6 || undefined,
    };
  };

  // Inicializar variantes ativas para cada teste
  useEffect(() => {
    const newActiveVariants: Record<string, TestVariant> = {};
    
    tests.forEach(test => {
      // Verificar se já existe uma variante atribuída para este teste
      const storedVariantId = localStorage.getItem(`ab_test_${test.testId}`);
      
      if (storedVariantId) {
        // Encontrar a variante armazenada
        const storedVariant = test.variants.find(v => v.id === storedVariantId);
        if (storedVariant) {
          newActiveVariants[test.testId] = storedVariant;
          return;
        }
      }
      
      // Atribuir aleatoriamente uma variante com base nos pesos
      let selectedVariant: TestVariant;
      
      // Verificar se alguma variante tem peso definido
      const hasWeights = test.variants.some(v => v.weight !== undefined);
      
      if (hasWeights) {
        // Obter os pesos (usando 1 como padrão se não for definido)
        const weights = test.variants.map(v => v.weight || 1);
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        const random = Math.random() * totalWeight;
        
        let cumulativeWeight = 0;
        let selectedIndex = 0;
        
        for (let i = 0; i < weights.length; i++) {
          cumulativeWeight += weights[i];
          if (random <= cumulativeWeight) {
            selectedIndex = i;
            break;
          }
        }
        
        selectedVariant = test.variants[selectedIndex];
      } else {
        // Distribuição uniforme se nenhum peso for definido
        const randomIndex = Math.floor(Math.random() * test.variants.length);
        selectedVariant = test.variants[randomIndex];
      }
      
      // Armazenar a variante selecionada
      localStorage.setItem(`ab_test_${test.testId}`, selectedVariant.id);
      newActiveVariants[test.testId] = selectedVariant;
    });
    
    setActiveVariants(newActiveVariants);
  }, [tests]);

  // Função para obter a variante ativa para um teste específico
  const getVariant = (testId: string): TestVariant | null => {
    return activeVariants[testId] || null;
  };

  // Função para rastrear eventos
  const trackEvent = async (testId: string, eventName: string, additionalData = {}) => {
    const variant = activeVariants[testId];
    if (!variant) return;
    
    const baseData = getUtmifyData();
    const payload = {
      event_name: eventName,
      test_id: testId,
      variant_id: variant.id,
      ...baseData,
      ...additionalData
    };
    
    try {
      // 1. Enviar para o webhook externo (manter o comportamento atual)
      const webhookPromise = fetch('https://webhook.elev8.com.br/webhook/5d8792ad-79be-412a-8f06-a81ff381f036', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      // 2. Enviar para nossa API local para armazenar no banco de dados
      const localApiPromise = fetch('/api/ab-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId,
          variantId: variant.id,
          eventType: eventName,
          
          // Dados do evento
          eventTime: baseData.event_time,
          url: baseData.event_source_url,
          referrer: baseData.traffic_source,
          parameters: baseData.parameters,
          userAgent: baseData.client_user_agent,
          
          // Dados do lead
          lead: JSON.parse(localStorage.getItem('lead') || '{}'),
          
          // Metadados adicionais
          metadata: additionalData
        }),
      });
      
      // Aguardar ambas as requisições
      await Promise.allSettled([webhookPromise, localApiPromise]);
      
    } catch (error) {
      console.error('Erro ao enviar evento:', error);
    }
  };

  return (
    <AbTestContext.Provider value={{ getVariant, trackEvent }}>
      {children}
    </AbTestContext.Provider>
  );
}
