import { PrismaClient } from '@prisma/client';

/**
 * Interface para o cliente
 */
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

/**
 * Interface para os itens do pedido
 */
export interface OrderItem {
  id: string;
  productId: string;
  productTitle?: string;
  quantity: number;
  priceAtTime: number;
  isOrderBump?: boolean;
  isUpsell?: boolean;
  imageUrl?: string;
}

/**
 * Interface para o pedido
 */
export interface Order {
  id: string;
  status: string;
  customer?: Customer;
  orderItems?: OrderItem[];
}

/**
 * Interface para os dados do PIX
 */
export interface PixData {
  id: string;
  status: string;
  qr_code: string;
  qr_code_base64: string;
  ticket_url: string;
  expiration_date: string;
  amount?: number;
  order?: Order;
}

/**
 * Função para buscar dados do PIX pelo ID do Payment ou pelo ID do Mercado Pago
 * @param id ID do Payment ou ID do Mercado Pago
 * @returns Dados do PIX ou null se não encontrado
 */
export async function getPixData(id: string): Promise<PixData | null> {
  const prisma = new PrismaClient();
  
  try {
    // Tentar buscar primeiro pelo ID do payment
    let payment = await prisma.payment.findUnique({
      where: {
        id,
        deletedAt: null
      },
      include: {
        order: {
          include: {
            checkout: true,
            orderItems: true,
            customer: true
          }
        }
      }
    });

    // Se não encontrar pelo ID, tentar pelo mercadoPagoId
    if (!payment) {
      payment = await prisma.payment.findFirst({
        where: {
          mercadoPagoId: id,
          deletedAt: null
        },
        include: {
          order: {
            include: {
              checkout: true,
              orderItems: true,
              customer: true
            }
          }
        }
      });
    }

    if (!payment) {
      return null;
    }

    // Extrair os dados do PIX do campo rawData (que é um JSON)
    const rawData = payment.rawData as Record<string, unknown>;
    
    return {
      id: payment.id,
      status: payment.status,
      qr_code: (rawData?.qr_code as string) || '',
      qr_code_base64: (rawData?.qr_code_base64 as string) || '',
      ticket_url: (rawData?.ticket_url as string) || '',
      expiration_date: (rawData?.expiration_date as string) || '',
      amount: payment.amount / 100, // Convertendo de centavos para reais
      order: payment.order // Incluindo os dados do pedido completo
    };
  } catch (error) {
    console.error('Erro ao buscar dados do PIX:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}
