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
 * Função para buscar dados do PIX pelo ID do Payment
 * @param id ID do Payment
 * @returns Dados do PIX ou null se não encontrado
 */
export async function getPixData(id: string): Promise<PixData | null> {
  console.log('=== INÍCIO getPixData ===');
  console.log('Buscando pagamento com ID:', id);

  const prisma = new PrismaClient();

  try {
    // Buscar pelo ID do payment
    const payment = await prisma.payment.findUnique({
      where: { id, deletedAt: null },
      include: {
        order: {
          include: {
            checkout: true,
            orderItems: true,
            customer: true,
          },
        },
      },
    });

    if (!payment) {
      console.log('❌ Pagamento não encontrado com o ID fornecido');
      return null;
    }

    console.log('✅ Pagamento encontrado:', {
      id: payment.id,
      status: payment.status,
      amount: payment.amount / 100,
      orderId: payment.orderId,
      createdAt: payment.createdAt,
    });

    // Definir interfaces para os dados do PIX
    interface PixDataSimplificado {
      id: string | number;
      status: string;
      qr_code: string;
      qr_code_base64: string;
      ticket_url?: string;
      expiration_date?: string;
    }

    interface PixDataCompleto {
      point_of_interaction?: {
        transaction_data?: {
          qr_code?: string;
          qr_code_base64?: string;
        };
      };
      transaction_details?: {
        external_resource_url?: string;
      };
      date_of_expiration?: string;
    }

    // Extrair os dados do PIX do campo rawData
    let rawData: PixDataSimplificado | PixDataCompleto;
    try {
      rawData = JSON.parse(payment.rawData as string);
    } catch (error) {
      console.error('Erro ao fazer parse do rawData:', error);
      return null;
    }

    console.log('Raw data completo:', rawData);

    // Verificar se os dados do PIX estão na raiz do objeto ou aninhados
    let qrCode = '';
    let qrCodeBase64 = '';
    let ticketUrl = '';
    let expirationDate = '';

    // Verificar o formato dos dados
    const isSimplificado = 'qr_code' in rawData && 'qr_code_base64' in rawData;
    const isCompleto =
      'point_of_interaction' in rawData && rawData.point_of_interaction?.transaction_data;

    // Formato 1: Dados na raiz do objeto (formato simplificado)
    if (isSimplificado) {
      console.log('Usando formato 1: Dados na raiz do objeto');
      const pixSimples = rawData as PixDataSimplificado;
      qrCode = pixSimples.qr_code;
      qrCodeBase64 = pixSimples.qr_code_base64;
      ticketUrl = pixSimples.ticket_url || '';
      expirationDate = pixSimples.expiration_date || '';
    }
    // Formato 2: Dados aninhados (formato original do Mercado Pago)
    else if (isCompleto) {
      console.log('Usando formato 2: Dados aninhados');
      const pixCompleto = rawData as PixDataCompleto;
      const transactionData = pixCompleto.point_of_interaction!.transaction_data!;
      qrCode = transactionData.qr_code || '';
      qrCodeBase64 = transactionData.qr_code_base64 || '';
      ticketUrl = pixCompleto.transaction_details?.external_resource_url || '';
      expirationDate = pixCompleto.date_of_expiration || '';
    } else {
      console.error('Formato de dados do PIX não reconhecido:', rawData);
      return null;
    }

    console.log('Dados extraídos do PIX:', {
      qrCode: qrCode ? `${qrCode.substring(0, 20)}...` : 'vazio',
      qrCodeBase64: qrCodeBase64 ? `${qrCodeBase64.substring(0, 20)}...` : 'vazio',
      ticketUrl,
      expirationDate,
    });

    // Dados que serão enviados para o cliente
    const pixData = {
      id: payment.id,
      status: payment.status,
      qr_code: qrCode,
      qr_code_base64: qrCodeBase64,
      ticket_url: ticketUrl,
      expiration_date: expirationDate,
      amount: payment.amount / 100, // Convertendo de centavos para reais
      order: payment.order, // Incluindo os dados do pedido completo
    };

    console.log('📦 Dados que serão enviados para o cliente:');
    console.log(
      JSON.stringify(
        {
          id: pixData.id,
          status: pixData.status,
          amount: pixData.amount,
          qr_code_exists: !!pixData.qr_code,
          qr_code_first_chars: pixData.qr_code ? `${pixData.qr_code.substring(0, 20)}...` : 'vazio',
          qr_code_base64_exists: !!pixData.qr_code_base64,
          qr_code_base64_first_chars: pixData.qr_code_base64
            ? `${pixData.qr_code_base64.substring(0, 20)}...`
            : 'vazio',
          ticket_url: pixData.ticket_url,
          expiration_date: pixData.expiration_date,
          order: {
            id: pixData.order?.id,
            status: pixData.order?.status,
            customer: pixData.order?.customer
              ? {
                  id: pixData.order.customer.id,
                  name: pixData.order.customer.name,
                  email: pixData.order.customer.email,
                  phone: pixData.order.customer.phone,
                }
              : null,
            orderItems: pixData.order?.orderItems?.map((item) => ({
              id: item.id,
              productId: item.productId,
              quantity: item.quantity,
              priceAtTime: item.priceAtTime,
              isOrderBump: item.isOrderBump,
              isUpsell: item.isUpsell,
            })),
          },
        },
        null,
        2,
      ),
    );

    console.log('=== FIM getPixData ===');
    return pixData;
  } catch (error) {
    console.error('❌ Erro ao buscar dados do PIX:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}
