import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

// Função para obter os dados do dashboard
export async function GET() {
  try {
    // 1. Resumo geral de vendas
    const [
      totalOrders, 
      totalPaidOrders, 
      totalRevenue, 
      ordersToday,
      paidOrdersToday,
      revenueToday
    ] = await Promise.all([
      // Total de pedidos
      prisma.order.count(),
      // Total de pedidos pagos
      prisma.order.count({
        where: { status: OrderStatus.PAID }
      }),
      // Receita total (apenas de pedidos pagos)
      prisma.order.aggregate({
        where: { status: OrderStatus.PAID },
        _sum: { paidAmount: true }
      }),
      // Pedidos de hoje
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      // Pedidos pagos de hoje
      prisma.order.count({
        where: {
          status: OrderStatus.PAID,
          paidAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      // Receita de hoje
      prisma.order.aggregate({
        where: {
          status: OrderStatus.PAID,
          paidAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        _sum: { paidAmount: true }
      })
    ]);

    // 2. Dados de vendas por hora (últimas 24 horas)
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const ordersByHour = await prisma.$queryRaw`
      SELECT 
        date_trunc('hour', "paidAt") as hour,
        COUNT(*) as count,
        SUM("paidAmount") as revenue
      FROM "Order"
      WHERE 
        "status" = 'PAID'::\"OrderStatus\" AND 
        "paidAt" >= ${yesterday} AND 
        "paidAt" <= ${now}
      GROUP BY date_trunc('hour', "paidAt")
      ORDER BY hour ASC
    `;

    // 3. Produtos mais vendidos
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5,
      where: {
        order: {
          status: OrderStatus.PAID
        }
      }
    });

    // Buscar detalhes dos produtos
    const productDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, price: true, imageUrl: true }
        });
        return {
          ...product,
          totalQuantity: item._sum.quantity,
          totalRevenue: (product?.price || 0) * (item._sum.quantity || 0)
        };
      })
    );

    // 4. Status de pedidos
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
      orderBy: {
        _count: {
          status: 'desc'
        }
      }
    });

    // 5. Últimos pedidos (10 mais recentes)
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true
          }
        },
        product: {
          select: {
            name: true
          }
        },
        payment: true
      }
    });

    // 6. Taxa de conversão
    const conversionRate = totalPaidOrders > 0 
      ? (totalPaidOrders / totalOrders * 100).toFixed(2)
      : 0;
    
    const todayConversionRate = ordersToday > 0 
      ? (paidOrdersToday / ordersToday * 100).toFixed(2)
      : 0;

    // Formatando resposta
    return NextResponse.json({
      summary: {
        totalOrders,
        totalPaidOrders,
        totalRevenue: totalRevenue._sum.paidAmount || 0,
        averageTicket: totalPaidOrders > 0 
          ? (totalRevenue._sum.paidAmount || 0) / totalPaidOrders 
          : 0,
        ordersToday,
        paidOrdersToday,
        revenueToday: revenueToday._sum.paidAmount || 0,
        conversionRate,
        todayConversionRate
      },
      ordersByHour,
      topProducts: productDetails,
      ordersByStatus,
      recentOrders
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados do dashboard' }, { status: 500 });
  }
}
