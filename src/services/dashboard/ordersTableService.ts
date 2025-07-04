import { prisma } from '@/lib/prisma';
import { OrderData, OrderFilters, OrdersTableData, StuckOrder } from '@/types/dashboard';
import dashboardCache from '@/lib/dashboardCache';

export class OrdersTableService {
  /**
   * Obtém dados para a tabela de pedidos com paginação e filtros
   */
  async getOrdersTable(
    page: number = 1,
    pageSize: number = 10,
    filters?: OrderFilters
  ): Promise<OrdersTableData> {
    // Verifica se há dados em cache
    const cacheKey = `${page}-${pageSize}`;
    const cachedData = dashboardCache.getCachedOrdersTable(cacheKey, filters);
    if (cachedData) {
      return cachedData;
    }

    // Define o período de análise
    const startDate = filters?.startDate ? new Date(filters.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = filters?.endDate ? new Date(filters.endDate) : new Date();

    // Calcula o offset para paginação
    const skip = (page - 1) * pageSize;

    // Construção das condições de filtro
    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      deletedAt: null
    };

    // Adiciona filtros opcionais
    if (filters?.status) {
      whereClause.status = filters.status;
    }

    if (filters?.customerId) {
      whereClause.customerId = filters.customerId;
    }

    if (filters?.productId) {
      whereClause.productId = filters.productId;
    }

    if (filters?.minAmount) {
      whereClause.paidAmount = { ...whereClause.paidAmount, gte: filters.minAmount };
    }

    if (filters?.maxAmount) {
      whereClause.paidAmount = { ...whereClause.paidAmount, lte: filters.maxAmount };
    }

    // Busca os pedidos com paginação
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              price: true
            }
          },
          trackingSession: {
            select: {
              id: true,
              utmSource: true,
              utmMedium: true,
              utmCampaign: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.order.count({ where: whereClause })
    ]);

    // Processa os resultados
    const processedOrders: OrderData[] = orders.map((order: any) => {
      const utmData = order.trackingSession ? {
        utmSource: order.trackingSession.utmSource || undefined,
        utmMedium: order.trackingSession.utmMedium || undefined,
        utmCampaign: order.trackingSession.utmCampaign || undefined
      } : {};

      return {
        id: order.id,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        status: order.status,
        paidAmount: Number(order.paidAmount) || 0,
        customer: {
          id: order.customer.id,
          name: order.customer.name,
          email: order.customer.email,
          phone: order.customer.phone || undefined
        },
        product: {
          id: order.product.id,
          name: order.product.name,
          price: Number(order.product.price) || 0
        },
        paymentMethod: order.paymentMethod || undefined,
        installments: order.installments || undefined,
        ...utmData
      };
    });

    // Monta o objeto de resposta
    const ordersTableData: OrdersTableData = {
      orders: processedOrders,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    };

    // Armazena em cache
    dashboardCache.cacheOrdersTable(ordersTableData, cacheKey, filters);

    return ordersTableData;
  }

  /**
   * Obtém pedidos com problemas ou travados no processo
   */
  async getStuckOrders(filters?: OrderFilters): Promise<StuckOrder[]> {
    // Verifica se há dados em cache
    const cachedData = dashboardCache.getCachedStuckOrders(filters);
    if (cachedData) {
      return cachedData;
    }

    // Define o período de análise
    const startDate = filters?.startDate ? new Date(filters.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = filters?.endDate ? new Date(filters.endDate) : new Date();

    // Busca pedidos pendentes há mais de 24 horas
    const oneDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

    // Busca pedidos com problemas
    const stuckOrdersData = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'PENDING',
        updatedAt: {
          lt: oneDayAgo
        },
        deletedAt: null
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Processa os resultados
    const stuckOrders: StuckOrder[] = stuckOrdersData.map((order: any) => {
      const hoursStuck = Math.round(
        (new Date().getTime() - new Date(order.updatedAt).getTime()) / (1000 * 60 * 60)
      );

      return {
        id: order.id,
        createdAt: order.createdAt,
        lastUpdated: order.updatedAt,
        hoursStuck,
        customer: {
          id: order.customer.id,
          name: order.customer.name,
          email: order.customer.email,
          phone: order.customer.phone || undefined
        },
        product: {
          id: order.product.id,
          name: order.product.name
        },
        paidAmount: Number(order.paidAmount) || 0,
        paymentMethod: order.paymentMethod || undefined
      };
    });

    // Armazena em cache
    dashboardCache.cacheStuckOrders(stuckOrders, filters);

    return stuckOrders;
  }

  /**
   * Obtém os pedidos recentes
   */
  async getRecentOrders(limit: number = 5, filters?: OrderFilters): Promise<OrderData[]> {
    // Verifica se há dados em cache
    const cacheKey = `recent-${limit}`;
    const cachedData = dashboardCache.getCachedOrdersTable(cacheKey, filters);
    if (cachedData && cachedData.orders) {
      return cachedData.orders;
    }

    // Define o período de análise
    const startDate = filters?.startDate ? new Date(filters.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = filters?.endDate ? new Date(filters.endDate) : new Date();

    // Construção das condições de filtro
    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      status: 'PAID',
      deletedAt: null
    };

    // Adiciona filtros opcionais
    if (filters?.customerId) {
      whereClause.customerId = filters.customerId;
    }

    if (filters?.productId) {
      whereClause.productId = filters.productId;
    }

    // Busca os pedidos recentes
    const recentOrders = await prisma.order.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true
          }
        },
        trackingSession: {
          select: {
            id: true,
            utmSource: true,
            utmMedium: true,
            utmCampaign: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Processa os resultados
    const processedOrders: OrderData[] = recentOrders.map((order: any) => {
      const utmData = order.trackingSession ? {
        utmSource: order.trackingSession.utmSource || undefined,
        utmMedium: order.trackingSession.utmMedium || undefined,
        utmCampaign: order.trackingSession.utmCampaign || undefined
      } : {};

      return {
        id: order.id,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        status: order.status,
        paidAmount: Number(order.paidAmount) || 0,
        customer: {
          id: order.customer.id,
          name: order.customer.name,
          email: order.customer.email,
          phone: order.customer.phone || undefined
        },
        product: {
          id: order.product.id,
          name: order.product.name,
          price: Number(order.product.price) || 0
        },
        paymentMethod: order.paymentMethod || undefined,
        installments: order.installments || undefined,
        ...utmData
      };
    });

    // Armazena em cache com um objeto que simula a estrutura de OrdersTableData
    const ordersTableData: OrdersTableData = {
      orders: processedOrders,
      pagination: {
        page: 1,
        pageSize: limit,
        totalCount: processedOrders.length,
        totalPages: 1
      }
    };

    dashboardCache.cacheOrdersTable(ordersTableData, cacheKey, filters);

    return processedOrders;
  }

  /**
   * Obtém os dados de pedidos por status
   */
  async getOrdersByStatus(filters?: OrderFilters): Promise<Record<string, number>> {
    // Verifica se há dados em cache
    const cachedData = dashboardCache.getCachedOrdersByStatus(filters);
    if (cachedData) {
      return cachedData;
    }

    // Define o período de análise
    const startDate = filters?.startDate ? new Date(filters.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = filters?.endDate ? new Date(filters.endDate) : new Date();

    // Construção das condições de filtro
    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      deletedAt: null
    };

    // Adiciona filtros opcionais
    if (filters?.customerId) {
      whereClause.customerId = filters.customerId;
    }

    if (filters?.productId) {
      whereClause.productId = filters.productId;
    }

    // Busca a contagem de pedidos por status
    const orderStatusCounts = await prisma.order.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        id: true
      }
    });

    // Processa os resultados
    const ordersByStatus: Record<string, number> = {};
    orderStatusCounts.forEach((statusCount: any) => {
      ordersByStatus[statusCount.status] = statusCount._count.id;
    });

    // Garante que todos os status possíveis estejam presentes
    const allStatuses = ['PENDING', 'PAID', 'CANCELED', 'REFUNDED'];
    allStatuses.forEach(status => {
      if (!ordersByStatus[status]) {
        ordersByStatus[status] = 0;
      }
    });

    // Armazena em cache
    dashboardCache.cacheOrdersByStatus(ordersByStatus, filters);

    return ordersByStatus;
  }
}

// Exporta uma instância única do serviço
const ordersTableService = new OrdersTableService();
export default ordersTableService;