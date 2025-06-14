// src/components/checkout/getPixData.tsx

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

/**
 * Zod Schemas
 */
const PaymentIdSchema = z.string().uuid();

/**
 * Interfaces de domínio
 */
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  priceAtTime: number;
  isOrderBump: boolean;
  isUpsell: boolean;
}

export interface Order {
  id: string;
  status: string;
  customer?: Customer;
  orderItems?: OrderItem[];
}

export interface PixData {
  id: string;
  status: string;
  qr_code: string;
  qr_code_base64: string;
  ticket_url: string;
  expiration_date: string;
  amount?: number;
  order?: Order;

  // Campos adicionais para UI
  customerName: string;
  orderNumber: string;
}

/**
 * Singleton do Prisma para não abrir várias conexões em dev
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}
const prisma = globalThis.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

/**
 * Busca e normaliza os dados do PIX para a UI
 */
export async function getPixData(rawId: unknown): Promise<PixData | null> {
  // 1. Validar e parsear o ID do pagamento
  const parsedId = PaymentIdSchema.safeParse(rawId);
  if (!parsedId.success) {
    console.error('[getPixData] paymentId inválido:', rawId);
    return null;
  }
  const id = parsedId.data;

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
    });
    if (!payment || !payment.rawData) return null;

    // 3. Extrair rawData sem validação com Zod
    const raw = (() => {
      try {
        if (typeof payment.rawData === 'object') {
          return payment.rawData;
        } else if (typeof payment.rawData === 'string') {
          return JSON.parse(payment.rawData);
        }
        return null;
      } catch (err) {
        console.error('[getPixData] Falha ao processar rawData', err);
        return null;
      }
    })();
    
    if (!raw) {
      console.error('[getPixData] rawData nulo ou indefinido');
      return null;
    }
    
    console.log('[getPixData] Dados brutos recebidos:', raw);
    
    // Abordagem direta: extrair campos independentemente do formato
    let qrCode = '';
    let qrCodeBase64 = '';
    let ticketUrl = '';
    let expirationDate = '';
    
    // Dados API própria
    if (typeof raw.qrCode === 'string') {
      qrCode = raw.qrCode;
    }
    if (typeof raw.qrCodeBase64 === 'string') {
      qrCodeBase64 = raw.qrCodeBase64;
    }
    if (typeof raw.pixCopyPaste === 'string' && !qrCode) {
      qrCode = raw.pixCopyPaste;
    }
    if (typeof raw.expiresAt === 'string') {
      expirationDate = raw.expiresAt;
    }
    
    // Dados formato antigo simples
    if (typeof raw.qr_code === 'string' && !qrCode) {
      qrCode = raw.qr_code;
    }
    if (typeof raw.qr_code_base64 === 'string' && !qrCodeBase64) {
      qrCodeBase64 = raw.qr_code_base64;
    }
    if (typeof raw.ticket_url === 'string' && !ticketUrl) {
      ticketUrl = raw.ticket_url;
    }
    if (typeof raw.expiration_date === 'string' && !expirationDate) {
      expirationDate = raw.expiration_date;
    }
    
    // Dados do Mercado Pago
    if (raw.point_of_interaction?.transaction_data?.qr_code && !qrCode) {
      qrCode = raw.point_of_interaction.transaction_data.qr_code;
    }
    if (raw.point_of_interaction?.transaction_data?.qr_code_base64 && !qrCodeBase64) {
      qrCodeBase64 = raw.point_of_interaction.transaction_data.qr_code_base64;
    }
    if (raw.point_of_interaction?.transaction_data?.ticket_url && !ticketUrl) {
      ticketUrl = raw.point_of_interaction.transaction_data.ticket_url;
    }
    if (raw.transaction_details?.external_resource_url && !ticketUrl) {
      ticketUrl = raw.transaction_details.external_resource_url;
    }
    if (raw.date_of_expiration && !expirationDate) {
      expirationDate = raw.date_of_expiration;
    }
    
    // Log dos dados extraídos
    console.log('[getPixData] Dados extraídos:', {
      qrCode: qrCode ? `${qrCode.substring(0, 20)}...` : 'Não encontrado',
      qrCodeBase64: qrCodeBase64 ? 'Presente' : 'Não encontrado',
      ticketUrl: ticketUrl || 'Não encontrado',
      expirationDate: expirationDate || 'Não encontrado'
    });
    
    // Se não encontramos dados essenciais, temos um problema
    if (!qrCode && !qrCodeBase64) {
      console.error('[getPixData] Dados essenciais do PIX não encontrados');
      return null;
    }

    // 4. Construir objeto PixData
    const pixData: PixData = {
      id: payment.id,
      status: payment.status || 'pending',
      qr_code: qrCode,
      qr_code_base64: qrCodeBase64,
      ticket_url: ticketUrl,
      expiration_date: expirationDate,
      amount: payment.amount,
      order: payment.order ? {
        id: payment.order.id,
        status: payment.order.status,
        customer: payment.order.customer,
        orderItems: payment.order.orderItems
      } : undefined,
      customerName: payment.order?.customer?.name || 'Cliente',
      orderNumber: payment.order?.id || payment.id
    };
    
    console.log('[getPixData] Dados do PIX processados com sucesso:', {
      id: pixData.id,
      qrCode: pixData.qr_code ? 'Presente' : 'Ausente',
      qrCodeBase64: pixData.qr_code_base64 ? 'Presente' : 'Ausente',
      customerName: pixData.customerName,
      orderNumber: pixData.orderNumber
    });

    return pixData;
  } catch (err) {
    console.error('[getPixData] erro inesperado:', err);
    return null;
  }
}
