"use client";

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Importar o componente de mapa de forma dinâmica para evitar problemas de SSR
const MapWithNoSSR = dynamic(
  () => import('../components/LocationMap'),
  { ssr: false }
);

// Registrar componentes do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Paleta de cores inspirada no Workana (com azul roxo como primário)
const workanaColors = {
  primary: '#5e4fd1', // Azul roxo principal do Workana
  secondary: '#4a3eb9', // Azul roxo mais escuro
  accent: '#f7a839', // Laranja para destaque
  lightPurple: '#f0eeff', // Roxo claro para fundos
  lightGray: '#f9f9f9', // Cinza claro para fundos
  mediumGray: '#e0e0e0', // Cinza médio para bordas
  darkGray: '#4d525b', // Cinza escuro para textos
  white: '#ffffff',
  black: '#222222',
  success: '#14a800', // Verde para taxas positivas
  successLight: '#e4f7df', // Verde claro para fundos
};

// Cores para gráficos
const chartColors = [
  workanaColors.primary,
  workanaColors.accent,
  '#3498db', // Azul
  '#9b59b6', // Roxo
  '#f1c40f', // Amarelo
  '#e74c3c', // Vermelho
  '#1abc9c', // Verde água
  '#34495e', // Azul escuro
  '#d35400', // Laranja escuro
  '#7f8c8d', // Cinza
];

type Variant = {
  id: string;
  name: string;
  weight: number;
  pageviews: number;
  conversions: number;
  conversionRate: number;
  lastPageview: string | null;
  lastConversion: string | null;
};

type UtmStats = {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  term: string | null;
  variants: Record<string, {
    pageviews: number;
    conversions: number;
    conversionRate: number;
  }>;
  totalPageviews: number;
  totalConversions: number;
  conversionRate: number;
};

type LocationStat = {
  country: string | null;
  city: string | null;
  state: string | null;
  count: number;
  eventType: string;
  pageviews?: number;
  conversions?: number;
  conversionRate?: number;
  latitude?: number;
  longitude?: number;
};

type TestWithStats = {
  id: string;
  testId: string;
  name: string;
  description: string | null;
  createdAt: string;
  variants: Record<string, Variant>;
  utmStats?: Record<string, UtmStats>;
  locationStats?: LocationStat[];
};

// Função para extrair informações do formato de UTM do Meta Ads
const parseMetaUtm = (utmString: string | null) => {
  if (!utmString) return { name: 'Desconhecido', id: '' };
  
  const parts = utmString.split('|');
  if (parts.length !== 2) return { name: utmString, id: '' };
  
  return { name: parts[0].trim(), id: parts[1].trim() };
};

