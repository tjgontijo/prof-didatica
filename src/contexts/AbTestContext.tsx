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

  useEffect(() => {
    console.log('Inicializando seleção de variantes...');
    
    // Função para selecionar variantes com base na distribuição atual
    const selectVariants = async () => {
      // Objeto para armazenar as variantes ativas
      const newActiveVariants: Record<string, TestVariant> = {};
      
      // Para cada teste, consultar a distribuição atual e selecionar uma variante
      for (const test of tests) {
        console.log(`Selecionando variante para o teste ${test.testId}...`);
        
        // Verificar se há variantes disponíveis
        if (!test.variants || test.variants.length === 0) {
          console.warn(`Nenhuma variante disponível para o teste ${test.testId}`);
          continue;
        }
        
        try {
          // Obter a distribuição atual das variantes do banco de dados
          const { getVariantDistribution } = await import('@/lib/actions/abTest');
          const distributionResult = await getVariantDistribution(test.testId);
          
          console.log(`Distribuição atual para o teste ${test.testId}:`, distributionResult);
          
          let selectedVariant: TestVariant | null = null;
          
          if (distributionResult.success && distributionResult.distribution) {
            // Calcular qual variante está com menos visualizações em relação ao seu peso
            const distribution = distributionResult.distribution;
            
            // Se não houver dados suficientes (menos de 10 pageviews no total), usar seleção aleatória
            const totalCount = distribution.reduce((sum, v) => sum + v.count, 0);
            
            if (totalCount < 10) {
              console.log(`Poucos dados (${totalCount} pageviews), usando seleção aleatória`);
              
              // Calcular pesos para seleção aleatória
              const variants = test.variants;
              const totalWeight = variants.reduce((sum, variant) => sum + (variant.weight || 1), 0);
              
              // Gerar número aleatório entre 0 e o peso total
              const random = Math.random() * totalWeight;
              console.log(`Número aleatório gerado: ${random} (peso total: ${totalWeight})`);
              
              // Selecionar variante com base no número aleatório
              let cumulativeWeight = 0;
              
              for (const variant of variants) {
                cumulativeWeight += variant.weight || 1;
                console.log(`Variante ${variant.id}: peso acumulado ${cumulativeWeight}`);
                
                if (random <= cumulativeWeight) {
                  selectedVariant = variant;
                  break;
                }
              }
            } else {
              // Calcular a diferença entre a porcentagem atual e o peso desejado
              const variantScores = test.variants.map(variant => {
                const variantDist = distribution.find(d => d.variantId === variant.id);
                const currentPercentage = variantDist ? variantDist.percentage : 0;
                const targetPercentage = (variant.weight || 1) / test.variants.reduce((sum, v) => sum + (v.weight || 1), 0) * 100;
                
                // Quanto maior a diferença negativa, mais prioritária é a variante
                const score = targetPercentage - currentPercentage;
                
                return {
                  variant,
                  score
                };
              });
              
              // Ordenar por score (maior score = maior prioridade)
              variantScores.sort((a, b) => b.score - a.score);
              
              console.log('Scores das variantes:', variantScores.map(v => ({ 
                id: v.variant.id, 
                score: v.score 
              })));
              
              // Selecionar a variante com maior score (mais subrepresentada)
              selectedVariant = variantScores[0].variant;
            }
          } else {
            // Fallback para seleção aleatória se não conseguir obter a distribuição
            console.log('Usando seleção aleatória (fallback)');
            
            const randomIndex = Math.floor(Math.random() * test.variants.length);
            selectedVariant = test.variants[randomIndex];
          }
          
          if (selectedVariant) {
            console.log(`Variante selecionada para o teste ${test.testId}: ${selectedVariant.id}`);
            newActiveVariants[test.testId] = selectedVariant;
          }
        } catch (error) {
          console.error(`Erro ao selecionar variante para o teste ${test.testId}:`, error);
          
          // Fallback para seleção aleatória em caso de erro
          const randomIndex = Math.floor(Math.random() * test.variants.length);
          const fallbackVariant = test.variants[randomIndex];
          
          console.log(`Fallback para variante aleatória: ${fallbackVariant.id}`);
          newActiveVariants[test.testId] = fallbackVariant;
        }
      }
      
      // Atualizar estado com as variantes selecionadas
      setActiveVariants(newActiveVariants);
      
      // Salvar no localStorage para consistência entre páginas
      localStorage.setItem('ab_test_variants', JSON.stringify(
        Object.entries(newActiveVariants).reduce((acc, [testId, variant]) => {
          acc[testId] = variant.id;
          return acc;
        }, {} as Record<string, string>)
      ));
      
      console.log('Seleção de variantes concluída:', newActiveVariants);
    };
    
    // Executar a seleção de variantes
    selectVariants();
  }, [tests]);

  // Função para obter a variante ativa para um teste específico
  const getVariant = (testId: string): TestVariant | null => {
    return activeVariants[testId] || null;
  };

  // Rastrear evento
  const trackEvent = async (testId: string, eventName: string, additionalData?: Record<string, unknown>) => {
    try {
      console.log(`Rastreando evento ${eventName} para o teste ${testId}`);
      
      // Obter a variante ativa para o teste
      const variant = getVariant(testId);
      
      if (!variant) {
        console.warn(`Não foi possível rastrear o evento: nenhuma variante ativa para o teste ${testId}`);
        return;
      }
      
      console.log(`Variante ativa: ${variant.id}`);
      
      // Importar dinamicamente a função de salvamento no banco
      const { saveEventToDatabase, processFailedEvents } = await import('@/lib/actions/abTest');
      
      // Processar eventos que falharam anteriormente
      processFailedEvents();
      
      // Salvar evento no banco de dados
      await saveEventToDatabase({
        testId,
        variantId: variant.id,
        eventType: eventName,
        url: window.location.href,
        
        // Dados de localização
        country: undefined,
        state: undefined,
        city: undefined,
        
        // Dados de UTM
        utmSource: undefined,
        utmMedium: undefined,
        utmCampaign: undefined,
        utmTerm: undefined,
        utmContent: undefined,
        
        // Incluir dados adicionais se necessário
        ...additionalData
      });
    } catch (error) {
      console.error('Erro ao rastrear evento:', error);
    }
  };

  return (
    <AbTestContext.Provider value={{ getVariant, trackEvent }}>
      {children}
    </AbTestContext.Provider>
  );
}
