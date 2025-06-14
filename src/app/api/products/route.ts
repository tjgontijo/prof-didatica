import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { orderRateLimit } from '@/lib/rate-limit';
import { getCachedData, invalidateCache } from '@/lib/cache';

const productSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().min(2, 'Descrição deve ter pelo menos 2 caracteres'),
  price: z.number().int().min(0, 'Preço deve ser maior ou igual a zero'),
  salesPageUrl: z.string().url('URL da página de vendas inválida'),
  isActive: z.boolean().optional(),
});

const updateProductSchema = z.object({
  id: z.string().uuid('ID do produto inválido'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  description: z.string().min(2, 'Descrição deve ter pelo menos 2 caracteres').optional(),
  price: z.number().int().min(0, 'Preço deve ser maior ou igual a zero').optional(),
  salesPageUrl: z.string().url('URL da página de vendas inválida').optional(),
  isActive: z.boolean().optional(),
});

// GET /api/products - Lista produtos (com paginação e filtro opcional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const name = searchParams.get('name') || undefined;

    // Cache key baseado nos parâmetros
    const cacheKey = `products:page=${page}:size=${pageSize}:name=${name || 'all'}`;

    const result = await getCachedData(
      cacheKey,
      async () => {
        // Definindo filtro de busca por nome (se fornecido)
        const where: Prisma.ProductWhereInput = {
          deletedAt: null, // Não mostrar produtos deletados
        };
        if (name) {
          where.name = { contains: name, mode: Prisma.QueryMode.insensitive };
        }

        const [products, total] = await Promise.all([
          prisma.product.findMany({
            where,
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              salesPageUrl: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          }),
          prisma.product.count({ where }),
        ]);

        return { products, total, page, pageSize };
      },
      300, // 5 minutos de cache
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

// POST /api/products - Cria novo produto
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
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
    const data = productSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        ...data,
        isActive: data.isActive ?? true,
      },
    });

    // Invalidar cache de produtos
    invalidateCache('products:');

    return NextResponse.json({ success: true, product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Erro ao criar produto:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

// PUT /api/products - Atualiza produto por id (id no body)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...rest } = body;
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'ID do produto não informado.' },
        { status: 400 },
      );
    }
    const data = updateProductSchema.parse({ id, ...rest });
    const product = await prisma.product.update({
      where: { id },
      data,
    });

    // Invalidar cache de produtos
    invalidateCache('products:');

    return NextResponse.json({ success: true, product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

// DELETE /api/products?id=xxx - Remove produto por ID
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID do produto não informado.' },
      { status: 400 },
    );
  }
  try {
    const deleted = await prisma.product.delete({ where: { id } });

    // Invalidar cache de produtos
    invalidateCache('products:');

    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error('Erro ao remover produto:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
