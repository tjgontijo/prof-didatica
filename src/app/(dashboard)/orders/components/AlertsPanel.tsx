import React, { useState } from 'react';
import { useAlerts } from '@/hooks/dashboard';
import { OrderFilters } from '@/types/dashboard';

interface AlertsPanelProps {
  initialFilters?: OrderFilters;
}

/**
 * Componente para exibir alertas do dashboard
 */
export const AlertsPanel: React.FC<AlertsPanelProps> = ({ initialFilters }) => {
  const { data, loading, error } = useAlerts(initialFilters);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Função para alternar a expansão de uma seção
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Função para renderizar um ícone baseado na severidade do alerta
  const renderSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <span className="text-red-600 text-xl">⚠️</span>;
      case 'medium':
        return <span className="text-yellow-500 text-xl">⚠</span>;
      case 'low':
        return <span className="text-blue-500 text-xl">ℹ️</span>;
      default:
        return null;
    }
  };

  // Função para formatar a data de detecção
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Renderiza os pedidos travados
  const renderStuckOrders = () => {
    if (!data?.stuckOrders?.length) {
      return <p className="text-gray-500">Nenhum pedido travado encontrado.</p>;
    }

    return (
      <div className="space-y-2">
        {data.stuckOrders.map((order) => (
          <div key={order.id} className="p-3 bg-gray-50 rounded-md">
            <div className="flex justify-between">
              <div>
                <span className="font-medium">Pedido #{order.orderNumber}</span>
                <p className="text-sm text-gray-600">Cliente: {order.customerName}</p>
                <p className="text-sm text-gray-600">Status: {order.status}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Criado em: {formatDate(order.createdAt)}</p>
                <p className="text-sm text-gray-600">Valor: R$ {order.amount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Renderiza os webhooks falhos
  const renderFailedWebhooks = () => {
    if (!data?.failedWebhooks?.length) {
      return <p className="text-gray-500">Nenhum webhook falho encontrado.</p>;
    }

    return (
      <div className="space-y-2">
        {data.failedWebhooks.map((webhook) => (
          <div key={webhook.id} className="p-3 bg-gray-50 rounded-md">
            <div className="flex justify-between">
              <div>
                <span className="font-medium">Evento: {webhook.event}</span>
                <p className="text-sm text-gray-600">Status: {webhook.statusCode || 'N/A'}</p>
                {webhook.errorMessage && (
                  <p className="text-sm text-red-500">Erro: {webhook.errorMessage}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Enviado em: {formatDate(webhook.sentAt)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Renderiza as anomalias detectadas
  const renderAnomalies = () => {
    if (!data?.anomalies?.length) {
      return <p className="text-gray-500">Nenhuma anomalia detectada.</p>;
    }

    return (
      <div className="space-y-2">
        {data.anomalies.map((anomaly, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-md">
            <div className="flex items-start gap-2">
              {renderSeverityIcon(anomaly.severity)}
              <div>
                <span className="font-medium">{anomaly.type === 'sales_drop' ? 'Queda nas Vendas' : 
                  anomaly.type === 'cancellation_spike' ? 'Aumento de Cancelamentos' : 
                  anomaly.type === 'conversion_drop' ? 'Queda na Conversão' : 
                  'Anomalia Detectada'}</span>
                <p className="text-sm text-gray-600">{anomaly.message}</p>
                <p className="text-sm text-gray-500">Detectado em: {formatDate(anomaly.detectedAt)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="p-4 text-center">Carregando alertas...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Erro ao carregar alertas: {error}</div>;
  }

  const hasAlerts = 
    (data?.stuckOrders && data.stuckOrders.length > 0) || 
    (data?.failedWebhooks && data.failedWebhooks.length > 0) || 
    (data?.anomalies && data.anomalies.length > 0);

  if (!hasAlerts) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Alertas</h2>
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum alerta ativo no momento.</p>
          <p className="text-sm">O sistema está monitorando pedidos travados, webhooks falhos e anomalias.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Alertas</h2>
      
      {/* Seção de Pedidos Travados */}
      {data?.stuckOrders && data.stuckOrders.length > 0 && (
        <div className="mb-6">
          <div 
            className="flex justify-between items-center cursor-pointer py-2 border-b"
            onClick={() => toggleSection('stuckOrders')}
          >
            <h3 className="text-lg font-medium flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              Pedidos Travados ({data.stuckOrders.length})
            </h3>
            <span>{expandedSection === 'stuckOrders' ? '▼' : '▶'}</span>
          </div>
          {expandedSection === 'stuckOrders' && (
            <div className="mt-3">
              {renderStuckOrders()}
            </div>
          )}
        </div>
      )}
      
      {/* Seção de Webhooks Falhos */}
      {data?.failedWebhooks && data.failedWebhooks.length > 0 && (
        <div className="mb-6">
          <div 
            className="flex justify-between items-center cursor-pointer py-2 border-b"
            onClick={() => toggleSection('failedWebhooks')}
          >
            <h3 className="text-lg font-medium flex items-center">
              <span className="text-yellow-500 mr-2">⚠</span>
              Webhooks Falhos ({data.failedWebhooks.length})
            </h3>
            <span>{expandedSection === 'failedWebhooks' ? '▼' : '▶'}</span>
          </div>
          {expandedSection === 'failedWebhooks' && (
            <div className="mt-3">
              {renderFailedWebhooks()}
            </div>
          )}
        </div>
      )}
      
      {/* Seção de Anomalias */}
      {data?.anomalies && data.anomalies.length > 0 && (
        <div className="mb-6">
          <div 
            className="flex justify-between items-center cursor-pointer py-2 border-b"
            onClick={() => toggleSection('anomalies')}
          >
            <h3 className="text-lg font-medium flex items-center">
              <span className="text-blue-500 mr-2">ℹ️</span>
              Anomalias Detectadas ({data.anomalies.length})
            </h3>
            <span>{expandedSection === 'anomalies' ? '▼' : '▶'}</span>
          </div>
          {expandedSection === 'anomalies' && (
            <div className="mt-3">
              {renderAnomalies()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;