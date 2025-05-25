import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const signature = request.headers.get('x-signature') || request.headers.get('x-hook-secret');
    const allHeaders = Object.fromEntries(request.headers.entries());

    const body = await request.json();

    console.log('--- Webhook Mercado Pago Recebido ---');
    console.log('Headers:', allHeaders);
    console.log('Assinatura recebida:', signature);
    console.log('Body:', JSON.stringify(body, null, 2));
    console.log('-------------------------------------');

    if (body.action === 'payment.created' || body.action === 'payment.updated') {
      const paymentId = body.data.id;

      console.log('process.env.MERCADOPAGO_ACCESS_TOKEN:', process.env.MERCADOPAGO_ACCESS_TOKEN);
      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
      });

      const paymentClient = new Payment(client);
      const paymentInfo = await paymentClient.get({ id: paymentId });

      const status = paymentInfo.status;
      const externalReference = paymentInfo.external_reference;
      const paymentMethodId = paymentInfo.payment_method_id;

      console.log(`Pagamento ${paymentId} com status: ${status}`);
      console.log(`Referência externa: ${externalReference}`);
      console.log(`Método de pagamento: ${paymentMethodId}`);

      // Atualizar o registro de pagamento no banco de dados
      const payment = await prisma.payment.findFirst({
        where: { mercadoPagoId: paymentId.toString() },
        include: {
          order: {
            include: {
              checkout: true,
            },
          },
        },
      });

      if (!payment) {
        console.log(`Pagamento com ID ${paymentId} não encontrado no banco de dados`);
        return NextResponse.json({ success: false, error: 'Pagamento não encontrado' });
      }

      // Obter o status atual do pedido para o histórico
      const currentOrderStatus = payment.order?.status || 'PAYMENT_PROCESSING';

      // Atualizar o status do pagamento
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: status,
          paidAt:
            status === 'approved' && paymentInfo.date_approved
              ? new Date(paymentInfo.date_approved)
              : status === 'approved'
                ? new Date()
                : undefined,
          rawData: JSON.stringify(paymentInfo), // Salvar dados completos
        },
      });

      // Se o pagamento foi aprovado E o método é PIX, atualizar o status do pedido
      if (status === 'approved' && (paymentMethodId === 'pix' || true)) {
        // Temporariamente aceitando qualquer método
        // Atualizar o status da ordem para PAID
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            status: 'PAID',
            statusUpdatedAt: new Date(),
            paidAmount: paymentInfo.transaction_amount,
          },
        });

        // Registrar a mudança de status na tabela de histórico
        await prisma.orderStatusHistory.create({
          data: {
            orderId: payment.orderId,
            previousStatus: currentOrderStatus,
            newStatus: 'PAID',
            notes: `Pagamento confirmado via webhook do Mercado Pago (método: ${paymentMethodId})`,
          },
        });

        console.log(`Pedido ${payment.orderId} marcado como PAGO`);
      } else if (status === 'rejected') {
        // Atualizar o status da ordem para CANCELLED
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            status: 'CANCELLED',
            statusUpdatedAt: new Date(),
          },
        });

        // Registrar a mudança de status
        await prisma.orderStatusHistory.create({
          data: {
            orderId: payment.orderId,
            previousStatus: currentOrderStatus,
            newStatus: 'CANCELLED',
            notes: `Pagamento rejeitado pelo Mercado Pago (método: ${paymentMethodId})`,
          },
        });

        console.log(`Pedido ${payment.orderId} cancelado devido a pagamento rejeitado`);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao processar webhook do Mercado Pago:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
