import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { prisma } from '@/lib/prisma';

// Tipos para validar os dados recebidos
type Item = {
  id: string;
  title: string;
  unit_price: number;
  quantity: number;
  picture_url?: string;
};

type Cliente = {
  nome: string;
  email: string;
  telefone: string;
};

type DadosPedido = {
  items: Item[];
  cliente: Cliente;
  valorTotal: number;
  checkoutId: string;
  orderId: string; // ID da Order já existente
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Obter os dados brutos da requisição
    const dados = (await request.json()) as DadosPedido;

    // Exibir os dados recebidos no console para debug
    console.log('Dados brutos recebidos do checkout:', dados);

    // Validar se temos todos os dados necessários
    if (!dados.items || dados.items.length === 0) {
      throw new Error('Nenhum item encontrado no pedido');
    }

    if (!dados.cliente || !dados.cliente.nome || !dados.cliente.email || !dados.cliente.telefone) {
      throw new Error('Dados do cliente incompletos');
    }

    if (!dados.valorTotal || dados.valorTotal <= 0) {
      throw new Error('Valor total inválido');
    }

    if (!dados.orderId) {
      throw new Error('ID do pedido não informado');
    }

    // Verificar se o pedido existe
    const order = await prisma.order.findUnique({
      where: { id: dados.orderId },
      include: {
        customer: true,
        orderItems: true,
      },
    });

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    // Verificar se há novos itens (order bumps) para adicionar
    const existingItemIds = order.orderItems.map((item) => item.productId);
    const newItems = dados.items.filter(
      (item) => !existingItemIds.includes(item.id) && item.id !== order.productId, // Excluir o item principal que já existe
    );

    // Criar novos OrderItems para os order bumps selecionados
    if (newItems.length > 0) {
      await Promise.all(
        newItems.map((item) =>
          prisma.orderItem.create({
            data: {
              orderId: dados.orderId,
              productId: item.id,
              quantity: item.quantity,
              priceAtTime: item.unit_price,
              isOrderBump: true,
              isUpsell: false,
            },
          }),
        ),
      );
    }

    // Atualizar o status da ordem para PENDING_PAYMENT usando o Prisma diretamente
    try {
      await prisma.order.update({
        where: { id: dados.orderId },
        data: {
          status: 'PENDING_PAYMENT',
          statusUpdatedAt: new Date(),
          paidAmount: 0, // Garantir que o valor pago seja zerado no início do pagamento
        },
      });
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      throw new Error(
        `Erro ao atualizar status do pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }

    // Registrar a mudança de status na tabela de histórico
    await prisma.orderStatusHistory.create({
      data: {
        orderId: dados.orderId,
        previousStatus: order.status,
        newStatus: 'PENDING_PAYMENT',
        notes: 'Pedido aguardando pagamento',
      },
    });

    // Configurar o Mercado Pago com o token de acesso
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('Token de acesso do Mercado Pago não configurado');
    }

    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);

    // Criar o pagamento PIX
    const resultado = await payment.create({
      body: {
        transaction_amount: dados.valorTotal,
        description: `Pedido ${dados.orderId}`,
        payment_method_id: 'pix',
        payer: {
          email: dados.cliente.email,
          first_name: dados.cliente.nome.split(' ')[0],
          last_name: dados.cliente.nome.split(' ').slice(1).join(' '),
          identification: {
            type: 'CPF',
            number: '12345678909', // Em produção, deve ser o CPF real do cliente
          },
          phone: {
            area_code: dados.cliente.telefone.substring(0, 2),
            number: dados.cliente.telefone.substring(2),
          },
        },
        additional_info: {
          items: dados.items.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.title,
            picture_url: item.picture_url || '',
            category_id: 'books',
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
          payer: {
            phone: {
              area_code: dados.cliente.telefone.substring(0, 2),
              number: dados.cliente.telefone.substring(2),
            },
          },
        },
        external_reference: dados.orderId, // Usar o ID do pedido como referência externa
      },
    });

    console.log('Resposta do Mercado Pago:', resultado);

    // Extrair os dados do PIX da resposta
    if (resultado.status !== 'pending') {
      throw new Error(`Status inesperado do pagamento: ${resultado.status}`);
    }

    // Obter os dados do PIX
    const pixData = resultado.point_of_interaction?.transaction_data;
    if (!pixData) {
      throw new Error('Dados do PIX não encontrados na resposta');
    }

    // Salvar os dados do pagamento no banco de dados e obter o ID gerado
    let paymentId;

    if (resultado.id) {
      const payment = await prisma.payment.create({
        data: {
          orderId: dados.orderId, // Usar o ID correto do pedido
          status: resultado.status || 'pending',
          method: 'pix',
          mercadoPagoId: resultado.id.toString(),
          amount: Math.round(dados.valorTotal * 100), // Converter para centavos
          rawData: {
            qr_code: pixData.qr_code || '',
            qr_code_base64: pixData.qr_code_base64 || '',
            ticket_url: pixData.ticket_url || '',
            expiration_date:
              resultado.date_of_expiration ||
              new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        },
      });

      paymentId = payment.id;

      // Atualizar o status da ordem para PAYMENT_PROCESSING usando o Prisma diretamente
      try {
        await prisma.order.update({
          where: { id: dados.orderId },
          data: {
            status: 'PAYMENT_PROCESSING',
            statusUpdatedAt: new Date(),
          },
        });
      } catch (error) {
        console.error('Erro ao atualizar status para PAYMENT_PROCESSING:', error);
        // Continuar mesmo com erro, pois o pagamento já foi criado
      }

      // Registrar a mudança de status na tabela de histórico
      await prisma.orderStatusHistory.create({
        data: {
          orderId: dados.orderId,
          previousStatus: 'PENDING_PAYMENT',
          newStatus: 'PAYMENT_PROCESSING',
          notes: 'Pagamento PIX gerado e aguardando confirmação',
        },
      });
    }

    // Retornar os dados do PIX para o cliente
    return NextResponse.json({
      id: paymentId,
      status: resultado.status,
      qr_code: pixData.qr_code,
      qr_code_base64: pixData.qr_code_base64,
      ticket_url: pixData.ticket_url,
      expiration_date: resultado.date_of_expiration,
    });
  } catch (error) {
    // Exibir erro no console
    console.error('Erro ao processar pagamento:', error);

    // Retornar erro detalhado
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : 'Erro ao processar pagamento' },
      { status: 500 },
    );
  }
}
