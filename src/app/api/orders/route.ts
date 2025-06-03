import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { getOrderWebhookOrchestrator } from '@/services/webhook/order';


// Schema para validação forte dos dados recebidos
const orderSchema = z.object({
  productId: z.string().uuid(),
  checkoutId: z.string().uuid(),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10),
  orderBumps: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().min(1),
      }),
    )
    .optional(),
  quantity: z.number().min(1).default(1),
});

// Schema para validação parcial (PATCH)
const patchOrderSchema = z.object({
  id: z.string().uuid(),
  customerName: z.string().min(2).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().min(10).optional(),
  status: z.nativeEnum(OrderStatus).optional(),
});

// GET /api/orders - Lista pedidos (com paginação e filtro opcional)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const email = searchParams.get('email') || undefined;

  const where = email
    ? {
        customer: {
          email: email,
        },
      }
    : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { orderItems: true, payment: true, customer: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, page, pageSize });
}

// DELETE /api/orders?id=xxx - Deleta pedido por ID (soft delete se possível)
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID do pedido não informado.' },
      { status: 400 },
    );
  }
  try {
    // Soft delete: atualizar um campo deletedAt (se existir)
    // Caso não exista, faz hard delete
    const deleted = await prisma.order.delete({ where: { id } });
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Erro inesperado.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = orderSchema.parse(body);

    // Primeiro verifica se existe cliente com o mesmo telefone (prioridade) ou email
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [{ phone: data.customerPhone }, { email: data.customerEmail }],
      },
    });

    // Se existir, atualiza os dados
    if (customer) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone,
        },
      });
    } else {
      // Se não existir, cria um novo
      customer = await prisma.customer.create({
        data: {
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone,
        },
      });
    }

    // Criação do pedido principal
    const order = await prisma.order.create({
      data: {
        productId: data.productId,
        checkoutId: data.checkoutId,
        customerId: customer.id,
        paidAmount: 0, // Inicialmente 0, só será preenchido após pagamento
        orderItems: {
          create: [
            {
              productId: data.productId,
              quantity: data.quantity,
              priceAtTime: 0, // Preencher depois conforme regra de preço
              isOrderBump: false,
            },
            ...(data.orderBumps?.map((bump) => ({
              productId: bump.productId,
              quantity: bump.quantity,
              priceAtTime: 0, // Preencher depois conforme regra de preço
              isOrderBump: true,
            })) || []),
          ],
        },
        statusHistory: {
          create: {
            previousStatus: null,
            newStatus: OrderStatus.DRAFT,
            notes: 'Pedido criado',
          },
        },
      },
      include: {
        orderItems: true,
        statusHistory: true,
        customer: true,
      },
    });
    // Agendar job de cart reminder (Bull)
    const { getBullQueueService } = await import('@/services/webhook/queue/services/bull-queue.service');
    const bullQueue = getBullQueueService(prisma);
    
    // Buscar webhook ativo para cart reminder
    const webhook = await prisma.webhook.findFirst({
      where: {
        events: { has: 'cart.reminder' },
        active: true
      }
    });

    if (webhook) {
      // Criar objeto com os headers necessários
      const webhookWithHeaders = {
        ...webhook,
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': 'cart.reminder',
          'X-Webhook-Signature': `wh_${webhook.id}`
        }
      };
      
      await bullQueue.addToQueue(webhookWithHeaders, { 
        event: 'cart.reminder',
        data: { id: order.id },
        timestamp: new Date().toISOString()
      });
    }

    const orderOrchestrator = getOrderWebhookOrchestrator(prisma);
    await orderOrchestrator.dispatchOrderCreated(order.id);

    return NextResponse.json({ success: true, orderId: order.id, order });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 422 });
    }
    if (error instanceof Error) {
      console.error(error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('Erro desconhecido:', error);
    return NextResponse.json({ success: false, error: 'Erro inesperado.' }, { status: 500 });
  }
}

/**
 * PATCH /api/orders?id=xxx - Atualiza dados do pedido e registra histórico
 */
export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID do pedido não informado.' },
      { status: 400 },
    );
  }
  try {
    const body = await request.json();
    const data = patchOrderSchema.parse({ id, ...body });
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado.' },
        { status: 404 },
      );
    }
    const updateData: Prisma.OrderUpdateInput = {};
    if (data.status) {
      updateData.status = data.status;
      updateData.statusUpdatedAt = new Date();
    }
    const updatedOrder = await prisma.order.update({ where: { id }, data: updateData });

    // Atualiza os dados do cliente se necessário
    if (data.customerName || data.customerEmail || data.customerPhone) {
      await prisma.customer.update({
        where: { id: existing.customerId },
        data: {
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone,
        },
      });
    }
    if (data.status && existing.status !== data.status) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          previousStatus: existing.status,
          newStatus: data.status,
          notes: `Status alterado para ${data.status}`,
        },
      });
    }
    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 422 });
    }
    console.error(error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro inesperado' },
      { status: 400 },
    );
  }
}
