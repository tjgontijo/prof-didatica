// src/services/webhook/order/events.service.ts
import { PrismaClient } from '@prisma/client';
import { getWebhookService } from '..';
import { 
  OrderCreatedResource, 
  OrderPaidResource, 
  OrderWithRelations 
} from './types';

export class OrderEventsService {
  private webhookService = getWebhookService(new PrismaClient());

  async orderCreated(orderId: string): Promise<void> {
    try {
      const order = await this.getOrderWithRelations(orderId);
      if (!order) return;

      const eventData: OrderCreatedResource = this.mapToOrderCreatedResource(order);
      await this.webhookService.dispatchEvent(eventData);
    } catch (error) {
      console.error('Erro ao processar evento order.created:', error);
      throw error;
    }
  }

  async orderPaid(orderId: string): Promise<void> {
    try {
      const order = await this.getOrderWithRelations(orderId);
      if (!order) return;

      const eventData: OrderPaidResource = this.mapToOrderPaidResource(order);
      await this.webhookService.dispatchEvent(eventData);
    } catch (error) {
      console.error('Erro ao processar evento order.paid:', error);
      throw error;
    }
  }

  private async getOrderWithRelations(orderId: string): Promise<OrderWithRelations | null> {
    const prisma = new PrismaClient();
    try {
      return await prisma.order.findUnique({
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
      await prisma.$disconnect();
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
      items: order.orderItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.product?.name || 'Produto não encontrado',
        quantity: item.quantity,
        price: item.product?.price || 0,
        isOrderBump: item.isOrderBump,
        isUpsell: item.isUpsell,
      })),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  private mapToOrderPaidResource(order: OrderWithRelations): OrderPaidResource {
    if (!order.payment) {
      throw new Error('Pedido não possui informações de pagamento');
    }

    return {
      ...this.mapToOrderCreatedResource(order),
      event: 'order.paid',
      paymentId: order.payment.id,
      paidAt: order.payment.paidAt?.toISOString() || new Date().toISOString(),
      paymentMethod: order.payment.method,
    };
  }
}

// Exportar uma instância singleton
let orderEventsService: OrderEventsService | null = null;

export function getOrderEventsService(): OrderEventsService {
  if (!orderEventsService) {
    orderEventsService = new OrderEventsService();
  }
  return orderEventsService;
}