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
      external_id: utmifyLead && utmifyLead._id || undefined,
      em: utmifyLead && utmifyLead.email || undefined,
      ph: utmifyLead && utmifyLead.phone || undefined,
      fn: utmifyLead && utmifyLead.firstName || undefined,
      ln: utmifyLead && utmifyLead.lastName || undefined,
      country: utmifyLead && utmifyLead.geolocation && utmifyLead.geolocation.country || undefined,
      ct: utmifyLead && utmifyLead.geolocation && utmifyLead.geolocation.city || undefined,
      st: utmifyLead && utmifyLead.geolocation && utmifyLead.geolocation.state || undefined,
      zp: utmifyLead && utmifyLead.geolocation && utmifyLead.geolocation.zipcode || undefined,
      client_user_agent: navigator.userAgent,
      client_ip_address: utmifyLead && (utmifyLead.ip || utmifyLead.ipv6) || undefined,
    };
  };

  // Inicializar variantes ativas para cada teste
  useEffect(() => {
    const newActiveVariants: Record<string, TestVariant> = {};
    
    tests.forEach(test => {
      // Verificar se já existe uma variante atribuída para este teste
      const storedVariantData = localStorage.getItem(`ab_test_${test.testId}`);
      
      if (storedVariantData) {
        try {
          // Parsear os dados armazenados (variante e timestamp)
          const { variantId, timestamp } = JSON.parse(storedVariantData);
          
          // Verificar se o timestamp é válido e se não passou do timeout (6 horas = 21600000 ms)
          const now = Date.now();
          const isValid = timestamp && (now - timestamp < 6 * 60 * 60 * 1000);
          
          if (isValid) {
            // Encontrar a variante armazenada
            const storedVariant = test.variants.find(v => v.id === variantId);
            if (storedVariant) {
              newActiveVariants[test.testId] = storedVariant;
              return;
            }
          }
        } catch (error) {
          // Se houver erro ao parsear, ignorar e selecionar uma nova variante
          console.error('Erro ao parsear dados de variante:', error);
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
      
      // Armazenar a variante selecionada com o timestamp atual
      const variantData = {
        variantId: selectedVariant.id,
        timestamp: Date.now()
      };
      
      localStorage.setItem(`ab_test_${test.testId}`, JSON.stringify(variantData));
      // Armazenar também o ID da variante separadamente para facilitar o acesso
      localStorage.setItem(`ab_test_variant_${test.testId}`, selectedVariant.id);
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
    
    try {
      // Importar dinamicamente o utilitário de armazenamento
      const { saveAbTestEvent } = await import('@/utils/storage');
      
      // Salvar o evento localmente
      saveAbTestEvent({
        testId,
        variantId: variant.id,
        eventType: eventName,
        timestamp: Date.now(),
        additionalData: {
          ...additionalData,
          eventTime: baseData.event_time,
          url: baseData.event_source_url,
          referrer: baseData.traffic_source,
          parameters: baseData.parameters,
          userAgent: baseData.client_user_agent,
        }
      });
      
      console.log(`Evento ${eventName} para teste ${testId} registrado com sucesso`);
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
