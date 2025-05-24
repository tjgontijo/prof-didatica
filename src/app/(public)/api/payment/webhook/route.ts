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

      console.log(`Pagamento ${paymentId} com status: ${status}`);
      console.log(`Referência externa: ${externalReference}`);

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

      // Atualizar o status do pagamento
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: status,
          paidAt: status === 'approved' ? new Date() : undefined,
        },
      });

      // Se o pagamento foi aprovado, atualizar o status do pedido
      if (status === 'approved') {
        // Atualizar o status da ordem para PAID
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            status: 'PAID',
            statusUpdatedAt: new Date(),
          },
        });

        // Registrar a mudança de status na tabela de histórico
        await prisma.orderStatusHistory.create({
          data: {
            orderId: payment.orderId,
            previousStatus: 'PAYMENT_PROCESSING',
            newStatus: 'PAID',
            notes: 'Pagamento confirmado via webhook do Mercado Pago',
          },
        });

        console.log(`Pedido ${payment.orderId} atualizado para status PAID`);
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
            previousStatus: 'PAYMENT_PROCESSING',
            newStatus: 'CANCELLED',
            notes: 'Pagamento rejeitado pelo Mercado Pago',
          },
        });

        console.log(`Pedido ${payment.orderId} atualizado para status CANCELLED`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (erro) {
    console.error('Erro ao processar webhook:', erro);
    return NextResponse.json({ success: false });
  }
}
