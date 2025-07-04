<<<<<<< Updated upstream
=======
'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FunnelChart, { FunnelData } from '@/components/FunnelChart';

// Tipos para os dados
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Payment {
  id: string;
  status: string;
  method: string;
  amount: number;
  paidAt: string | null;
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  priceAtTime: number;
  isOrderBump: boolean;
}

interface Order {
  id: string;
  status: string;
  paidAmount: number;
  createdAt: string;
  paidAt: string | null;
  customer: Customer;
  payment: Payment | null;
  orderItems: OrderItem[];
}

interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
}

// Tipos de status disponíveis
type StatusFilter = 'ALL' | 'DRAFT' | 'PENDING' | 'PAID';

export default function OrdersPage() {
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [funnelLoading, setFunnelLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [funnelError, setFunnelError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Buscar todos os pedidos sem paginação (pageSize=1000)
        const response = await fetch('/api/orders?pageSize=1000');
        if (!response.ok) {
          throw new Error('Erro ao buscar pedidos');
        }
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError('Erro ao carregar os pedidos. Tente novamente mais tarde.');
        console.error('Erro ao buscar pedidos:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchFunnelData = async () => {
      try {
        setFunnelLoading(true);
        const response = await fetch('/api/analytics/funnel');
        if (!response.ok) {
          throw new Error('Erro ao buscar dados do funil');
        }
        const data = await response.json();
        setFunnelData(data);
      } catch (err) {
        setFunnelError('Erro ao carregar dados do funil. Tente novamente mais tarde.');
        console.error('Erro ao buscar dados do funil:', err);
      } finally {
        setFunnelLoading(false);
      }
    };

    fetchOrders();
    fetchFunnelData();
  }, []);

  // Filtrar pedidos por status
  const filteredOrders = data?.orders.filter(order => 
    statusFilter === 'ALL' ? true : order.status === statusFilter
  ) || [];

  // Calcular o valor total de vendas filtradas
  const pedidosPagos = filteredOrders.filter(order => order.status === 'PAID');
  const totalVendas = pedidosPagos.reduce((acc, order) => acc + order.paidAmount, 0) || 0;

  // Calcular ticket médio por cliente
  const clientesUnicos = Array.from(new Set(pedidosPagos.map(order => order.customer.id)));
  const ticketMedioPorCliente = clientesUnicos.length > 0 ? totalVendas / clientesUnicos.length : 0;

  // Formatar valor para moeda brasileira
  const formatarMoeda = (valor: number) => {
    // Valores já estão em reais
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Formatar data para formato brasileiro
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return format(data, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  // Mapear status para texto em português
  const traduzirStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'DRAFT': 'Rascunho',
      'PENDING': 'Pendente',
      'PAID': 'Pago',
      'COMPLETED': 'Concluído',
      'CANCELLED': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <p className="text-lg">Carregando pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Vendas</h1>
      
      {/* Resumo de vendas */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Resumo</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500">Total de Pedidos</p>
            <p className="text-2xl font-bold text-gray-800">{data?.total || 0}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500">Pedidos Pagos</p>
            <p className="text-2xl font-bold text-gray-800">
              {data?.orders.filter(order => order.status === 'PAID').length || 0}
            </p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500">Valor Total de Vendas</p>
            <p className="text-2xl font-bold text-green-600">{formatarMoeda(totalVendas)}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500">Ticket Médio por Cliente</p>
            <p className="text-2xl font-bold text-blue-600">{formatarMoeda(ticketMedioPorCliente)}</p>
          </div>
        </div>
      </div>

      {/* Funil de Conversão */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Funil de Conversão</h2>
        <div className="bg-white p-4 rounded shadow">
          {funnelLoading ? (
            <div className="flex justify-center items-center h-[300px]">
              <p className="text-lg">Carregando dados do funil...</p>
            </div>
          ) : funnelError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{funnelError}</p>
            </div>
          ) : (
            <FunnelChart 
              data={funnelData}
              height={300}
            />
          )}
        </div>
      </div>

      {/* Filtro de status */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded-md ${
              statusFilter === 'ALL' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Todos
          </button>
          <button 
            onClick={() => setStatusFilter('DRAFT')}
            className={`px-4 py-2 rounded-md ${
              statusFilter === 'DRAFT' 
                ? 'bg-gray-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Rascunho
          </button>
          <button 
            onClick={() => setStatusFilter('PENDING')}
            className={`px-4 py-2 rounded-md ${
              statusFilter === 'PENDING' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Pendente
          </button>
          <button 
            onClick={() => setStatusFilter('PAID')}
            className={`px-4 py-2 rounded-md ${
              statusFilter === 'PAID' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Pago
          </button>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">ID</th>
              <th className="py-2 px-4 border-b text-left">Cliente</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
              <th className="py-2 px-4 border-b text-left">Valor</th>
              <th className="py-2 px-4 border-b text-left">Data</th>
              <th className="py-2 px-4 border-b text-left">Método</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 text-gray-800">
                <td className="py-2 px-4 border-b">{order.id.substring(0, 8)}...</td>
                <td className="py-2 px-4 border-b">{order.customer.name}</td>
                <td className="py-2 px-4 border-b">{order.customer.email}</td>
                <td className="py-2 px-4 border-b">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    order.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {traduzirStatus(order.status)}
                  </span>
                </td>
                <td className="py-2 px-4 border-b">
                  {formatarMoeda(order.paidAmount)}
                </td>
                <td className="py-2 px-4 border-b">
                  {formatarData(order.createdAt)}
                </td>
                <td className="py-2 px-4 border-b">
                  {order.payment?.method || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Informação sobre resultados filtrados */}
      <div className="mt-4 flex justify-between items-center">
        <p className="text-sm text-gray-500">
          {statusFilter !== 'ALL' 
            ? `Mostrando ${filteredOrders.length} pedidos com status ${traduzirStatus(statusFilter)} de ${data?.total || 0} no total` 
            : `Mostrando todos os ${data?.total || 0} pedidos`}
        </p>
      </div>
    </div>
  );
}
>>>>>>> Stashed changes
