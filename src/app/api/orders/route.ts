import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';

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

  const baseWhere: Prisma.OrderWhereInput = { deletedAt: null };
  const emailFilter = email ? { customer: { email: email } } : {};
  const where = { ...baseWhere, ...emailFilter };
  
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
    const order = await prisma.order.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ success: true, order });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // Record to update not found
        return NextResponse.json({ success: false, error: 'Pedido não encontrado.' }, { status: 404 });
      }
      // Handle other Prisma errors
      return NextResponse.json({ success: false, error: 'Erro de banco de dados ao deletar pedido.', details: error.message }, { status: 500 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Erro inesperado ao deletar pedido.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = orderSchema.parse(body);

    // Fetch the main product to get its current price
    const mainProduct = await prisma.product.findUnique({
      where: { id: data.productId, isActive: true, deletedAt: null }, // Assuming deletedAt for soft deletes
    });

    if (!mainProduct) {
      return NextResponse.json(
        { success: false, error: 'Main product not found, is inactive, or has been deleted.' },
        { status: 404 },
      );
    }
    const mainProductPriceAtTime = mainProduct.price; // This is in cents

    const orderResult = await prisma.$transaction(async (tx) => {
      // Primeiro verifica se existe cliente com o mesmo telefone (prioridade) ou email
      let customer = await tx.customer.findFirst({
        where: {
          OR: [{ phone: data.customerPhone }, { email: data.customerEmail }],
        },
      });

      // Se existir, atualiza os dados
      if (customer) {
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: {
            name: data.customerName,
            email: data.customerEmail,
            phone: data.customerPhone,
          },
        });
      } else {
        // Se não existir, cria um novo
        customer = await tx.customer.create({
          data: {
            name: data.customerName,
            email: data.customerEmail,
            phone: data.customerPhone,
          },
        });
      }

      // Criação do pedido principal
      const order = await tx.order.create({
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
                priceAtTime: mainProductPriceAtTime, // Use fetched price in cents
                isOrderBump: false,
              },
              // Order bumps are priced later in the /api/payment/pix route as per current flow
              ...(data.orderBumps?.map((bump) => ({
                productId: bump.productId,
                quantity: bump.quantity,
                priceAtTime: 0, // Remains 0 here, will be set during PIX creation if they are added there
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
      return order;
    });

    return NextResponse.json({ success: true, orderId: orderResult.id, order: orderResult });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 422 });
    }
    // Log the error for server-side inspection
    console.error('Error in POST /api/orders:', error);

    // Check if it's a Prisma-specific error for more detailed handling if needed
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Example: P2002 is unique constraint violation
      if (error.code === 'P2002') {
        return NextResponse.json({ success: false, error: 'A record with this identifier already exists.' }, { status: 409 });
      }
      return NextResponse.json({ success: false, error: 'Database error occurred.', details: error.message }, { status: 500 });
    }
    
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: false, error: 'Erro inesperado ao criar pedido.' }, { status: 500 });
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
    const dataToParse = { id, ...body }; // Combine id from query with body for parsing
    const data = patchOrderSchema.parse(dataToParse);
    
    const updatedOrderResult = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { id } });
      if (!existing) {
        // This will cause the transaction to rollback if the order is not found.
        // To handle this as a client error (404) rather than a server error (500 from transaction failure),
        // this check could be done *before* starting the transaction.
        // However, if finding the order is part of the atomic operation, keep it here.
        // For this case, moving it out might be better to return a 404.
        // Let's assume for now it's part of the atomic read-then-write.
        throw new Error('Pedido não encontrado.'); // This will be caught by the generic error handler
      }

      const updateData: Prisma.OrderUpdateInput = {};
      if (data.status) {
        updateData.status = data.status;
        updateData.statusUpdatedAt = new Date();
      }
      
      const updatedOrder = await tx.order.update({ where: { id }, data: updateData });

      // Atualiza os dados do cliente se necessário
      if (data.customerName || data.customerEmail || data.customerPhone) {
        await tx.customer.update({
          where: { id: existing.customerId }, // Use existing.customerId for safety
          data: {
            name: data.customerName,
            email: data.customerEmail,
            phone: data.customerPhone,
          },
        });
      }
      
      if (data.status && existing.status !== data.status) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            previousStatus: existing.status,
            newStatus: data.status,
            notes: `Status alterado para ${data.status}`,
          },
        });
      }
      return updatedOrder;
    });

    return NextResponse.json({ success: true, order: updatedOrderResult });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 422 });
    }
    console.error('Error in PATCH /api/orders:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json({ success: false, error: 'Database error during update.', details: error.message }, { status: 500 });
    }
    if (error instanceof Error && error.message === 'Pedido não encontrado.') {
        return NextResponse.json({ success: false, error: 'Pedido não encontrado.' }, { status: 404 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Erro inesperado ao atualizar pedido.' }, { status: 500 });
  }
}
