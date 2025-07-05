import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import cuid from 'cuid'
import { OrderStatus } from '@prisma/client'
import { validateBrazilianPhone, cleanPhone } from '@/lib/phone'
import { orderRateLimit } from '@/lib/rate-limit'
import { getCachedProduct } from '@/lib/cache'

// 1) Schemas DRY
const nameSchema = z.string().min(2).max(100)
const emailSchema = z.string().email()
const phoneSchema = z
  .string()
  .min(10, 'Telefone deve ter pelo menos 10 digitos')
  .max(15, 'Telefone deve ter no maximo 15 digitos')
  .refine(validateBrazilianPhone, 'Telefone deve ser um numero brasileiro valido')
  .transform(cleanPhone)

// 2) Helper unificado de resposta JSON
function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status })
}

// 3) Validação de criacao (POST)
const orderSchema = z.object({
  productId: z.string().cuid(),
  checkoutId: z.string().cuid(),
  customerName: nameSchema.optional(),
  customerEmail: emailSchema.optional(),
  customerPhone: phoneSchema.optional(),
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  orderBumps: z
    .array(
      z.object({
        productId: z.string().cuid(),
        quantity: z.number().min(1).max(10),
      })
    )
    .default([]),
  quantity: z.number().min(1).max(10).default(1),
  trackingSessionId: z.string().cuid().optional(),
})

// 4) Validação de atualização (PATCH)
const patchOrderSchema = z.object({
  id: z.string().cuid(),
  customerName: nameSchema.optional(),
  customerEmail: emailSchema.optional(),
  customerPhone: phoneSchema.optional(),
  status: z.nativeEnum(OrderStatus).optional(),
})

// 5) Tratamento de erros centralizado
function handleError(e: unknown) {
  if (e instanceof z.ZodError) return json({ success: false, error: e.errors }, 422)
  const msg = e instanceof Error ? e.message : 'Erro inesperado'
  const status = msg === 'Erro inesperado' ? 500 : 400
  return json({ success: false, error: msg }, status)
}

// 6) Interface de evento
interface TrackingEventPayload {
  trackingSessionId: string
  eventName: string
  eventId: string
  customData: {
    value: number
    currency: string
    content_ids?: string[]
    content_type?: string
    contents?: Array<{
      id: string
      quantity: number
      item_price?: number
    }>
    customer?: {
      email?: string
      phone?: string
      firstName?: string
      lastName?: string
      [key: string]: string | undefined
    }
    [key: string]: unknown
  }
}

