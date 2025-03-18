import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface EventStat {
  variantId: string;
  variantName: string;
  eventType: string;
  count: bigint;
  lastEventDate: Date | null;
}

interface UtmStat {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  eventType: string;
  count: bigint;
  variantId: string;
  variantName: string;
}

interface LocationStat {
  country: string | null;
  city: string | null;
  state: string | null;
  count: bigint;
  eventType: string;
  conversionRate?: number;
}

interface VariantStat {
  id: string;
  name: string;
  weight: number;
  pageviews: number;
  conversions: number;
  conversionRate: number;
  lastPageview: Date | null;
  lastConversion: Date | null;
}

// Função auxiliar para converter BigInt para Number
const serializeData = (data: unknown): unknown => {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data === 'bigint') {
    return Number(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => serializeData(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    return Object.fromEntries(
      Object.entries(data as Record<string, unknown>).map(([key, value]) => [key, serializeData(value)])
    );
  }
  
  return data;
};

export async function GET() {
  try {
    // Verificar se as tabelas existem
    try {
      await prisma.abTest.findFirst();
    } catch (dbError) {
      console.error('Erro ao acessar o banco de dados:', dbError);
      return NextResponse.json(
        { error: 'Banco de dados não está pronto ou não foi inicializado corretamente' },
        { status: 500 }
      );
    }

    // Buscar todos os testes
    const tests = await prisma.abTest.findMany({
      include: {
        variants: true,
      },
    });

    // Se não houver testes, retornar array vazio
    if (tests.length === 0) {
      return NextResponse.json([]);
    }

    // Para cada teste, buscar estatísticas de eventos
    const testsWithStats = await Promise.all(
      tests.map(async (test) => {
        try {
          // Buscar contagem de eventos por variante e tipo
          const eventStats = await prisma.$queryRaw<EventStat[]>`
            SELECT 
              v.id as variantId, 
              v.variantId as variantName,
              e.eventType, 
              COUNT(*) as count,
              MAX(e.createdAt) as lastEventDate
            FROM AbEvent e
            JOIN Variant v ON e.variantId = v.id
            WHERE e.testId = ${test.id}
            GROUP BY v.id, v.variantId, e.eventType
          `;

          // Buscar estatísticas de UTM
          const utmStats = await prisma.$queryRaw<UtmStat[]>`
            SELECT 
              e.utmSource,
              e.utmMedium,
              e.utmCampaign,
              e.eventType,
              COUNT(*) as count,
              v.id as variantId,
              v.variantId as variantName
            FROM AbEvent e
            JOIN Variant v ON e.variantId = v.id
            WHERE e.testId = ${test.id} AND (e.utmSource IS NOT NULL OR e.utmMedium IS NOT NULL OR e.utmCampaign IS NOT NULL)
            GROUP BY e.utmSource, e.utmMedium, e.utmCampaign, e.eventType, v.id, v.variantId
          `;

          // Buscar estatísticas de localização
          const locationStats = await prisma.$queryRaw<LocationStat[]>`
            SELECT 
              e.country,
              e.city,
              e.state,
              e.eventType,
              COUNT(*) as count
            FROM AbEvent e
            WHERE e.testId = ${test.id} AND e.country IS NOT NULL
            GROUP BY e.country, e.city, e.state, e.eventType
          `;

          // Organizar estatísticas por variante
          const variantStats: Record<string, VariantStat> = {};
          
          // Inicializar estatísticas para cada variante
          test.variants.forEach((variant) => {
            variantStats[variant.variantId] = {
              id: variant.id,
              name: variant.name || `Variante ${variant.variantId}`,
              weight: variant.weight,
              pageviews: 0,
              conversions: 0,
              conversionRate: 0,
              lastPageview: null,
              lastConversion: null,
            };
          });
          
          // Preencher estatísticas de eventos
          eventStats.forEach((stat) => {
            const variant = variantStats[stat.variantName];
            if (!variant) return;
            
            if (stat.eventType === 'pageview') {
              variant.pageviews = Number(stat.count);
              variant.lastPageview = stat.lastEventDate;
            } else if (stat.eventType === 'initiateCheckout') {
              variant.conversions = Number(stat.count);
              variant.lastConversion = stat.lastEventDate;
            }
            
            // Calcular taxa de conversão
            if (variant.pageviews > 0) {
              variant.conversionRate = (variant.conversions / variant.pageviews) * 100;
            }
          });

          // Processar estatísticas de localização
          const locationData: Record<string, LocationStat & { pageviews: number; conversions: number }> = {};
          
          locationStats.forEach((stat) => {
            const locationKey = `${stat.country || 'Unknown'}-${stat.state || 'Unknown'}-${stat.city || 'Unknown'}`;
            
            if (!locationData[locationKey]) {
              locationData[locationKey] = {
                country: stat.country,
                city: stat.city,
                state: stat.state,
                count: BigInt(0),
                eventType: '',
                pageviews: 0,
                conversions: 0,
                conversionRate: 0,
              };
            }
            
            if (stat.eventType === 'pageview') {
              locationData[locationKey].pageviews = Number(stat.count);
            } else if (stat.eventType === 'initiateCheckout') {
              locationData[locationKey].conversions = Number(stat.count);
            }
            
            locationData[locationKey].count = (locationData[locationKey].count || BigInt(0)) + stat.count;
          });
          
          // Calcular taxas de conversão para localizações
          Object.values(locationData).forEach((location) => {
            if (location.pageviews > 0) {
              location.conversionRate = (location.conversions / location.pageviews) * 100;
            }
          });

          // Processar estatísticas de UTM
          const utmData: Record<string, { 
            source: string | null; 
            medium: string | null; 
            campaign: string | null;
            variants: Record<string, { 
              pageviews: number; 
              conversions: number; 
              conversionRate: number;
            }>;
            totalPageviews: number;
            totalConversions: number;
            conversionRate: number;
          }> = {};
          
          utmStats.forEach((stat) => {
            const utmKey = `${stat.utmSource || 'direct'}-${stat.utmMedium || 'none'}-${stat.utmCampaign || 'none'}`;
            
            if (!utmData[utmKey]) {
              utmData[utmKey] = {
                source: stat.utmSource,
                medium: stat.utmMedium,
                campaign: stat.utmCampaign,
                variants: {},
                totalPageviews: 0,
                totalConversions: 0,
                conversionRate: 0,
              };
              
              // Inicializar dados para cada variante
              test.variants.forEach((variant) => {
                utmData[utmKey].variants[variant.variantId] = {
                  pageviews: 0,
                  conversions: 0,
                  conversionRate: 0,
                };
              });
            }
            
            const variantData = utmData[utmKey].variants[stat.variantName];
            if (!variantData) return;
            
            if (stat.eventType === 'pageview') {
              variantData.pageviews = Number(stat.count);
              utmData[utmKey].totalPageviews += Number(stat.count);
            } else if (stat.eventType === 'initiateCheckout') {
              variantData.conversions = Number(stat.count);
              utmData[utmKey].totalConversions += Number(stat.count);
            }
            
            // Calcular taxa de conversão para a variante
            if (variantData.pageviews > 0) {
              variantData.conversionRate = (variantData.conversions / variantData.pageviews) * 100;
            }
          });
          
          // Calcular taxas de conversão totais para UTMs
          Object.values(utmData).forEach((utm) => {
            if (utm.totalPageviews > 0) {
              utm.conversionRate = (utm.totalConversions / utm.totalPageviews) * 100;
            }
          });
          
          return {
            id: test.id,
            testId: test.testId,
            name: test.name,
            description: test.description,
            createdAt: test.createdAt,
            variants: variantStats,
            utmStats: utmData,
            locationStats: Object.values(locationData),
          };
        } catch (queryError) {
          console.error(`Erro ao processar estatísticas para o teste ${test.testId}:`, queryError);
          // Retornar dados básicos sem estatísticas em caso de erro
          return {
            id: test.id,
            testId: test.testId,
            name: test.name,
            description: test.description,
            createdAt: test.createdAt,
            variants: test.variants.reduce((acc, variant) => {
              acc[variant.variantId] = {
                id: variant.id,
                name: variant.name || `Variante ${variant.variantId}`,
                weight: variant.weight,
                pageviews: 0,
                conversions: 0,
                conversionRate: 0,
                lastPageview: null,
                lastConversion: null,
              };
              return acc;
            }, {} as Record<string, VariantStat>),
            error: 'Erro ao processar estatísticas'
          };
        }
      })
    );

    // Serializar dados para evitar problemas com BigInt
    const serializedData = serializeData(testsWithStats);
    return NextResponse.json(serializedData);
  } catch (error) {
    console.error('Erro ao buscar estatísticas de testes A/B:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) },
      { status: 500 }
    );
  }
}
