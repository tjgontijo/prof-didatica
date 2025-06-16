import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Definir OrderStatus para compatibilidade
import { OrderStatus } from '@prisma/client';
import { validateBrazilianPhone, cleanPhone } from '@/lib/phone';
import { orderRateLimit } from '@/lib/rate-limit';
import { getCachedProduct } from '@/lib/cache';

// Schema para validação forte dos dados recebidos
const orderSchema = z.object({
  productId: z.string().cuid(),
  checkoutId: z.string().cuid(),
  // Aceita tanto os campos antigos quanto os novos
  customerName: z.string().min(2).max(100).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z
    .string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(15, 'Telefone deve ter no máximo 15 dígitos')
    .refine(validateBrazilianPhone, 'Telefone deve ser um número brasileiro válido')
    .transform(cleanPhone)
    .optional(), // Limpa o telefone após validação

  // Novos campos
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z
    .string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(15, 'Telefone deve ter no máximo 15 dígitos')
    .refine(validateBrazilianPhone, 'Telefone deve ser um número brasileiro válido')
    .transform(cleanPhone)
    .optional(),
  orderBumps: z
    .array(
      z.object({
        productId: z.string().cuid(),
        quantity: z.number().min(1).max(10),
      }),
    )
    .optional(),
  quantity: z.number().min(1).max(10).default(1),
});

// Schema para validação parcial (PATCH)
const patchOrderSchema = z.object({
  id: z.string().cuid(),
  customerName: z.string().min(2).max(100).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z
    .string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(15, 'Telefone deve ter no máximo 15 dígitos')
    .refine(validateBrazilianPhone, 'Telefone deve ser um número brasileiro válido')
    .transform(cleanPhone)
    .optional(),
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
    // 1. Verificar rate limiting
    const rateLimitResult = await orderRateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Muitas tentativas. Tente novamente em alguns minutos.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        },
      );
    }

    const body = await request.json();
    const data = orderSchema.parse(body);

    // Normalizar os campos para compatibilidade com ambos os formatos
    const customerName = data.name || data.customerName;
    const customerEmail = data.email || data.customerEmail;
    const customerPhone = data.phone || data.customerPhone;

    // Verificar se temos os dados necessários
    if (!customerName || !customerEmail || !customerPhone) {
      throw new Error(
        'Dados do cliente incompletos. Forneça name/customerName, email/customerEmail e phone/customerPhone.',
      );
    }

    // Usar transação para garantir consistência
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Buscar ou criar customer (com tratamento de concorrência)
      // Primeiro verificamos se existe cliente com o mesmo email ou telefone
      let customer = await tx.customer.findFirst({
        where: {
          OR: [{ email: customerEmail }, { phone: customerPhone }],
        },
      });

      if (!customer) {
        try {
          // Tentar criar novo customer
          customer = await tx.customer.create({
            data: {
              name: customerName,
              email: customerEmail,
              phone: customerPhone,
            },
          });
        } catch (error: unknown) {
          // Se falhar por duplicata (race condition), buscar o existente novamente
          if (
            error instanceof Error &&
            'code' in error &&
            (error as { code: string }).code === 'P2002'
          ) {
            // Buscar por email ou telefone
            customer = await tx.customer.findFirst({
              where: {
                OR: [{ email: customerEmail }, { phone: customerPhone }],
              },
            });

            if (!customer) {
              throw new Error('Erro ao criar/buscar customer');
            }
          } else {
            throw error;
          }
        }
      } else {
        // Se encontramos um cliente existente, atualizamos os dados para garantir que estejam corretos
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: {
            name: customerName,
            // Não atualizamos email e telefone para evitar conflitos com outros registros
          },
        });
      }

      // Buscar preços dos produtos usando cache
      const mainProduct = await getCachedProduct(data.productId);

      if (!mainProduct || !mainProduct.isActive) {
        throw new Error('Produto principal não encontrado ou inativo');
      }

      let orderBumpProducts: Array<{ id: string; price: number; name: string }> = [];
      if (data.orderBumps?.length) {
        // Buscar order bumps com cache
        orderBumpProducts = await Promise.all(
          data.orderBumps.map(async (bump) => {
            const product = await getCachedProduct(bump.productId);
            if (!product || !product.isActive) {
              throw new Error(`Order bump ${bump.productId} não encontrado ou inativo`);
            }
            return product;
          }),
        );
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
                priceAtTime: mainProduct.price,
                isOrderBump: false,
              },
              ...(data.orderBumps?.map((bump) => {
                const product = orderBumpProducts.find((p) => p.id === bump.productId)!;
                return {
                  productId: bump.productId,
                  quantity: bump.quantity,
                  priceAtTime: product.price,
                  isOrderBump: true,
                };
              }) || []),
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

    return NextResponse.json(
      {
        success: true,
        order: result,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 422 });
    }
    if (error instanceof Error) {
      console.error('Erro ao criar pedido:', error.message);
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
