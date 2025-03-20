'use server';

import { prisma } from '../prisma';

// Interface para dados do evento
export interface AbTestEventServerData {
  testId: string;
  variantId: string; 
  eventType: string;
  sessionId: string;
  url?: string;
  
  // Dados de localização
  country?: string;
  state?: string;
  city?: string;
  
  // Dados de UTM
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

// Interface para dados de distribuição de variantes
export interface VariantDistribution {
  variantId: string; 
  count: number;
  percentage: number;
}

/**
 * Server Action para obter a distribuição atual das variantes de um teste
 */
export async function getVariantDistributionAction(testName: string): Promise<{ 
  success: boolean; 
  distribution?: VariantDistribution[];
  error?: string;
}> {
  try {
    console.log('[Server] Obtendo distribuição de variantes para o teste:', testName);
    
    // Verificar se o teste existe
    const test = await prisma.abTest.findUnique({
      where: { name: testName },
      include: {
        variants: true
      }
    });
    
    if (!test) {
      console.log('[Server] Teste não encontrado:', testName);
      return { 
        success: false, 
        error: `Teste ${testName} não encontrado` 
      };
    }
    
    // Obter contagem de eventos pageview para cada variante
    const variantCounts = await Promise.all(
      test.variants.map(async (variant) => {
        const count = await prisma.abEvent.count({
          where: {
            variantId: variant.id,
            eventType: 'pageview'
          }
        });
        
        return {
          variantId: variant.name, 
          count,
          weight: variant.weight
        };
      })
    );
    
    // Calcular o total de pageviews
    const totalCount = variantCounts.reduce((sum, v) => sum + v.count, 0);
    
    // Calcular a porcentagem para cada variante
    const distribution = variantCounts.map(v => ({
      variantId: v.variantId,
      count: v.count,
      percentage: totalCount > 0 ? (v.count / totalCount) * 100 : 0,
      weight: v.weight
    }));
    
    console.log('[Server] Distribuição de variantes:', distribution);
    
    return {
      success: true,
      distribution
    };
  } catch (error) {
    console.error('[Server] Erro ao obter distribuição de variantes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Server Action para salvar um evento de teste A/B no banco de dados
 */
export async function saveEventToDatabaseAction(eventData: AbTestEventServerData): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Server] Iniciando processamento do evento:', eventData.eventType);
    
    // Verificar se o teste existe
    const testExists = await prisma.abTest.findUnique({
      where: { name: eventData.testId }
    });
    
    console.log('[Server] Teste existe?', !!testExists);
    
    if (!testExists) {
      console.log('[Server] Criando novo teste:', eventData.testId);
      // Se o teste não existir, vamos criá-lo
      await prisma.abTest.create({
        data: {
          name: eventData.testId,
          description: `Teste criado automaticamente a partir de evento`,
        }
      });
    }
    
    // Obter o ID do teste
    const test = await prisma.abTest.findUnique({
      where: { name: eventData.testId },
      select: { id: true }
    });
    
    if (!test) {
      console.error('[Server] Teste não encontrado após tentativa de criação');
      throw new Error(`Teste com ID ${eventData.testId} não encontrado`);
    }
    
    console.log('[Server] ID do teste:', test.id);
    
    // Verificar se a variante existe
    const variantExists = await prisma.variant.findFirst({
      where: { 
        name: eventData.variantId, 
        testId: test.id
      }
    });
    
    console.log('[Server] Variante existe?', !!variantExists);
    
    if (!variantExists) {
      console.log('[Server] Criando nova variante:', eventData.variantId);
      // Se a variante não existir, vamos criá-la
      await prisma.variant.create({
        data: {
          name: eventData.variantId, 
          weight: 50, // Peso padrão
          testId: test.id
        }
      });
    }
    
    // Obter o ID da variante
    const variant = await prisma.variant.findFirst({
      where: { 
        name: eventData.variantId, 
        testId: test.id
      },
      select: { id: true }
    });
    
    if (!variant) {
      console.error('[Server] Variante não encontrada após tentativa de criação');
      throw new Error(`Variante com ID ${eventData.variantId} não encontrada`);
    }
    
    console.log('[Server] ID da variante:', variant.id);
    
    // Criar o evento no banco de dados
    console.log('[Server] Criando evento no banco de dados');
    await prisma.abEvent.create({
      data: {
        testId: test.id,
        variantId: variant.id,
        eventType: eventData.eventType,
        sessionId: eventData.sessionId,
        url: eventData.url,
        
        // Dados de localização
        country: eventData.country,
        state: eventData.state,
        city: eventData.city,
        
        // Dados de UTM
        utmSource: eventData.utmSource,
        utmMedium: eventData.utmMedium,
        utmCampaign: eventData.utmCampaign,
        utmTerm: eventData.utmTerm,
        utmContent: eventData.utmContent,
      }
    });
    
    console.log('[Server] Evento criado com sucesso');
    return { success: true };
  } catch (error) {
    console.error('[Server] Erro ao salvar evento no banco de dados:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}
