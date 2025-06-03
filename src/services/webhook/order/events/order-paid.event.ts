import { PrismaClient } from '@prisma/client';
import { OrderPaidResource } from '../types/order-resources';
import { OrderCreatedEvent } from './order-created.event';

import { normalizeOrderItem } from '../types/order-resources';

export class OrderPaidEvent {
  private createdEvent: OrderCreatedEvent;

  constructor(private prisma: PrismaClient) {
    this.createdEvent = new OrderCreatedEvent(prisma);
  }

  async execute(orderId: string): Promise<OrderPaidResource> {
    const order = await this.createdEvent['getOrderWithRelations'](orderId);
    if (!order) {
      throw new Error(`Pedido ${orderId} não encontrado`);
    }

    if (!order.payment) {
      throw new Error('Pedido não possui informações de pagamento');
    }

    const createdResource = this.createdEvent['mapToOrderCreatedResource'](order);
    
    return {
      ...createdResource,
      event: 'order.paid',
      paymentId: order.payment.id,
      paidAt: order.payment.paidAt?.toISOString() || new Date().toISOString(),
      paymentMethod: order.payment.method,
      items: order.orderItems.map(item => normalizeOrderItem({
        id: item.id,
        productId: item.productId,
        name: item.product?.name || 'Produto não encontrado',
        quantity: item.quantity,
        price: item.product?.price || 0,
        isOrderBump: typeof item.isOrderBump === 'boolean' ? item.isOrderBump : false,
        isUpsell: typeof item.isUpsell === 'boolean' ? item.isUpsell : false
      })),
    };
  }
}
