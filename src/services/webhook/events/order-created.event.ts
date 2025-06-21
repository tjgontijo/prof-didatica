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
  PaymentRawData,
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
    // Buscar todos os itens do pedido diretamente, incluindo order bumps
    const allItems = await this.prisma.orderItem.findMany({
      where: { orderId, deletedAt: null },
      include: { product: true },
    });

    console.log(`[OrderCreatedEvent] Encontrados ${allItems.length} itens para o pedido ${orderId}`);
    
    // Verificar se há order bumps
    const mainItems = allItems.filter(item => !item.isOrderBump && !item.isUpsell);
    const orderBumps = allItems.filter(item => item.isOrderBump);
    const upsells = allItems.filter(item => item.isUpsell);
    
    console.log(`[OrderCreatedEvent] Detalhamento: ${mainItems.length} produtos principais, ${orderBumps.length} order bumps, ${upsells.length} upsells`);

    // Buscar o pedido com todas as relações
    const order = (await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        orderItems: {
          where: { deletedAt: null },
          include: {
            product: true,
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
    })) as OrderWithRelationsForEvent | null;

    if (order) {
      // Verificar se os itens do pedido estão completos
      if (order.orderItems.length !== allItems.length) {
        console.warn(
          `[OrderCreatedEvent] ALERTA: Discrepância no número de itens! Encontrados diretamente: ${allItems.length}, No pedido: ${order.orderItems.length}`,
        );

        // Se houver discrepância, substituir os itens do pedido pelos itens buscados separadamente
        if (allItems.length > order.orderItems.length) {
          console.log('[OrderCreatedEvent] Substituindo itens do pedido pelos encontrados diretamente');
          // Conversão de tipo para evitar erro de tipagem
          order.orderItems = allItems as unknown as typeof order.orderItems;
        }
      }
    }

    return order;
  }

  private mapToOrderEventData(order: OrderWithRelationsForEvent): OrderEventData {
    const customer: CustomerData = {
      id: order.customer.id,
      name: order.customer.name,
      email: order.customer.email,
      phone: order.customer.phone || '',
    };

    // Removido loop que não fazia nada

    // Garantir que todos os itens sejam mapeados corretamente, incluindo order bumps
    const items = order.orderItems.map((item) => {
      // Verificar se o item tem todas as propriedades necessárias
      if (!item.product) {
        console.warn(`[OrderCreatedEvent] Item ${item.id} não tem produto associado`);
      }

      console.log(`[OrderCreatedEvent] Mapeando item ${item.id} (${item.product?.name}), isOrderBump: ${item.isOrderBump}, isUpsell: ${item.isUpsell}`);

      const orderItem = {
        id: item.id,
        productId: item.productId,
        name: item.product?.name ?? 'Produto não encontrado',
        quantity: item.quantity || 1,
        price: item.product?.price ?? 0,
        isOrderBump: Boolean(item.isOrderBump),
        isUpsell: Boolean(item.isUpsell),
        googleDriveUrl: item.product?.googleDriveUrl ?? null,
      } satisfies OrderItemData;

      return orderItem;
    });

    // Verificar se há itens duplicados e removê-los
    const uniqueItems = items.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );

    if (uniqueItems.length !== items.length) {
      console.warn(
        `[OrderCreatedEvent] Removidos ${items.length - uniqueItems.length} itens duplicados`,
      );
    }

    // Usar os itens únicos para calcular os totais
    const totalItems = uniqueItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = uniqueItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Mapear dados do pagamento se existir
    const payment = order.payment
      ? {
          id: order.payment.id,
          method: order.payment.method,
          status: order.payment.status,
          amount: order.payment.amount,
          pix:
            order.payment.method === 'pix' && order.payment.rawData
              ? (() => {
                  const rawData = order.payment.rawData as PaymentRawData;
                  return {
                    mercadoPagoId: rawData?.mercadoPagoId || '',
                    pixCopyPaste: rawData?.pixCopyPaste || '',
                    qrCodeBase64: rawData?.qrCodeBase64 || '',
                    ticket_url: rawData?.ticket_url || '',
                    expiresAt: (() => {
                      // Garantir que a data esteja em formato ISO 8601 válido para o Zod
                      const rawExpiresAt = rawData?.expiresAt;
                      if (rawExpiresAt) {
                        try {
                          // Converter para objeto Date e depois para ISO String
                          return new Date(rawExpiresAt).toISOString();
                        } catch (error) {
                          console.error(
                            '[OrderCreatedEvent] Erro ao formatar data de expiração:',
                            error,
                          );
                          return new Date().toISOString();
                        }
                      }
                      return new Date().toISOString();
                    })(),
                  };
                })()
              : undefined,
        }
      : undefined;

    // Log detalhado do rawData para depuração
    if (order.payment?.rawData) {
    }

    // Log dos dados de pagamento PIX para depuração
    if (payment?.pix) {
    }

    // Log final do payload completo que será enviado

    return {
      id: order.id,
      checkoutId: order.checkoutId,
      customer,
      items: uniqueItems, // Usar os itens únicos no payload
      status: order.status,
      totalItems,
      totalValue,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      payment,
    };
  }
}
