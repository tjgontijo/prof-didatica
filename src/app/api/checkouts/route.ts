import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { orderRateLimit } from '@/lib/rate-limit'
import { getCachedData, invalidateCache } from '@/lib/cache'

const checkoutSchema = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  campaignName: z.string().min(1, 'Nome da campanha deve ter pelo menos 1 caractere').max(100, 'Nome da campanha muito longo').optional(),
  isActive: z.boolean().optional(),
})

const updateCheckoutSchema = z.object({
  id: z.string().uuid('ID do checkout inválido'),
  productId: z.string().uuid('ID do produto inválido').optional(),
  campaignName: z.string().min(1, 'Nome da campanha deve ter pelo menos 1 caractere').max(100, 'Nome da campanha muito longo').optional(),
  isActive: z.boolean().optional(),
})

// GET /api/checkouts - Lista checkouts (com paginação e filtro opcional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)))
    const id = searchParams.get('id') || undefined
    const productId = searchParams.get('productId') || undefined

    // Cache key baseado nos parâmetros
    const cacheKey = `checkouts:page=${page}:size=${pageSize}:id=${id || 'all'}:productId=${productId || 'all'}`

    const result = await getCachedData(
      cacheKey,
      async () => {
        // Definindo filtros de busca
        const where: Prisma.CheckoutWhereInput = {
          deletedAt: null // Não mostrar checkouts deletados
        }
        if (id) {
          where.id = id // Exact match para id (que é unique)
        }
        if (productId) {
          where.productId = productId
        }

        const [checkouts, total] = await Promise.all([
          prisma.checkout.findMany({
            where,
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  isActive: true
                }
              },
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.checkout.count({ where }),
        ])

        return { checkouts, total, page, pageSize }
      },
      300 // 5 minutos de cache
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao buscar checkouts:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/checkouts - Cria novo checkout
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await orderRateLimit(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Muitas tentativas. Tente novamente em alguns minutos.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
          }
        }
      )
    }

    const body = await request.json()
    const data = checkoutSchema.parse(body)

    // Validar se o produto existe e está ativo
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { id: true, isActive: true, name: true },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    if (!product.isActive) {
      return NextResponse.json(
        { success: false, error: 'Produto não está ativo' },
        { status: 400 }
      )
    }

    // Criar checkout
    const checkout = await prisma.checkout.create({
      data: {
        productId: data.productId,
        campaignName: data.campaignName,
        isActive: data.isActive ?? true,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            isActive: true
          }
        },
      },
    })

    // Invalidar cache de checkouts
    invalidateCache('checkouts:')

    return NextResponse.json({ success: true, checkout })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Erro ao criar checkout:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/checkouts - Atualiza checkout por id (id no body)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...rest } = body

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'ID do checkout não informado.' },
        { status: 400 },
      )
    }

    const data = updateCheckoutSchema.parse(rest)

    // Atualizar checkout (sem manipular order bumps nesta rota)
    const checkout = await prisma.checkout.update({
      where: { id },
      data,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            isActive: true
          }
        },
      },
    })

    // Invalidar cache de checkouts
    invalidateCache('checkouts:')

    return NextResponse.json({ success: true, checkout })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Erro ao atualizar checkout:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/checkouts?id=xxx - Remove checkout por ID
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID do checkout não informado.' },
      { status: 400 },
    )
  }

  try {
    // Remover checkout (não precisa remover order bumps, pois não há relação direta)
    const deleted = await prisma.checkout.delete({ where: { id } })

    // Invalidar cache de checkouts
    invalidateCache('checkouts:')

    return NextResponse.json({ success: true, deleted })
  } catch (error) {
    console.error('Erro ao remover checkout:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
