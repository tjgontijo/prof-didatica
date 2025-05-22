import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Schema para validação forte dos dados recebidos
const orderSchema = z.object({
  productId: z.string().uuid(),
  checkoutId: z.string().uuid(),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10),
  orderBumps: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().min(1),
  })).optional(),
  quantity: z.number().min(1).default(1),
});

// GET /api/orders - Lista pedidos (com paginação e filtro opcional)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const email = searchParams.get('email') || undefined;

  const where = email ? { customerEmail: email } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { orderItems: true, payment: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where })
  ]);

  return NextResponse.json({ orders, total, page, pageSize });
}

// DELETE /api/orders?id=xxx - Deleta pedido por ID (soft delete se possível)
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'ID do pedido não informado.' }, { status: 400 });
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

    // Criação do pedido principal
    const order = await prisma.order.create({
      data: {
        productId: data.productId,
        checkoutId: data.checkoutId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        paidAmount: 0, // Inicialmente 0, só será preenchido após pagamento
        orderItems: {
          create: [
            {
              productId: data.productId,
              quantity: data.quantity,
              priceAtTime: 0, // Preencher depois conforme regra de preço
              isOrderBump: false,
            },
            ...(data.orderBumps?.map(bump => ({
              productId: bump.productId,
              quantity: bump.quantity,
              priceAtTime: 0, // Preencher depois conforme regra de preço
              isOrderBump: true,
            })) || [])
          ]
        }
      },
      include: {
        orderItems: true
      }
    });

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