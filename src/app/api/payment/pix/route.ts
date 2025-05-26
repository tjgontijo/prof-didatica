import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // Import Prisma for error types
import { z } from 'zod';

// Zod Schemas for validation
const itemSchema = z.object({
  id: z.string().min(1), // Assuming product IDs are strings, could be .uuid() if they are
  title: z.string().min(1, "Título do item é obrigatório."),
  unit_price: z.number().int("Preço unitário deve ser um inteiro (centavos).").positive("Preço unitário deve ser positivo."), // Expecting cents
  quantity: z.number().int("Quantidade deve ser um inteiro.").positive("Quantidade deve ser positiva."),
  picture_url: z.string().url("URL da imagem inválida.").optional(),
});

const clienteSchema = z.object({
  nome: z.string().min(2, "Nome do cliente é obrigatório."),
  email: z.string().email("Email do cliente inválido."),
  // Regex for a common Brazilian phone format (XX) XXXXX-XXXX or (XX) XXXX-XXXX
  // Allows for 10 or 11 digits after area code.
  telefone: z.string().regex(/^\d{10,11}$/, "Telefone do cliente inválido. Use apenas números, incluindo DDD, com 10 ou 11 dígitos."),
});

const dadosPedidoPixSchema = z.object({
  items: z.array(itemSchema).min(1, "Pelo menos um item é necessário no pedido."),
  cliente: clienteSchema,
  valorTotal: z.number().positive("Valor total do pedido deve ser positivo."), // Expecting Reais
  checkoutId: z.string().uuid("ID do Checkout inválido."),
  orderId: z.string().uuid("ID do Pedido inválido."),
});

