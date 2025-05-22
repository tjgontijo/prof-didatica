import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

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

      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
      });

      const paymentClient = new Payment(client);
      const paymentInfo = await paymentClient.get({ id: paymentId });

      const status = paymentInfo.status;
      const externalReference = paymentInfo.external_reference;

      console.log(`Pagamento ${paymentId} com status: ${status}`);
      console.log(`Referência externa: ${externalReference}`);

      switch (status) {
        case 'approved':
          // Pagamento aprovado - liberar acesso ao produto
          break;
        case 'pending':
          // Pagamento pendente - aguardar confirmação
          break;
        case 'rejected':
          // Pagamento rejeitado - notificar cliente
          break;
        default:
          // Outros status
          break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (erro) {
    console.error('Erro ao processar webhook:', erro);
    return NextResponse.json({ success: false });
  }
}
