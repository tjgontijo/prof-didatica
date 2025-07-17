'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Importações dos componentes organizados
import { Filter } from '@/components/dashboard/Filter';
import { MetricCards } from '@/components/dashboard/Cards';
import { Funnel } from '@/components/dashboard/Funnel';
import { VariantsPerformance } from '@/components/dashboard/VariantsPerformance';
import { DashboardData, TestData } from '@/components/dashboard/types';

// Interface para última atualização
interface LastUpdateProps {
  timestamp: string;
}

function LastUpdate({ timestamp }: LastUpdateProps): JSX.Element {
  return (
    <div className="flex justify-end mb-4">
      <div className="text-sm text-gray-500">
        Última atualização: <span className="font-medium">{timestamp}</span>
      </div>
    </div>
  );
}

/**
 * Componente para o estado de carregamento
 */
function LoadingState(): JSX.Element {
  return (
    <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
}

// Componentes migrados para arquivos independentes

/**
 * Componente para o estado sem dados
 */
function EmptyState(): JSX.Element {
  return (
    <div className="bg-white p-12 rounded-lg shadow-md text-center">
      <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
      </svg>
      <h3 className="mt-4 text-xl font-medium text-gray-900">Nenhum dado disponível</h3>
      <p className="mt-2 text-gray-500">Ainda não há resultados de testes A/B registrados no sistema.</p>
    </div>
  );
}

/**
 * Componente para o estado de erro
 */
function ErrorState({ error, onRetry }: { error: string, onRetry: () => void }): JSX.Element {
  return (
    <div className="bg-red-50 p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-red-800 mb-2">Erro</h3>
      <p className="text-red-700">{error}</p>
      <button 
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        onClick={onRetry}
      >
        Tentar novamente
      </button>
    </div>
  );
}

/**
 * Componente para o cabeçalho do teste
 */
function TestHeader({ name }: { name: string }): JSX.Element {
  return (
    <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
        <span className="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
          Ativo
        </span>
      </div>
    </div>
  );
}

/**
 * Componente para exibir o card do teste
 */
function TestCard({ testData }: { testData: TestData }): JSX.Element {
  return (
    <div className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
      <TestHeader name={testData.name} />
      
      <MetricCards 
        totalViews={testData.totalViews}
        totalUniqueViews={testData.totalUniqueViews}
        totalConversions={testData.totalConversions}
        averageConversionRate={testData.averageConversionRate}
        winningVariant={testData.winningVariant}
      />
      
      <VariantsPerformance 
        variants={testData.variants}
        winningVariant={testData.winningVariant}
      />
    </div>
  );
}

/**
 * Componente principal do dashboard client-side
 */
export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Obter parâmetro testName da URL, se disponível
  const testNameParam = searchParams.get('testName');
  
  // Inicializar o teste selecionado com o parâmetro da URL
  useEffect(() => {
    if (testNameParam) {
      setSelectedTest(testNameParam);
    }
  }, [testNameParam]);

  // Função para buscar dados da API
  const fetchData = async (testName?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = testName 
        ? `/api/admin/ab-tests?testName=${encodeURIComponent(testName)}` 
        : '/api/admin/ab-tests';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar dados: ${response.status}`);
      }
      
      const jsonData = await response.json();
      setData(jsonData);
      
      // Definir a data de última atualização
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      setLastUpdate(formatter.format(now));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Manipulador para mudança de teste selecionado
  const handleTestSelect = (testName: string) => {
    const nextTest = testName || null;
    setSelectedTest(nextTest);
    
    // Atualizar URL com parâmetro de consulta
    if (nextTest) {
      router.push(`/admin/ab-tests?testName=${encodeURIComponent(nextTest)}`);
    } else {
      router.push('/admin/ab-tests');
    }
    
    // Buscar dados filtrados
    fetchData(nextTest || undefined);
  };

  // Buscar dados iniciais
  useEffect(() => {
    fetchData(testNameParam || undefined);
  }, [testNameParam]);

  // Função não é mais necessária pois foi migrada para o componente VariantsPerformance
  
  // Renderizar estado de carregamento
  if (loading) {
    return <LoadingState />;
  }

  // Renderizar erro
  if (error) {
    return <ErrorState error={error} onRetry={() => fetchData(selectedTest || undefined)} />;
  }

  // Renderizar quando não há dados
  if (!data || Object.keys(data.testsData).length === 0) {
    return <EmptyState />;
  }

  // Lista de testes disponíveis para o seletor
  const availableTests = Object.keys(data.testsData);
  
  // Filtrar testes com base no teste selecionado
  const testsToShow = selectedTest ? 
    { [selectedTest]: data.testsData[selectedTest] } : 
    data.testsData;

  return (
    <div>
      {/* Filtro de testes */}
      <Filter 
        tests={availableTests} 
        selectedTest={selectedTest} 
        onSelectTest={handleTestSelect} 
      />

      {/* Última atualização */}
      <LastUpdate timestamp={lastUpdate} />

      {/* Iterar sobre os testes filtrados */}
      {Object.entries(testsToShow).map(([testName, testData]) => {
        return (
          <div key={testName} className="mb-8">
            {/* Gráfico de funil para o teste */}
            <Funnel data={testData.funnelData} />
            
            {/* Card do teste com métricas e variantes */}
            <TestCard testData={testData} />
          </div>
        );
      })}
    </div>
  );
}
