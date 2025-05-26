import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { Prisma } from '@prisma/client'; // Import Prisma for error types

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const mercadopagoWebhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    const xSignatureHeader = request.headers.get('x-signature');
    const xRequestIdHeader = request.headers.get('x-request-id');
    const dataIdFromQuery = request.nextUrl.searchParams.get('data.id') || request.nextUrl.searchParams.get('id'); // As per some docs, data.id or just id might be used in query

    if (!mercadopagoWebhookSecret) {
      console.error('Webhook verification failed: MERCADOPAGO_WEBHOOK_SECRET not set.');
      return NextResponse.json({ error: 'Webhook configuration error.' }, { status: 500 });
    }

    if (!xSignatureHeader || !xRequestIdHeader) {
      console.warn('Webhook verification failed: Missing x-signature or x-request-id header.');
      return NextResponse.json({ error: 'Missing required headers for signature verification.' }, { status: 400 });
    }

    // Extract ts and hash from x-signature
    let ts: string | undefined;
    let v1: string | undefined;
    const parts = xSignatureHeader.split(',');
    parts.forEach(part => {
      const [key, value] = part.split('=');
      if (key.trim() === 'ts') {
        ts = value.trim();
      } else if (key.trim() === 'v1') {
        v1 = value.trim();
      }
    });

    if (!ts || !v1) {
      console.warn('Webhook verification failed: Could not parse ts or v1 from x-signature header.');
      return NextResponse.json({ error: 'Invalid x-signature header format.' }, { status: 400 });
    }
    
    // The 'data.id' for the manifest string template comes from query parameters according to MP docs
    // For payment notifications, the topic is usually 'payment' and 'id' (or 'data.id') in query refers to the payment ID.
    // The JSON body also has 'body.data.id', which should correspond to this.
    // We use the dataIdFromQuery for constructing the signed payload as per documentation.
    const manifestDataId = dataIdFromQuery;

    if (!manifestDataId) {
        console.warn(`Webhook verification failed: Missing 'data.id' or 'id' from query parameters. Query: ${request.nextUrl.search}`);
        // body.data.id is also available, but docs specify query param for signature.
        // This might indicate a malformed notification URL setup or a different type of webhook.
        return NextResponse.json({ error: "Missing 'data.id' or 'id' in query parameters for signature verification." }, { status: 400 });
    }
    
    // Construct the manifest string
    // Template: id:[data.id_url];request-id:[x-request-id_header];ts:[ts_header];
    // Ensure data.id is lowercase if it's alphanumeric, as per some interpretations of the docs (though usually it's numeric for payments)
    // For safety, let's use it as is from the query, assuming MP sends it correctly.
    const manifest = `id:${manifestDataId};request-id:${xRequestIdHeader};ts:${ts};`;

    const computedSignature = crypto
      .createHmac('sha256', mercadopagoWebhookSecret)
      .update(manifest)
      .digest('hex');

    if (computedSignature !== v1) {
      console.error('Webhook verification failed: Signature mismatch.');
      console.log('Received Signature (v1):', v1);
      console.log('Computed Signature:', computedSignature);
      console.log('Manifest String:', manifest);
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
    }

    console.log('Webhook signature verified successfully.');

    // Proceed with existing logic, now that signature is verified
    const body = await request.json();
    const allHeaders = Object.fromEntries(request.headers.entries()); // For logging if needed

    console.log('--- Webhook Mercado Pago Recebido (Verificado) ---');
    console.log('Headers:', allHeaders);
    // console.log('Assinatura recebida (já verificada):', xSignatureHeader); // No longer just "recebida"
    console.log('Body:', JSON.stringify(body, null, 2));
    console.log('-------------------------------------');


    if (body.action === 'payment.created' || body.action === 'payment.updated') {
      const paymentId = body.data.id; // This should match manifestDataId for payment webhooks
      if (paymentId.toString() !== manifestDataId) {
        // This case should be rare if the webhook is correctly configured and for standard payment events
        console.warn(`Mismatch between body.data.id (${paymentId}) and query param data.id (${manifestDataId}). Proceeding with body.data.id for fetching payment.`);
      }

      console.log('process.env.MERCADOPAGO_ACCESS_TOKEN:', process.env.MERCADOPAGO_ACCESS_TOKEN);
      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
      });

      const paymentClient = new Payment(client);
      const paymentInfo = await paymentClient.get({ id: paymentId });

      const mpPaymentStatus = paymentInfo.status; // Renamed to avoid conflict
      const externalReference = paymentInfo.external_reference;
      const paymentMethodId = paymentInfo.payment_method_id;

      console.log(`Pagamento ${paymentId} com status: ${mpPaymentStatus}`);
      console.log(`Referência externa: ${externalReference}`);
      console.log(`Método de pagamento: ${paymentMethodId}`);

      // --- Start of Prisma Transaction ---
      await prisma.$transaction(async (tx) => {
        // Find the local payment record
        const localPayment = await tx.payment.findFirst({
          where: { mercadoPagoId: paymentId.toString() },
          include: {
            order: { // Include order to get its current status
              select: { status: true, id: true } 
            },
          },
        });

        if (!localPayment) {
          // If payment not found locally, maybe it wasn't created yet or wrong ID.
          // This will rollback the transaction.
          console.error(`Local payment record not found for Mercado Pago ID: ${paymentId}`);
          throw new Error('Pagamento não encontrado no sistema local.');
        }
        
        if (!localPayment.order) {
             console.error(`Order not found for local payment ID: ${localPayment.id}`);
             throw new Error('Pedido associado ao pagamento não encontrado.');
        }

        const currentOrderStatus = localPayment.order.status;
        const orderId = localPayment.order.id;

        // Update the local payment record
        await tx.payment.update({
          where: { id: localPayment.id },
          data: {
            status: mpPaymentStatus as any, // Cast to Prisma's PaymentStatus enum if necessary
            paidAt:
              mpPaymentStatus === 'approved' && paymentInfo.date_approved
                ? new Date(paymentInfo.date_approved)
                : mpPaymentStatus === 'approved'
                  ? new Date()
                  : undefined,
            rawData: JSON.stringify(paymentInfo), // Save complete data
          },
        });

        let newOrderStatus: string | null = null;
        let historyNotes = '';

        if (mpPaymentStatus === 'approved') {
          newOrderStatus = 'PAID';
          historyNotes = `Pagamento confirmado via webhook do Mercado Pago (método: ${paymentMethodId})`;
          await tx.order.update({
            where: { id: orderId },
            data: {
              status: 'PAID',
              statusUpdatedAt: new Date(),
              paidAmount: paymentInfo.transaction_amount, // Ensure this is in cents if your DB stores it as such, or convert
            },
          });
          console.log(`Pedido ${orderId} marcado como PAGO`);
        } else if (mpPaymentStatus === 'rejected' || mpPaymentStatus === 'cancelled') { // Handle 'cancelled' as well
          newOrderStatus = 'CANCELLED';
          historyNotes = `Pagamento ${mpPaymentStatus} pelo Mercado Pago (método: ${paymentMethodId})`;
          await tx.order.update({
            where: { id: orderId },
            data: {
              status: 'CANCELLED',
              statusUpdatedAt: new Date(),
            },
          });
          console.log(`Pedido ${orderId} cancelado devido a pagamento ${mpPaymentStatus}`);
        }
        // Add other statuses like 'refunded', 'in_mediation' if needed

        if (newOrderStatus) {
          await tx.orderStatusHistory.create({
            data: {
              orderId: orderId,
              previousStatus: currentOrderStatus,
              newStatus: newOrderStatus as any, // Cast if necessary
              notes: historyNotes,
            },
          });
        }
      });
      // --- End of Prisma Transaction ---

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true }); // If action is not payment.created or payment.updated
  } catch (error) {
    console.error('Erro ao processar webhook do Mercado Pago:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ success: false, error: 'Database error during webhook processing.', details: error.message }, { status: 500 });
    }
    if (error instanceof Error) {
        return NextResponse.json({ success: false, error: error.message }, { status: (error.message.includes('não encontrado') ? 404 : 500) });
    }
    return NextResponse.json({ success: false, error: 'Erro desconhecido ao processar webhook.' }, { status: 500 });
  }
}
