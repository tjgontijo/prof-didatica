import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Interface para o resultado do teste A/B
interface AbResultType {
  id: string;
  testName: string;
  variant: string;
  event: string;
  visitorId: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  createdAt: Date;
}

interface UtmPerformanceData {
  source: Record<string, { views: number, conversions: number, rate: number }>;
  campaign: Record<string, { views: number, conversions: number, rate: number }>;
  medium: Record<string, { views: number, conversions: number, rate: number }>;
  term: Record<string, { views: number, conversions: number, rate: number }>;
}

export async function GET(request: Request) {
  // Extrair o parâmetro de consulta testName
  const url = new URL(request.url);
  const testName = url.searchParams.get('testName');
  
  // Definir a consulta base
  let whereClause = {};
  if (testName) {
    whereClause = { testName };
  }
  
  // Buscar resultados do banco de dados
  const results = await prisma.abResult.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' }
  }) as unknown as AbResultType[];

  // Estruturas para agregar dados de UTM
  const utmData: UtmPerformanceData = {
    source: {},
    campaign: {},
    medium: {},
    term: {}
  };
  
  // Conjuntos para rastrear visitantes únicos por UTM
  const uniqueVisitorsByUtmSource: Record<string, Set<string>> = {};
  const uniqueVisitorsByUtmCampaign: Record<string, Set<string>> = {};
  const uniqueVisitorsByUtmMedium: Record<string, Set<string>> = {};
  const uniqueVisitorsByUtmTerm: Record<string, Set<string>> = {};
  
  // Processar resultados
  for (const result of results) {
    const { event, visitorId, utmSource, utmMedium, utmCampaign, utmTerm } = result;
    
    // Processar UTM Source
    const source = utmSource || '(não definido)';
    if (!utmData.source[source]) {
      utmData.source[source] = { views: 0, conversions: 0, rate: 0 };
      uniqueVisitorsByUtmSource[source] = new Set();
    }
    
    // Processar UTM Campaign
    const campaign = utmCampaign || '(não definido)';
    if (!utmData.campaign[campaign]) {
      utmData.campaign[campaign] = { views: 0, conversions: 0, rate: 0 };
      uniqueVisitorsByUtmCampaign[campaign] = new Set();
    }
    
    // Processar UTM Medium
    const medium = utmMedium || '(não definido)';
    if (!utmData.medium[medium]) {
      utmData.medium[medium] = { views: 0, conversions: 0, rate: 0 };
      uniqueVisitorsByUtmMedium[medium] = new Set();
    }
    
    // Processar UTM Term
    const term = utmTerm || '(não definido)';
    if (!utmData.term[term]) {
      utmData.term[term] = { views: 0, conversions: 0, rate: 0 };
      uniqueVisitorsByUtmTerm[term] = new Set();
    }
    
    // Incrementar contadores com base no tipo de evento
    if (event === 'view') {
      utmData.source[source].views++;
      utmData.campaign[campaign].views++;
      utmData.medium[medium].views++;
      utmData.term[term].views++;
      
      // Adicionar visitante único
      uniqueVisitorsByUtmSource[source].add(visitorId);
      uniqueVisitorsByUtmCampaign[campaign].add(visitorId);
      uniqueVisitorsByUtmMedium[medium].add(visitorId);
      uniqueVisitorsByUtmTerm[term].add(visitorId);
    } else if (event === 'conversion') {
      utmData.source[source].conversions++;
      utmData.campaign[campaign].conversions++;
      utmData.medium[medium].conversions++;
      utmData.term[term].conversions++;
    }
  }
  
  // Calcular taxas de conversão e transformar em arrays para facilitar a ordenação no frontend
  const processUtmData = (data: Record<string, { views: number, conversions: number, rate: number }>, uniqueVisitors: Record<string, Set<string>>) => {
    return Object.entries(data).map(([name, stats]) => {
      // Usar o número de visitantes únicos em vez do número total de visualizações
      const uniqueVisitorCount = uniqueVisitors[name]?.size || 0;
      const rate = uniqueVisitorCount > 0 ? (stats.conversions / uniqueVisitorCount) * 100 : 0;
      return {
        name,
        views: stats.views,
        uniqueVisitors: uniqueVisitorCount,
        conversions: stats.conversions,
        rate: parseFloat(rate.toFixed(2))
      };
    }).sort((a, b) => b.rate - a.rate);
  };
  
  const formattedData = {
    source: processUtmData(utmData.source, uniqueVisitorsByUtmSource),
    campaign: processUtmData(utmData.campaign, uniqueVisitorsByUtmCampaign),
    medium: processUtmData(utmData.medium, uniqueVisitorsByUtmMedium),
    term: processUtmData(utmData.term, uniqueVisitorsByUtmTerm)
  };
  
  return NextResponse.json(formattedData);
}
