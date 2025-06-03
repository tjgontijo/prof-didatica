import { PrismaClient } from '@prisma/client';
import { OrderWithRelations } from '../types/order.types';
import { CartReminderResource, validateCartReminder } from '../types/order-resources';

import { normalizeOrderItem } from '../types/order-resources';

export class CartReminderEvent {
  constructor(private prisma: PrismaClient) {}

  async execute(orderId: string): Promise<CartReminderResource> {
    const order = await this.getOrderWithRelations(orderId);
    if (!order) {
      throw new Error(`Pedido ${orderId} não encontrado`);
    }
    const resource = this.mapToCartReminderResource(order);
    return validateCartReminder(resource);
  }

  private async getOrderWithRelations(orderId: string): Promise<OrderWithRelations | null> {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        orderItems: {
          include: { product: true }
        }
      }
    });
  }

  private mapToCartReminderResource(order: OrderWithRelations): CartReminderResource {
    return {
      event: 'cart.reminder',
      orderId: order.id,
      customer: {
        id: order.customer.id,
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone || ''
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
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    };
  }
}