export default function DashboardPage() {
  const [tests, setTests] = useState<TestWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'utm' | 'location'>('overview');
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/ab-test/stats');
        
        if (!response.ok) {
          throw new Error(`Erro ao carregar dados: ${response.status}`);
        }
        
        const data = await response.json();
        setTests(data);
        
        // Selecionar o primeiro teste por padrão
        if (data.length > 0 && !selectedTest) {
          setSelectedTest(data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        console.error('Erro ao buscar dados:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedTest]);

  // Formatar data
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Obter o teste selecionado
  const currentTest = tests.find(test => test.id === selectedTest);

  // Processar dados para o gráfico de pizza
  const pieChartData = useMemo(() => {
    if (!currentTest) return null;
    
    const variants = Object.values(currentTest.variants);
    return {
      labels: variants.map(v => v.name),
      datasets: [
        {
          label: 'Visualizações',
          data: variants.map(v => v.pageviews),
          backgroundColor: chartColors,
          borderColor: chartColors.map(color => color.replace('0.6', '1')),
          borderWidth: 1,
        },
      ],
    };
  }, [currentTest]);

  // Processar dados para o gráfico de barras
  const barChartData = useMemo(() => {
    if (!currentTest || !currentTest.utmStats) return {
      labels: [],
      datasets: []
    };
    
    const utmSources = Object.keys(currentTest.utmStats);
    if (utmSources.length === 0) return {
      labels: [],
      datasets: []
    };
    
    const labels = utmSources;
    const datasets = [
      {
        label: 'Taxa de Conversão (%)',
        data: utmSources.map(source => {
          const stats = currentTest.utmStats![source];
          return stats.conversionRate;
        }),
        backgroundColor: chartColors,
        borderColor: chartColors.map(color => color.replace('0.6', '1')),
        borderWidth: 1,
      },
    ];
    
    return { labels, datasets };
  }, [currentTest]);

  // Preparar dados para o mapa
  const mapMarkers = useMemo(() => {
    if (!currentTest || !currentTest.locationStats) return [];
    
    return currentTest.locationStats
      .filter(loc => loc.latitude && loc.longitude) // Filtrar apenas locais com coordenadas
      .map(loc => ({
        position: [loc.latitude || 0, loc.longitude || 0] as [number, number],
        name: `${loc.city || ''}, ${loc.state || ''}, ${loc.country || ''}`,
        pageviews: loc.pageviews || 0,
        conversions: loc.conversions || 0,
        conversionRate: loc.conversionRate || 0,
      }));
  }, [currentTest]);

  // Verificar se há dados de UTM
  const hasUtmData = useMemo(() => {
    if (!currentTest || !currentTest.utmStats) return false;
    return Object.keys(currentTest.utmStats).length > 0;
  }, [currentTest]);

  // Verificar se há dados de localização
  const hasLocationData = useMemo(() => {
    if (!currentTest || !currentTest.locationStats) return false;
    return currentTest.locationStats.length > 0 && 
           currentTest.locationStats.some(loc => loc.latitude && loc.longitude);
  }, [currentTest]);

  // Configurações do gráfico de barras
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: workanaColors.darkGray,
          font: {
            size: 12,
          }
        }
      },
      title: {
        display: true,
        text: 'Taxa de Conversão por Campanha',
        color: workanaColors.darkGray,
        font: {
          size: 16,
          weight: 'bold' as const,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Taxa de Conversão (%)',
          color: workanaColors.darkGray,
        },
        ticks: {
          color: workanaColors.darkGray,
        },
        grid: {
          color: workanaColors.mediumGray,
        }
      },
      x: {
        ticks: {
          color: workanaColors.darkGray,
        },
        grid: {
          color: workanaColors.mediumGray,
        }
      }
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-[95%] xl:max-w-[90%]">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: workanaColors.darkGray }}>
            Dashboard de Testes A/B
          </h1>
          <p className="text-gray-600">
            Visualize estatísticas globais de todos os testes A/B armazenados no banco de dados.
          </p>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: workanaColors.primary }}></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p><strong>Erro:</strong> {error}</p>
            <p className="mt-2">Verifique se o banco de dados está configurado corretamente e se a API está funcionando.</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p><strong>Nenhum dado encontrado.</strong></p>
            <p className="mt-2">
              Nenhum teste A/B foi registrado no banco de dados ainda. 
              Navegue pelo site para gerar alguns eventos ou use a API de seed para criar dados de teste.
            </p>
            <button
              onClick={async () => {
                try {
                  setIsLoading(true);
                  const response = await fetch('/api/ab-test/seed');
                  if (!response.ok) {
                    throw new Error(`Erro ao criar dados de teste: ${response.status}`);
                  }
                  const data = await response.json();
                  alert(`Dados de teste criados com sucesso: ${data.message}`);
                  window.location.reload();
                } catch (err) {
                  alert(`Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
                } finally {
                  setIsLoading(false);
                }
              }}
              className="mt-4 font-bold py-2 px-4 rounded transition-colors"
              style={{ 
                backgroundColor: workanaColors.primary, 
                color: workanaColors.white,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = workanaColors.secondary;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = workanaColors.primary;
              }}
            >
              Criar Dados de Teste
            </button>
          </div>
        ) : (
          <div>
            {/* Seletor de Teste */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm" style={{ borderLeft: `4px solid ${workanaColors.primary}` }}>
              <label htmlFor="test-select" className="block text-sm font-medium mb-1" style={{ color: workanaColors.darkGray }}>
                Selecione um Teste:
              </label>
              <select
                id="test-select"
                value={selectedTest || ''}
                onChange={(e) => setSelectedTest(e.target.value)}
                className="block w-full p-2 border rounded-md shadow-sm focus:ring focus:border"
                style={{ 
                  borderColor: workanaColors.mediumGray,
                  color: workanaColors.darkGray,
                  outline: 'none'
                }}
              >
                {tests.map((test) => (
                  <option key={test.id} value={test.id}>
                    {test.name} ({test.testId})
                  </option>
                ))}
              </select>
            </div>

            {currentTest && (
              <>
                {/* Tabs de Navegação */}
                <div className="border-b mb-6" style={{ borderColor: workanaColors.mediumGray }}>
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                      style={{ 
                        borderColor: activeTab === 'overview' ? workanaColors.primary : 'transparent',
                        color: activeTab === 'overview' ? workanaColors.primary : workanaColors.darkGray
                      }}
                    >
                      Visão Geral
                    </button>
                    <button
                      onClick={() => setActiveTab('utm')}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                      style={{ 
                        borderColor: activeTab === 'utm' ? workanaColors.primary : 'transparent',
                        color: activeTab === 'utm' ? workanaColors.primary : workanaColors.darkGray
                      }}
                    >
                      Análise de UTM
                    </button>
                    <button
                      onClick={() => setActiveTab('location')}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                      style={{ 
                        borderColor: activeTab === 'location' ? workanaColors.primary : 'transparent',
                        color: activeTab === 'location' ? workanaColors.primary : workanaColors.darkGray
                      }}
                    >
                      Mapa de Conversões
                    </button>
                  </nav>
                </div>

                {/* Conteúdo da Tab Selecionada */}
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold" style={{ color: workanaColors.darkGray }}>{currentTest.name}</h2>
                    <p className="text-gray-600 text-sm">ID: {currentTest.testId}</p>
                    {currentTest.description && (
                      <p className="mt-2 text-gray-700">{currentTest.description}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Criado em: {formatDate(currentTest.createdAt)}
                    </p>
                  </div>

                  {/* Tab de Visão Geral */}
                  {activeTab === 'overview' && (
                    <div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                          <thead>
                            <tr className="text-gray-600 uppercase text-sm leading-normal" style={{ backgroundColor: workanaColors.lightGray }}>
                              <th className="py-3 px-6 text-left">Variante</th>
                              <th className="py-3 px-6 text-center">Peso</th>
                              <th className="py-3 px-6 text-center">Visualizações</th>
                              <th className="py-3 px-6 text-center">Conversões</th>
                              <th className="py-3 px-6 text-center">Taxa de Conversão</th>
                              <th className="py-3 px-6 text-center">Última Visualização</th>
                              <th className="py-3 px-6 text-center">Última Conversão</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-600 text-sm">
                            {Object.entries(currentTest.variants).map(([variantId, variant]) => (
                              <tr key={variant.id} className="border-b hover:bg-gray-50" style={{ borderColor: workanaColors.mediumGray }}>
                                <td className="py-3 px-6 text-left">
                                  <div className="font-medium">{variant.name}</div>
                                  <div className="text-xs text-gray-500">ID: {variantId}</div>
                                </td>
                                <td className="py-3 px-6 text-center">{variant.weight}</td>
                                <td className="py-3 px-6 text-center">{variant.pageviews}</td>
                                <td className="py-3 px-6 text-center">{variant.conversions}</td>
                                <td className="py-3 px-6 text-center">
                                  <span className="px-2 py-1 rounded-full text-xs" style={{ 
                                    backgroundColor: workanaColors.successLight,
                                    color: workanaColors.success
                                  }}>
                                    {variant.conversionRate.toFixed(2)}%
                                  </span>
                                </td>
                                <td className="py-3 px-6 text-center text-xs">
                                  {formatDate(variant.lastPageview)}
                                </td>
                                <td className="py-3 px-6 text-center text-xs">
                                  {formatDate(variant.lastConversion)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Gráficos de Visão Geral */}
                      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <h3 className="text-lg font-semibold mb-4" style={{ color: workanaColors.darkGray }}>Distribuição de Conversões</h3>
                          <div className="h-64">
                            <Pie data={pieChartData} />
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <h3 className="text-lg font-semibold mb-2" style={{ color: workanaColors.darkGray }}>Comparação de Taxas de Conversão</h3>
                          <div className="space-y-2">
                            {Object.values(currentTest.variants).map((variant) => (
                              <div key={`bar-${variant.id}`} className="flex items-center">
                                <div className="w-24 text-sm">{variant.name}:</div>
                                <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full rounded-full"
                                    style={{ 
                                      width: `${Math.min(variant.conversionRate * 2, 100)}%`,
                                      backgroundColor: workanaColors.primary
                                    }}
                                  ></div>
                                </div>
                                <div className="ml-2 text-sm">{variant.conversionRate.toFixed(2)}%</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab de Análise de UTM */}
                  {activeTab === 'utm' && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4" style={{ color: workanaColors.darkGray }}>Análise de Campanhas (UTM)</h3>
                      
                      {hasUtmData ? (
                        <div>
                          {/* Gráfico de Barras para UTM */}
                          <div className="mb-8 h-80">
                            <Bar data={barChartData} options={barOptions} />
                          </div>
                          
                          {/* Tabela de UTM */}
                          <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                              <thead>
                                <tr className="text-gray-600 uppercase text-sm leading-normal" style={{ backgroundColor: workanaColors.lightGray }}>
                                  <th className="py-3 px-6 text-left">Campanha</th>
                                  <th className="py-3 px-6 text-left">Conjunto de Anúncios</th>
                                  <th className="py-3 px-6 text-left">Anúncio</th>
                                  <th className="py-3 px-6 text-center">Visualizações</th>
                                  <th className="py-3 px-6 text-center">Conversões</th>
                                  <th className="py-3 px-6 text-center">Taxa de Conversão</th>
                                </tr>
                              </thead>
                              <tbody className="text-gray-600 text-sm">
                                {Object.entries(currentTest.utmStats || {})
                                  .filter(([_, data]) => data.source === 'FB')
                                  .sort((a, b) => b[1].conversionRate - a[1].conversionRate)
                                  .map(([key, data]) => {
                                    const campaign = parseMetaUtm(data.campaign);
                                    const adset = parseMetaUtm(data.medium);
                                    const ad = parseMetaUtm(data.content);
                                    
                                    return (
                                      <tr key={key} className="border-b hover:bg-gray-50" style={{ borderColor: workanaColors.mediumGray }}>
                                        <td className="py-3 px-6 text-left">
                                          <div className="font-medium">{campaign.name}</div>
                                          <div className="text-xs text-gray-500">{campaign.id}</div>
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                          <div className="font-medium">{adset.name}</div>
                                          <div className="text-xs text-gray-500">{adset.id}</div>
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                          <div className="font-medium">{ad.name}</div>
                                          <div className="text-xs text-gray-500">{ad.id}</div>
                                        </td>
                                        <td className="py-3 px-6 text-center">{data.totalPageviews}</td>
                                        <td className="py-3 px-6 text-center">{data.totalConversions}</td>
                                        <td className="py-3 px-6 text-center">
                                          <span className="px-2 py-1 rounded-full text-xs" style={{ 
                                            backgroundColor: workanaColors.successLight,
                                            color: workanaColors.success
                                          }}>
                                            {data.conversionRate.toFixed(2)}%
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                          <p>Nenhum dado de UTM encontrado para este teste.</p>
                          <p className="mt-2">
                            Tente gerar dados de teste com parâmetros UTM ou navegue pelo site com parâmetros UTM na URL.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab de Mapa de Conversões */}
                  {activeTab === 'location' && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4" style={{ color: workanaColors.darkGray }}>Mapa de Conversões</h3>
                      
                      {hasLocationData ? (
                        <div>
                          {/* Mapa */}
                          <div className="h-[500px] mb-8 rounded-lg overflow-hidden border" style={{ borderColor: workanaColors.mediumGray }}>
                            <MapWithNoSSR markers={mapMarkers} />
                          </div>
                          
                          {/* Tabela de Localizações */}
                          <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                              <thead>
                                <tr className="text-gray-600 uppercase text-sm leading-normal" style={{ backgroundColor: workanaColors.lightGray }}>
                                  <th className="py-3 px-6 text-left">País</th>
                                  <th className="py-3 px-6 text-left">Estado</th>
                                  <th className="py-3 px-6 text-left">Cidade</th>
                                  <th className="py-3 px-6 text-center">Visualizações</th>
                                  <th className="py-3 px-6 text-center">Conversões</th>
                                  <th className="py-3 px-6 text-center">Taxa de Conversão</th>
                                </tr>
                              </thead>
                              <tbody className="text-gray-600 text-sm">
                                {currentTest.locationStats
                                  ?.sort((a, b) => (b.conversionRate || 0) - (a.conversionRate || 0))
                                  .map((location, idx) => (
                                    <tr key={idx} className="border-b hover:bg-gray-50" style={{ borderColor: workanaColors.mediumGray }}>
                                      <td className="py-3 px-6 text-left">{location.country || 'Desconhecido'}</td>
                                      <td className="py-3 px-6 text-left">{location.state || 'Desconhecido'}</td>
                                      <td className="py-3 px-6 text-left">{location.city || 'Desconhecido'}</td>
                                      <td className="py-3 px-6 text-center">{location.pageviews || 0}</td>
                                      <td className="py-3 px-6 text-center">{location.conversions || 0}</td>
                                      <td className="py-3 px-6 text-center">
                                        <span className="px-2 py-1 rounded-full text-xs" style={{ 
                                          backgroundColor: workanaColors.successLight,
                                          color: workanaColors.success
                                        }}>
                                          {location.conversionRate?.toFixed(2) || 0}%
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                          <p>Nenhum dado de localização encontrado para este teste.</p>
                          <p className="mt-2">
                            Tente gerar dados de teste com informações de localização ou navegue pelo site para gerar eventos com localização.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
