import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { abTests } from '@/lib/abTest';

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

/**
 * Função para gerar cores para as variantes
 */
function getVariantColor(variant: string): string {
  const colors = {
    a: '#4F46E5', // Indigo
    b: '#7C3AED', // Violet
    c: '#EC4899', // Pink
    d: '#F59E0B', // Amber
  };
  
  return colors[variant as keyof typeof colors] || '#6B7280'; // Gray default
}

export async function GET(request: Request) {
  // Extrair o parâmetro de consulta testName
  const url = new URL(request.url);
  const testName = url.searchParams.get('testName');
  
  // Buscar todos os resultados dos testes A/B do banco de dados
  let query = {};
  
  if (testName) {
    query = {
      where: {
        testName
      }
    };
  }
  
  const results = await prisma.abResult.findMany({
    ...query,
    orderBy: { createdAt: 'desc' }
  }) as unknown as AbResultType[];

  // Preparar dados para a visualização
  interface TestData {
    name: string;
    totalViews: number;
    totalUniqueViews: number;
    totalConversions: number;
    conversionRate: number;
    averageConversionRate: number;
    winningVariant: string | null;
    funnelData?: Array<{
      id: string;
      label: string;
      value: number;
      color?: string;
    }>;
    variants: Record<string, {
      views: number;
      conversions: number;
      conversionRate: number;
      color: string;
      uniqueVisitors: Set<string> | number;
    }>;
  }

  const testsData: Record<string, TestData> = {};
  const uniqueVisitorsByTest: Record<string, Set<string>> = {};
  const uniqueVisitorsConverted: Record<string, Set<string>> = {};

  // Inicializar estrutura de resultados
  Object.keys(abTests).forEach(testName => {
    testsData[testName] = {
      name: abTests[testName]?.name || testName,
      totalViews: 0,
      totalUniqueViews: 0,
      totalConversions: 0,
      conversionRate: 0,
      averageConversionRate: 0,
      variants: {},
      winningVariant: null
    };
    
    uniqueVisitorsByTest[testName] = new Set();
    uniqueVisitorsConverted[testName] = new Set();
    
    // Inicializar contadores para cada variante
    Object.keys(abTests[testName].variants).forEach(variant => {
      testsData[testName].variants[variant] = {
        views: 0,
        conversions: 0,
        conversionRate: 0,
        color: getVariantColor(variant),
        uniqueVisitors: new Set()
      };
    });
  });

  // Processar resultados
  results.forEach((result) => {
    const { variant, event, visitorId } = result;
    let { testName } = result;
    
    // Verificar se o testName está em formato kebab-case e convertê-lo para camelCase
    if (testName.includes('-')) {
      testName = testName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    }
    
    // Verificar se o teste e a variante existem na estrutura
    if (!testsData[testName]) {
      testsData[testName] = {
        name: abTests[testName]?.name || testName,
        totalViews: 0,
        totalUniqueViews: 0,
        totalConversions: 0,
        conversionRate: 0,
        averageConversionRate: 0,
        variants: {},
        winningVariant: null
      };
      
      uniqueVisitorsByTest[testName] = new Set();
      uniqueVisitorsConverted[testName] = new Set();
    }
    
    if (!testsData[testName].variants[variant]) {
      testsData[testName].variants[variant] = {
        views: 0,
        conversions: 0,
        conversionRate: 0,
        color: getVariantColor(variant),
        uniqueVisitors: new Set()
      };
    }
    
    // Incrementar contadores
    if (event === 'view') {
      testsData[testName].variants[variant].views++;
      testsData[testName].totalViews++;
      // Garantir que uniqueVisitors é um Set antes de chamar add
      const uniqueVisitors = testsData[testName].variants[variant].uniqueVisitors;
      if (uniqueVisitors instanceof Set) {
        uniqueVisitors.add(visitorId);
      }
      uniqueVisitorsByTest[testName].add(visitorId);
    } else if (event === 'conversion') {
      testsData[testName].variants[variant].conversions++;
      testsData[testName].totalConversions++;
      uniqueVisitorsConverted[testName].add(visitorId);
    }
  });

  // Calcular taxas de conversão e determinar variante vencedora
  Object.keys(testsData).forEach(testName => {
    let highestRate = -1;
    let winningVariant = null;
    
    testsData[testName].totalUniqueViews = uniqueVisitorsByTest[testName].size;
    
    // Calcular taxas para variantes
    Object.keys(testsData[testName].variants).forEach(variant => {
      const variantData = testsData[testName].variants[variant];
      const { views, conversions } = variantData;
      const rate = views > 0 ? (conversions / views) * 100 : 0;
      
      variantData.conversionRate = rate;
      // Converter Set para número antes de atribuir
      if (variantData.uniqueVisitors instanceof Set) {
        variantData.uniqueVisitors = variantData.uniqueVisitors.size;
      }

      // Verificar se é a variante vencedora
      if (views >= 100 && rate > highestRate) { // Mínimo de 100 visualizações para considerar
        highestRate = rate;
        winningVariant = variant;
      }
    });

    // Definir variante vencedora e calcular média geral
    testsData[testName].winningVariant = winningVariant;
    testsData[testName].averageConversionRate = 
      testsData[testName].totalViews > 0 
      ? (testsData[testName].totalConversions / testsData[testName].totalViews) * 100 
      : 0;
    
    // Preparar dados para o gráfico de funil
    testsData[testName].funnelData = [
      {
        id: 'visitors',
        label: 'Visitantes',
        value: testsData[testName].totalViews,
        color: '#4F46E5'
      },
      {
        id: 'uniqueVisitors',
        label: 'Visitantes Únicos',
        value: testsData[testName].totalUniqueViews,
        color: '#7C3AED'
      },
      {
        id: 'conversions',
        label: 'Conversões',
        value: testsData[testName].totalConversions,
        color: '#EC4899'
      }
    ];
  });

  return NextResponse.json({ testsData });
}
