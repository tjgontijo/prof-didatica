import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path as needed

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  price: z.number().int().min(0),
  salesPageUrl: z.string().url(),
  isActive: z.boolean().optional(),
});

// GET /api/products - Lista produtos (com paginação e filtro opcional)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const name = searchParams.get('name') || undefined;

  // Definindo filtro de busca por nome (se fornecido)
  const where: Prisma.ProductWhereInput = { deletedAt: null }; // Filter out soft-deleted products
  if (name) {
    where.name = { contains: name, mode: Prisma.QueryMode.insensitive };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, page, pageSize });
}

// POST /api/products - Cria novo produto
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = productSchema.parse(body);
    const product = await prisma.product.create({
      data: {
        ...data,
        isActive: data.isActive ?? true,
      },
    });
    return NextResponse.json({ success: true, product });
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

// PUT /api/products - Atualiza produto por id (id no body)
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...rest } = body;
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'ID do produto não informado.' },
        { status: 400 },
      );
    }
    const data = productSchema.partial().parse(rest);
    const product = await prisma.product.update({
      where: { id },
      data,
    });
    return NextResponse.json({ success: true, product });
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

// DELETE /api/products?id=xxx - Remove produto por ID
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID do produto não informado.' },
      { status: 400 },
    );
  }
  try {
    const product = await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ success: true, product });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // Record to update not found
        return NextResponse.json({ success: false, error: 'Produto não encontrado.' }, { status: 404 });
      }
      // Handle other Prisma errors
      return NextResponse.json({ success: false, error: 'Erro de banco de dados ao deletar produto.', details: error.message }, { status: 500 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Erro inesperado ao deletar produto.' }, { status: 500 });
  }
}
