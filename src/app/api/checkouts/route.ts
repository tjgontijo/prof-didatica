import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const checkoutSchema = z.object({
  productId: z.string().uuid(),
  campaignName: z.string().optional(),
  upsellPageUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

// Order bumps são gerenciados em uma rota separada

// GET /api/checkouts - Lista checkouts (com paginação e filtro opcional)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const id = searchParams.get('id') || undefined;
  const productId = searchParams.get('productId') || undefined;

  // Definindo filtros de busca
  const where: Prisma.CheckoutWhereInput = {};
  if (id) {
    where.id = id; // Exact match para id (que é unique)
  }
  if (productId) {
    where.productId = productId;
  }

  const [checkouts, total] = await Promise.all([
    prisma.checkout.findMany({
      where,
      include: {
        product: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.checkout.count({ where }),
  ]);

  return NextResponse.json({ checkouts, total, page, pageSize });
}

// POST /api/checkouts - Cria novo checkout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = checkoutSchema.parse(body);

    // Criar checkout (sem order bumps nesta rota)
    const checkout = await prisma.checkout.create({
      data: {
        productId: data.productId,
        campaignName: data.campaignName,        
        isActive: data.isActive ?? true,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json({ success: true, checkout });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 422 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Erro inesperado.' }, { status: 500 });
  }
}

// PUT /api/checkouts - Atualiza checkout por id (id no body)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...rest } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'ID do checkout não informado.' },
        { status: 400 },
      );
    }

    const data = checkoutSchema.partial().parse(rest);

    // Atualizar checkout (sem manipular order bumps nesta rota)
    const checkout = await prisma.checkout.update({
      where: { id },
      data,
      include: {
        product: true,
      },
    });

    return NextResponse.json({ success: true, checkout });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 422 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Erro inesperado.' }, { status: 500 });
  }
}

// DELETE /api/checkouts?id=xxx - Remove checkout por ID
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID do checkout não informado.' },
      { status: 400 },
    );
  }

  try {
    // Remover checkout (não precisa remover order bumps, pois não há relação direta)
    const deleted = await prisma.checkout.delete({ where: { id } });

    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Erro inesperado.' }, { status: 500 });
  }
}
