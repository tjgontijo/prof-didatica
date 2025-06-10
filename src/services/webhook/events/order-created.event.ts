// src/services/webhook/events/order-created.event.ts
import { PrismaClient } from '@prisma/client';
import { 
  OrderCreatedEvent, 
  OrderEventData, 
  CustomerData, 
  OrderItemData,
  validateWebhookPayload,
  OrderEventDataSchema,
  OrderWithRelationsForEvent,
  PaymentRawData
} from '@/services/webhook/core/types';
import { getWebhookConfig } from '@/services/webhook/config/webhook.config';

export class OrderCreatedEventHandler {
  private config = getWebhookConfig();

  constructor(private prisma: PrismaClient) {}

  async createEvent(orderId: string): Promise<OrderCreatedEvent> {
    const order = await this.getOrderWithRelations(orderId);
    if (!order) {
      throw new Error(`Pedido ${orderId} não encontrado`);
    }

    const eventData = this.mapToOrderEventData(order);
    
    // Valida os dados antes de criar o evento
    const validatedData = validateWebhookPayload(eventData, OrderEventDataSchema);

    return {
      event: this.config.events.ORDER_CREATED as 'order.created',
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
            status: true,
            amount: true,
            rawData: true,
            paidAt: true,
          },
        },
      },
    }) as Promise<OrderWithRelationsForEvent | null>;
  }

  private mapToOrderEventData(order: OrderWithRelationsForEvent): OrderEventData {
    const customer: CustomerData = {
      id: order.customer.id,
      name: order.customer.name,
      email: order.customer.email,
      phone: order.customer.phone || '',
    };

    const items: OrderItemData[] = order.orderItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product?.name || 'Produto não encontrado',
      quantity: item.quantity,
      price: item.product?.price || 0,
      isOrderBump: !!item.isOrderBump,
      isUpsell: !!item.isUpsell,
      googleDriveUrl: item.product?.googleDriveUrl || '',
    }));

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Mapear dados do pagamento se existir
    const payment = order.payment ? {
      id: order.payment.id,
      method: order.payment.method,
      status: order.payment.status,
      amount: order.payment.amount,
      pix: order.payment.method === 'pix' && order.payment.rawData ? {
        qrCode: (order.payment.rawData as PaymentRawData).qrCode,
        qrCodeBase64: (order.payment.rawData as PaymentRawData).qrCodeBase64,
        pixCopyPaste: (order.payment.rawData as PaymentRawData).pixCopyPaste,
        expiresAt: (order.payment.rawData as PaymentRawData).expiresAt,
      } : undefined
    } : undefined;

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
      payment,
    };
  }
}
