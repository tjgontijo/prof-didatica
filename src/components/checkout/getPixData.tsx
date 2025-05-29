// src/components/checkout/getPixData.tsx

import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

/**
 * Zod Schemas
 */
const PaymentIdSchema = z.string().uuid()

const PixSimplificadoSchema = z
  .object({
    qr_code: z.string(),
    qr_code_base64: z.string(),
    ticket_url: z.string().optional(),
    expiration_date: z.string().optional(),
  })
  .passthrough()

const PixCompletoSchema = z
  .object({
    point_of_interaction: z
      .object({
        transaction_data: z
          .object({
            qr_code: z.string().optional(),
            qr_code_base64: z.string().optional(),
          })
          .passthrough(),
      })
      .optional(),
    transaction_details: z
      .object({
        external_resource_url: z.string().optional(),
      })
      .optional(),
    date_of_expiration: z.string().optional(),
  })
  .passthrough()

/**
 * Interfaces de domínio
 */
export interface Customer {
  id: string
  name: string
  email: string
  phone: string
}

export interface OrderItem {
  id: string
  productId: string
  quantity: number
  priceAtTime: number
  isOrderBump: boolean
  isUpsell: boolean
}

export interface Order {
  id: string
  status: string
  customer?: Customer
  orderItems?: OrderItem[]
}

export interface PixData {
  id: string
  status: string
  qr_code: string
  qr_code_base64: string
  ticket_url: string
  expiration_date: string
  amount?: number
  order?: Order

  customerName: string
  orderNumber: string
}

/**
 * Singleton do Prisma para não abrir várias conexões em dev
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}
const prisma = globalThis.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

/**
 * Busca e normaliza os dados do PIX para a UI
 */
export async function getPixData(rawId: unknown): Promise<PixData | null> {
  // 1. Validar e parsear o ID do pagamento
  const parsedId = PaymentIdSchema.safeParse(rawId)
  if (!parsedId.success) {
    console.error('[getPixData] paymentId inválido:', rawId)
    return null
  }
  const id = parsedId.data

  try {
    // 2. Buscar no banco
    const payment = await prisma.payment.findFirst({
      where: { id, deletedAt: null },
      include: {
        order: {
          include: {
            orderItems: true,
            customer: true,
          },
        },
      },
    })
    if (!payment || !payment.rawData) return null

    // 3. Extrair rawData e validar com Zod
    const raw = typeof payment.rawData === 'object'
      ? payment.rawData
      : (() => {
          try { return JSON.parse(payment.rawData as string) }
          catch (err) { console.error('[getPixData] JSON.parse falhou', err); return null }
        })()
    if (!raw) return null

    const simp = PixSimplificadoSchema.safeParse(raw)
    const comp = PixCompletoSchema.safeParse(raw)
    let qrCode = '', qrCodeBase64 = '', ticketUrl = '', expirationDate = ''

    if (simp.success) {
      qrCode = simp.data.qr_code
      qrCodeBase64 = simp.data.qr_code_base64
      ticketUrl = simp.data.ticket_url ?? ''
      expirationDate = simp.data.expiration_date ?? ''
    } else if (comp.success && comp.data.point_of_interaction?.transaction_data) {
      qrCode = comp.data.point_of_interaction.transaction_data.qr_code ?? ''
      qrCodeBase64 = comp.data.point_of_interaction.transaction_data.qr_code_base64 ?? ''
      ticketUrl = comp.data.transaction_details?.external_resource_url ?? ''
      expirationDate = comp.data.date_of_expiration ?? ''
    } else {
      console.error('[getPixData] rawData não corresponde a nenhum schema Zod')
      return null
    }

    // 4. Campos extras para o fluxo
    const customerName = payment.order?.customer?.name ?? 'Cliente'
    const orderNumber = payment.order?.id ?? payment.id

    // 5. Montar e retornar PixData
    const pixData: PixData = {
      id: payment.id,
      status: payment.status,
      qr_code: qrCode,
      qr_code_base64: qrCodeBase64,
      ticket_url: ticketUrl,
      expiration_date: expirationDate,
      amount: payment.amount / 100,
      order: payment.order
        ? {
            id: payment.order.id,
            status: payment.order.status,
            customer: payment.order.customer
              ? {
                  id: payment.order.customer.id,
                  name: payment.order.customer.name,
                  email: payment.order.customer.email,
                  phone: payment.order.customer.phone,
                }
              : undefined,
            orderItems: payment.order.orderItems.map((it) => ({
              id: it.id,
              productId: it.productId,
              quantity: it.quantity,
              priceAtTime: it.priceAtTime,
              isOrderBump: it.isOrderBump,
              isUpsell: it.isUpsell,
            })),
          }
        : undefined,
      customerName,
      orderNumber: String(orderNumber),
    }

    return pixData
  } catch (err) {
    console.error('[getPixData] erro inesperado:', err)
    return null
  }
}