// Type inferred from Zod schema
type DadosPedido = z.infer<typeof dadosPedidoPixSchema>;
// type Item = z.infer<typeof itemSchema>; // Not strictly needed if DadosPedido is used
// type Cliente = z.infer<typeof clienteSchema>; // Not strictly needed

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const dadosRaw = await request.json();
    const validationResult = dadosPedidoPixSchema.safeParse(dadosRaw);

    if (!validationResult.success) {
      console.error('Erro de validação Zod:', validationResult.error.flatten().fieldErrors);
      return NextResponse.json(
        { success: false, error: "Dados inválidos.", details: validationResult.error.flatten().fieldErrors },
        { status: 422 }
      );
    }
    const dados: DadosPedido = validationResult.data; // Use validated and typed data

    // Exibir os dados recebidos no console para debug (após validação)
    console.log('Dados validados recebidos do checkout:', dados);

    // Manual validation checks are no longer needed here as Zod handles them.
    // e.g., if (!dados.items || dados.items.length === 0) { ... } is covered by Zod.

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
            category_id: 'books', // Or make dynamic if possible
            quantity: item.quantity,
            unit_price: parseFloat((item.unit_price / 100).toFixed(2)), // Convert from cents to Reais
          })),
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

    // Criar um objeto simplificado com apenas os dados necessários do PIX
    const pixSimplificado = {
      id: resultado.id,
      status: resultado.status,
      qr_code: pixData.qr_code,
      qr_code_base64: pixData.qr_code_base64,
      ticket_url: resultado.transaction_details?.external_resource_url || '',
      expiration_date: resultado.date_of_expiration || '',
    };

    console.log('typeof pixSimplificado:', typeof pixSimplificado);
    console.log('preview:', pixSimplificado);

    // Salvar os dados do pagamento no banco de dados e obter o ID gerado
    let createdPaymentId: string | undefined;

    if (resultado.id) {
      // --- Start of Prisma Transaction ---
      createdPaymentId = await prisma.$transaction(async (tx) => {
        // Verificar se o pedido existe
        const order = await tx.order.findUnique({
          where: { id: dados.orderId },
          select: { status: true, orderItems: { select: { productId: true } } }, // Select only needed fields
        });

        if (!order) {
          // This will cause the transaction to rollback
          throw new Error('Pedido não encontrado no banco de dados durante a transação.');
        }
        const currentOrderStatus = order.status;

        // Verificar se há novos itens (order bumps) para adicionar
        const existingItemIds = order.orderItems.map((item) => item.productId);
        const newItems = dados.items.filter(
          (item) => !existingItemIds.includes(item.id) && item.id !== dados.items.find(i => i.id === order.orderItems.find(oi => !oi.isOrderBump)?.productId)?.id // Ensure main product ID is correct
        );
         // TODO: The main product ID logic above needs to be robust. Assuming dados.items[0] is main or similar for now if order.productId is not directly available.
         // For now, let's assume order.productId was the main product ID used when order was created.
         // The filter should correctly identify the main product ID from `dados.items` or `order` to exclude it from `newItems`.
         // This part might need careful review based on how `order.productId` is set vs `dados.items` structure.

        // Criar novos OrderItems para os order bumps selecionados
        if (newItems.length > 0) {
          await Promise.all(
            newItems.map((item) =>
              tx.orderItem.create({
                data: {
                  orderId: dados.orderId,
                  productId: item.id,
                  quantity: item.quantity,
                  priceAtTime: item.unit_price, // Assuming unit_price for bumps is in cents here
                  isOrderBump: true,
                  isUpsell: false,
                },
              }),
            ),
          );
        }

        // Atualizar o status da ordem para PENDING_PAYMENT
        await tx.order.update({
          where: { id: dados.orderId },
          data: {
            status: 'PENDING_PAYMENT',
            statusUpdatedAt: new Date(),
            paidAmount: 0, // Garantir que o valor pago seja zerado no início do pagamento
          },
        });

        // Registrar a mudança de status na tabela de histórico (PENDING_PAYMENT)
        await tx.orderStatusHistory.create({
          data: {
            orderId: dados.orderId,
            previousStatus: currentOrderStatus, // Use status fetched within transaction
            newStatus: 'PENDING_PAYMENT',
            notes: 'Pedido aguardando pagamento',
          },
        });

        const paymentRecord = await tx.payment.create({
          data: {
            orderId: dados.orderId,
            status: (resultado.status.toUpperCase() as any) || 'PENDING',
            method: 'pix',
            mercadoPagoId: resultado.id!.toString(), // Non-null assertion as we are inside if(resultado.id)
            amount: Math.round(dados.valorTotal * 100), // Converter para centavos
            rawData: pixSimplificado as any, // Cast if pixSimplificado structure is complex
          },
        });

        // Atualizar o status da ordem para PAYMENT_PROCESSING
        await tx.order.update({
          where: { id: dados.orderId },
          data: {
            status: 'PAYMENT_PROCESSING',
            statusUpdatedAt: new Date(),
          },
        });

        // Registrar a mudança de status na tabela de histórico (PAYMENT_PROCESSING)
        await tx.orderStatusHistory.create({
          data: {
            orderId: dados.orderId,
            previousStatus: 'PENDING_PAYMENT', // Previous status is now PENDING_PAYMENT
            newStatus: 'PAYMENT_PROCESSING',
            notes: 'Pagamento PIX gerado e aguardando confirmação',
          },
        });
        return paymentRecord.id;
      });
      // --- End of Prisma Transaction ---
    }

    // Retornar os dados do PIX para o cliente
    return NextResponse.json({
      id: createdPaymentId, // Use the ID from the transaction
      status: resultado.status,
      qr_code: pixData.qr_code,
      qr_code_base64: pixData.qr_code_base64,
      ticket_url: pixData.ticket_url,
      expiration_date: resultado.date_of_expiration,
    });
  } catch (error) {
    // Exibir erro no console
    console.error('Erro ao processar pagamento PIX:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known Prisma errors (e.g., unique constraint violations)
      return NextResponse.json({ erro: 'Erro de banco de dados ao processar pagamento.', details: error.message }, { status: 500 });
    }
    if (error instanceof Error) {
        return NextResponse.json({ erro: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { erro: 'Erro desconhecido ao processar pagamento PIX' },
      { status: 500 },
    );
  }
}
