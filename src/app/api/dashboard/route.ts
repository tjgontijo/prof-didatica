import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { abTests } from '@/lib/abTest';
import { TestData, DashboardData } from '@/components/dashboard/types';

/**
 * Função para gerar cores para as variantes
 */
function getVariantColor(variant: string): string {
  // Mapeamento fixo de variantes para cores
  const colorMap: Record<string, string> = {
    a: '#4f46e5', // indigo
    b: '#0891b2', // cyan
    c: '#7c3aed', // violet
    d: '#16a34a', // green
    e: '#ea580c', // orange
  };

  return colorMap[variant.toLowerCase()] || '#6b7280'; // gray como fallback
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
  });

  // Preparar dados para a visualização
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
      averageConversionRate: 0,
      variants: {},
      winningVariant: null,
      funnelData: []
    };
    uniqueVisitorsByTest[testName] = new Set();
    uniqueVisitorsConverted[testName] = new Set();
  });

  // Processar resultados
  results.forEach(result => {
    const { testName, variant, event, visitorId } = result;
    
    // Ignorar testes que não estão configurados
    if (!testsData[testName]) return;
    
    // Inicializar dados da variante se necessário
    if (!testsData[testName].variants[variant]) {
      testsData[testName].variants[variant] = {
        views: 0,
        conversions: 0,
        conversionRate: 0,
        color: getVariantColor(variant),
        uniqueVisitors: 0
      };
    }
    
    // Incrementar contadores
    if (event === 'view') {
      testsData[testName].totalViews++;
      testsData[testName].variants[variant].views++;
      
      // Rastrear visitantes únicos
      uniqueVisitorsByTest[testName].add(visitorId);
      
      // Rastrear visitantes únicos por variante
      const uniqueVisitorsByVariant = new Set<string>();
      results
        .filter(r => r.testName === testName && r.variant === variant)
        .forEach(r => uniqueVisitorsByVariant.add(r.visitorId));
      
      testsData[testName].variants[variant].uniqueVisitors = uniqueVisitorsByVariant.size;
    } else if (event === 'conversion') {
      testsData[testName].totalConversions++;
      testsData[testName].variants[variant].conversions++;
      
      // Rastrear conversões únicas
      uniqueVisitorsConverted[testName].add(visitorId);
    }
  });

  // Calcular taxas de conversão e determinar vencedor
  Object.keys(testsData).forEach(testName => {
    const testData = testsData[testName];
    testData.totalUniqueViews = uniqueVisitorsByTest[testName].size;
    
    // Calcular taxa de conversão média
    if (testData.totalViews > 0) {
      testData.averageConversionRate = (testData.totalConversions / testData.totalViews) * 100;
    }
    
    // Calcular taxas de conversão por variante
    let highestRate = 0;
    let winningVariant = null;
    
    Object.keys(testData.variants).forEach(variant => {
      const variantData = testData.variants[variant];
      
      if (variantData.views > 0) {
        variantData.conversionRate = (variantData.conversions / variantData.views) * 100;
        
        // Determinar vencedor (variante com maior taxa de conversão)
        if (variantData.conversionRate > highestRate && variantData.views >= 30) { // Mínimo de 30 visualizações para considerar
          highestRate = variantData.conversionRate;
          winningVariant = variant;
        }
      }
    });
    
    testData.winningVariant = winningVariant;
    
    // Preparar dados para o gráfico de funil
    const funnelData = [];
    
    // Adicionar visualizações ao funil
    funnelData.push({
      id: 'views',
      label: 'Visualizações',
      value: testData.totalViews,
      color: '#4f46e5' // indigo
    });
    
    // Adicionar conversões ao funil
    funnelData.push({
      id: 'conversions',
      label: 'Conversões',
      value: testData.totalConversions,
      color: '#16a34a' // green
    });
    
    testData.funnelData = funnelData;
  });

  // Retornar dados formatados
  const dashboardData: DashboardData = {
    testsData
  };

  return NextResponse.json(dashboardData);
}