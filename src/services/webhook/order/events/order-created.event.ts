import { PrismaClient } from '@prisma/client';
import { OrderWithRelations } from '../types/order.types';
import { OrderCreatedResource } from '../types/order-resources';

import { normalizeOrderItem } from '../types/order-resources';

export class OrderCreatedEvent {
  constructor(private prisma: PrismaClient) {}

  async execute(orderId: string): Promise<OrderCreatedResource> {
    const order = await this.getOrderWithRelations(orderId);
    if (!order) {
      throw new Error(`Pedido ${orderId} não encontrado`);
    }

    return this.mapToOrderCreatedResource(order);
  }

  private async getOrderWithRelations(orderId: string): Promise<OrderWithRelations | null> {
    try {
      return await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          customer: true,
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
          payment: true,
        },
      });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  private mapToOrderCreatedResource(order: OrderWithRelations): OrderCreatedResource {
    return {
      id: order.id,
      event: 'order.created',
      checkoutId: order.checkoutId,
      customer: {
        id: order.customer.id,
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone || '',
      },
      resource: {
        totalItems: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
        value_total: order.orderItems.reduce(
          (sum, item) => sum + (item.product?.price || 0) * item.quantity,
          0
        ),
      },
      items: order.orderItems.map(item => normalizeOrderItem({
        id: item.id,
        productId: item.productId,
        name: item.product?.name || 'Produto não encontrado',
        quantity: item.quantity,
        price: item.product?.price || 0,
        isOrderBump: typeof item.isOrderBump === 'boolean' ? item.isOrderBump : false,
        isUpsell: typeof item.isUpsell === 'boolean' ? item.isUpsell : false
      })),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}
