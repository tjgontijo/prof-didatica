// src/services/webhook/events/order-paid.event.ts
import { PrismaClient } from '@prisma/client';
import {
  OrderPaidEvent,
  CustomerData,
  OrderItemData,
  PaymentData,
  PaymentRawData,
  validateWebhookPayload,
  OrderEventDataSchema,
  OrderWithRelationsForEvent,
} from '../core/types';
import { getWebhookConfig } from '../config/webhook.config';
import { z } from 'zod';

const OrderPaidEventDataSchema = OrderEventDataSchema.extend({
  paymentId: z.string().cuid(),
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
    
    // Adicionar dados de rastreamento do banco de dados, se existirem
    if (order.trackingData) {
      eventData.tracking = order.trackingData;
    }

    // Valida os dados antes de criar o evento
    const validatedData = validateWebhookPayload(eventData, OrderPaidEventDataSchema);

    return {
      event: this.config.events.ORDER_PAID as 'order.paid',
      data: validatedData,
    };
  }

  private async getOrderWithRelations(orderId: string): Promise<OrderWithRelationsForEvent | null> {
    try {
      // Buscar todos os itens do pedido diretamente, incluindo order bumps
      const allItems = await this.prisma.orderItem.findMany({
        where: { orderId, deletedAt: null },
        include: { product: true },
      });
      
      console.log(`[OrderPaidEvent] Encontrados ${allItems.length} itens para o pedido ${orderId}`);
      
      // Buscar o pedido com suas relações
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          customer: true,
          payment: {
            select: {
              id: true,
              method: true,
              status: true,
              amount: true,
              paidAt: true,
              rawData: true
            },
          },
          // Não incluímos orderItems aqui pois já buscamos separadamente
        },
      });
      
      if (!order) {
        console.log(`[OrderPaidEvent] Pedido ${orderId} não encontrado`);
        return null;
      }
      
      // Adicionar os itens ao pedido para corresponder à interface esperada
      const completeOrder: OrderWithRelationsForEvent = {
        id: order.id,
        checkoutId: order.checkoutId,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        customer: {
          id: order.customer.id,
          name: order.customer.name,
          email: order.customer.email,
          phone: order.customer.phone,
        },
        orderItems: allItems.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          isOrderBump: item.isOrderBump,
          isUpsell: item.isUpsell,
          product: item.product
        })),
        // Converter o objeto payment para garantir compatibilidade de tipos
        payment: order.payment ? {
          id: order.payment.id,
          method: order.payment.method,
          status: order.payment.status,
          amount: order.payment.amount,
          paidAt: order.payment.paidAt,
          rawData: order.payment.rawData as PaymentRawData | null
        } : null
      };
      
      return completeOrder;
      
    } catch (error) {
      console.error(`[OrderPaidEvent] Erro ao buscar pedido ${orderId}:`, error);
      return null;
    }
  }

  private mapToOrderPaidEventData(order: OrderWithRelationsForEvent): OrderPaidEvent['data'] {
    console.log(`[OrderPaidEvent] Mapeando ${order.orderItems.length} itens para o pedido ${order.id}`);
    
    // Mapear os dados do cliente (igual ao order.created)
    const customer: CustomerData = {
      id: order.customer.id,
      name: order.customer.name,
      email: order.customer.email,
      phone: order.customer.phone || '',
    };

    // Mapear os itens do pedido (igual ao order.created)
    const items = order.orderItems.map((item) => {
      // Converter o preço de centavos para reais se necessário
      const price = item.product?.price ? item.product.price / 100 : 0;
      
      const orderItem: OrderItemData = {
        id: item.id,
        productId: item.productId,
        name: item.product?.name ?? 'Produto não encontrado',
        quantity: item.quantity,
        price: price,  // Price em formato decimal
        isOrderBump: Boolean(item.isOrderBump),
        isUpsell: Boolean(item.isUpsell),
        // Crucial enviar o googleDriveUrl para o cliente acessar os materiais
        googleDriveUrl: item.product?.googleDriveUrl ?? null,
      };
      return orderItem;
    });

    // Calcular totais
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Verificar se todos os itens foram incluídos no payload
    console.log(`[OrderPaidEvent] Total de ${totalItems} itens mapeados com valor total ${totalValue}`);

    // Preparar as informações de pagamento para o formato esperado
    const payment: PaymentData | undefined = order.payment ? {
      id: order.payment.id,
      method: order.payment.method,
      status: order.payment.status,
      amount: order.payment.amount / 100, // Converter de centavos para reais
    } : undefined;

    // Estrutura padronizada que segue o mesmo formato do order.created
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
      // Dados específicos do evento order.paid
      paymentId: order.payment?.id || '',
      paidAt: order.payment?.paidAt?.toISOString() || new Date().toISOString(),
      paymentMethod: order.payment?.method || '',
      payment, // Inclusão do objeto payment no formato da interface PaymentData
    };
  }
}
