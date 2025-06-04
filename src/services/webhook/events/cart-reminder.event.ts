// src/services/webhook/events/cart-reminder.event.ts
import { PrismaClient, OrderStatus } from '@prisma/client';
import { 
  CartReminderEvent, 
  CustomerData, 
  OrderItemData,
  validateWebhookPayload,
  OrderWithRelationsForEvent
} from '../core/types';
import { getWebhookConfig } from '../config/webhook.config';
import { z } from 'zod';

const CartReminderEventDataSchema = z.object({
  orderId: z.string().uuid(),
  customer: z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string(),
  }),
  items: z.array(z.object({
    id: z.string().uuid(),
    productId: z.string().uuid(),
    name: z.string().min(1),
    quantity: z.number().min(1),
    price: z.number().min(0),
    isOrderBump: z.boolean(),
    isUpsell: z.boolean(),
  })),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export class CartReminderEventHandler {
  private config = getWebhookConfig();

  constructor(private prisma: PrismaClient) {}

  async createEvent(orderId: string): Promise<CartReminderEvent> {
    const order = await this.getOrderWithRelations(orderId);
    if (!order) {
      throw new Error(`Pedido ${orderId} não encontrado`);
    }

    // Verifica se o pedido ainda está em DRAFT
    if (order.status !== OrderStatus.DRAFT) {
      throw new Error(`Pedido ${orderId} não está mais em DRAFT (status atual: ${order.status})`);
    }

    const eventData = this.mapToCartReminderEventData(order);
    
    // Valida os dados antes de criar o evento
    const validatedData = validateWebhookPayload(eventData, CartReminderEventDataSchema);

    return {
      event: this.config.events.CART_REMINDER as 'cart.reminder',
      data: validatedData,
    };
  }

  /**
   * Processa o cart reminder e atualiza o status do pedido
   */
  async processCartReminder(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true },
    });

    if (!order) {
      console.warn(`Pedido ${orderId} não encontrado para cart reminder`);
      return;
    }

    // Só processa se ainda estiver em DRAFT
    if (order.status === OrderStatus.DRAFT) {
      // Atualiza o status para ABANDONED_CART usando executeRaw para garantir que funcione
      await this.prisma.$executeRaw`
        UPDATE "Order" 
        SET status = ${'ABANDONED_CART'}::"OrderStatus", 
            "statusUpdatedAt" = NOW(),
            "updatedAt" = NOW()
        WHERE id = ${orderId}
      `;

      console.log(`Pedido ${orderId} marcado como ABANDONED_CART`);
    } else {
      console.log(`Pedido ${orderId} não processado - status atual: ${order.status}`);
    }
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
              },
            },
          },
        },
      },
    }) as Promise<OrderWithRelationsForEvent | null>;
  }

  private mapToCartReminderEventData(order: OrderWithRelationsForEvent): CartReminderEvent['data'] {
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
    }));

    return {
      orderId: order.id,
      customer,
      items,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}
