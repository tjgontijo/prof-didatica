// src/services/webhook/events/order-paid.event.ts
import { PrismaClient } from '@prisma/client';
import { 
  OrderPaidEvent, 
  CustomerData, 
  OrderItemData,
  validateWebhookPayload,
  OrderEventDataSchema,
  OrderWithRelationsForEvent
} from '../core/types';
import { getWebhookConfig } from '../config/webhook.config';
import { z } from 'zod';

const OrderPaidEventDataSchema = OrderEventDataSchema.extend({
  paymentId: z.string().uuid(),
  paidAt: z.string().datetime(),
  paymentMethod: z.string().min(1),
});

export class OrderPaidEventHandler {
  private config = getWebhookConfig();

  constructor(private prisma: PrismaClient) {}

  async createEvent(orderId: string): Promise<OrderPaidEvent> {
    const order = await this.getOrderWithRelations(orderId);
    if (!order) {
      throw new Error(`Pedido ${orderId} não encontrado`);
    }

    if (!order.payment) {
      throw new Error(`Pagamento não encontrado para o pedido ${orderId}`);
    }

    const eventData = this.mapToOrderPaidEventData(order);
    
    // Valida os dados antes de criar o evento
    const validatedData = validateWebhookPayload(eventData, OrderPaidEventDataSchema);

    return {
      event: this.config.events.ORDER_PAID as 'order.paid',
      data: validatedData,
    };
  }

  private async getOrderWithRelations(orderId: string): Promise<OrderWithRelationsForEvent | null> {
    return this.prisma.order.findUnique({
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
                googleDriveUrl: true,
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            method: true,
            paidAt: true,
          },
        },
      },
    }) as Promise<OrderWithRelationsForEvent | null>;
  }

  private mapToOrderPaidEventData(order: OrderWithRelationsForEvent): OrderPaidEvent['data'] {
    const customer: CustomerData = {
      id: order.customer.id,
      name: order.customer.name,
      email: order.customer.email,
      phone: order.customer.phone || '',
    };

    const items = order.orderItems.map((item) => {
      const orderItem = {
        id: item.id,
        productId: item.productId,
        name: item.product?.name ?? 'Produto não encontrado',
        quantity: item.quantity,
        price: item.product?.price ?? 0,
        isOrderBump: Boolean(item.isOrderBump),
        isUpsell: Boolean(item.isUpsell),
        googleDriveUrl: item.product?.googleDriveUrl ?? null,
      } satisfies OrderItemData;
      return orderItem;
    });

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
      id: order.id,
      checkoutId: order.checkoutId,
      customer,
      items,
      status: order.status,
      totalItems,
      totalValue,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      paymentId: order.payment!.id,
      paidAt: order.payment!.paidAt?.toISOString() || new Date().toISOString(),
      paymentMethod: order.payment!.method,
    };
  }
}