// 7) Envio ao Meta CAPI (sem logs)
async function sendTrackingEvent(payload: TrackingEventPayload): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.APP_URL}/api/tracking/event`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      }
    )
    return response.ok
  } catch {
    return false
  }
}

// GET  /api/orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') ?? '20', 10), 100)
    const email = searchParams.get('email') ?? undefined

    const where = email ? { customer: { email } } : {}

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { orderItems: true, payment: true, customer: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ])

    return json({ orders, total, page, pageSize })
  } catch (e) {
    return handleError(e)
  }
}

// POST /api/orders
export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await orderRateLimit(request)
    if (!rateLimitResult.success) {
      return json(
        {
          success: false,
          error: 'Muitas tentativas. Tente novamente em alguns minutos.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        429
      )
    }

    const body = await request.json()
    const data = orderSchema.parse(body)

    // 8) Merge único de dados do cliente
    const customer = {
      name: data.name ?? data.customerName!,
      email: data.email ?? data.customerEmail!,
      phone: data.phone ?? data.customerPhone!,
    }
    if (!customer.name || !customer.email || !customer.phone) {
      throw new Error(
        'Dados do cliente incompletos. Forneça name/customerName, email/customerEmail e phone/customerPhone.'
      )
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // findOrCreateCustomer
      let cust = await tx.customer.findFirst({
        where: { OR: [{ email: customer.email }, { phone: customer.phone }] },
      })
      if (!cust) {
        try {
          cust = await tx.customer.create({ data: customer })
        } catch (err: unknown) {
          if (
            err instanceof Error &&
            'code' in err &&
            (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2002')
          ) {
            cust = await tx.customer.findFirst({
              where: { OR: [{ email: customer.email }, { phone: customer.phone }] },
            })
            if (!cust) throw new Error('Erro ao criar/buscar customer')
          } else {
            throw err
          }
        }
      } else {
        cust = await tx.customer.update({
          where: { id: cust.id },
          data: { name: customer.name },
        })
      }

      // produto principal
      const mainProduct = await getCachedProduct(data.productId)
      if (!mainProduct || !mainProduct.isActive) {
        throw new Error('Produto principal nao encontrado ou inativo')
      }

      // order bumps
      const bumps = data.orderBumps
      const bumpProducts = await Promise.all(
        bumps.map(async b => {
          const p = await getCachedProduct(b.productId)
          if (!p || !p.isActive) throw new Error(`Order bump ${b.productId} invalido`)
          return p
        })
      )

      // itens do pedido
      const items = [
        {
          productId: data.productId,
          quantity: data.quantity,
          priceAtTime: mainProduct.price,
          isOrderBump: false,
        },
        ...bumps.map(b => {
          const p = bumpProducts.find(x => x.id === b.productId)!
          return {
            productId: b.productId,
            quantity: b.quantity,
            priceAtTime: p.price,
            isOrderBump: true,
          }
        }),
      ]

      // trackingSessionId unico
      let trackingSessionDbId: string | undefined
      if (data.trackingSessionId) {
        const session = await tx.trackingSession.findUnique({
          where: { sessionId: data.trackingSessionId },
          select: { id: true },
        })
        if (session) trackingSessionDbId = session.id
      }

      // criar order
      const order = await tx.order.create({
        data: {
          productId: data.productId,
          checkoutId: data.checkoutId,
          customerId: cust.id,
          paidAmount: 0,
          trackingSessionId: trackingSessionDbId,
          orderItems: { create: items },
          statusHistory: {
            create: {
              previousStatus: null,
              newStatus: OrderStatus.DRAFT,
              notes: 'Pedido criado',
            },
          },
        },
        include: { orderItems: true, statusHistory: true, customer: true },
      })

      return order
    })

    // evento AddPaymentInfo
    if (data.trackingSessionId) {
      const mainVal = result.orderItems
        .filter(i => !i.isOrderBump)
        .reduce((sum, i) => sum + i.priceAtTime * i.quantity, 0)
      const bumpVal = result.orderItems
        .filter(i => i.isOrderBump)
        .reduce((sum, i) => sum + i.priceAtTime * i.quantity, 0)
      const total = mainVal + bumpVal
      const eventId = cuid()
      await sendTrackingEvent({
        trackingSessionId: data.trackingSessionId,
        eventName: 'AddPaymentInfo',
        eventId,
        customData: {
          value: total,
          currency: 'BRL',
          content_ids: result.orderItems.map(i => i.productId),
          content_type: 'product',
          contents: result.orderItems.map(i => ({
            id: i.productId,
            quantity: i.quantity,
            item_price: i.priceAtTime,
          })),
          customer: {
            email: result.customer.email,
            phone: result.customer.phone,
            firstName: result.customer.name.split(' ')[0].toLowerCase(),
            lastName: result.customer.name.split(' ').slice(1).join(' ').toLowerCase(),
          },
        },
      })
    }

    return json({ success: true, order: result }, 201)
  } catch (e) {
    return handleError(e)
  }
}

// PATCH /api/orders
export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return json({ success: false, error: 'ID do pedido nao informado.' }, 400)

  try {
    const body = await request.json()
    const data = patchOrderSchema.parse({ id, ...body })
    const existing = await prisma.order.findUnique({ where: { id } })
    if (!existing) return json({ success: false, error: 'Pedido nao encontrado.' }, 404)

    const updateData: Prisma.OrderUpdateInput = {}
    if (data.status) {
      updateData.status = data.status
      updateData.statusUpdatedAt = new Date()
    }

    const updated = await prisma.order.update({ where: { id }, data: updateData })

    if (data.customerName || data.customerEmail || data.customerPhone) {
      await prisma.customer.update({
        where: { id: existing.customerId },
        data: {
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone,
        },
      })
    }

    if (data.status && existing.status !== data.status) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          previousStatus: existing.status,
          newStatus: data.status,
          notes: `Status alterado para ${data.status}`,
        },
      })
    }

    return json({ success: true, order: updated })
  } catch (e) {
    return handleError(e)
  }
}

// DELETE /api/orders
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return json({ success: false, error: 'ID do pedido nao informado.' }, 400)

  try {
    // soft delete (se tiver campo deletedAt)
    const deleted = await prisma.order.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    return json({ success: true, deleted })
  } catch (e) {
    return handleError(e)
  }
}
