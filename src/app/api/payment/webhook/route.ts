// app/api/payment/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment as MPayment } from 'mercadopago';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { broadcastSSE } from '@/lib/sse';
import { trackServerEvent } from '@/lib/tracking/server';

import { webhookRateLimit } from '@/lib/rate-limit';
import { getWebhookService } from '@/modules/webhook';
import { OrderPaidEventHandler } from '@/modules/webhook/events/order-paid.event';
import crypto from 'crypto';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Verificar rate limiting
    const rateLimitResult = await webhookRateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        },
      );
    }

    // 2. Extrair o corpo da requisição
    const bodyText = await request.text();

    // Validação de assinatura removida para simplificar o MVP

    const body = JSON.parse(bodyText);

    // 2. Processa somente created/updated
    if (body.action === 'payment.created' || body.action === 'payment.updated') {
      const paymentId = body.data.id;

      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
      });
      const paymentClient = new MPayment(client);
      const paymentInfo = await paymentClient.get({ id: paymentId });

      const status = paymentInfo.status;
      const paymentMethodId = paymentInfo.payment_method_id;

      // 3. Verificar idempotência - evitar reprocessamento
      const webhookId =
        request.headers.get('x-request-id') || `mp-${paymentId}-${body.action}-${Date.now()}`;

      // Verificar se já processamos este webhook
      const existingWebhook = await prisma.externalWebhookLog
        .findUnique({
          where: { webhookId },
        })
        .catch(() => null);

      if (existingWebhook) {
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      // 4. Registrar webhook recebido (mesmo se falhar depois)
      const webhookLogData = {
        webhookId,
        source: 'mercadopago',
        paymentId: String(paymentId),
        action: body.action,
        payload: JSON.stringify(body),
        headers: JSON.stringify({
          'user-agent': request.headers.get('user-agent'),
          'content-type': request.headers.get('content-type'),
        }),
      };

      // 5. Buscar o pagamento existente no DB
      const payment = await prisma.payment.findFirst({
        where: { mercadoPagoId: String(paymentId) },
        include: {
          order: {
            include: {
              checkout: true,
            },
          },
        },
      });

      if (!payment) {
        // Registrar webhook mesmo se pagamento não encontrado
        await prisma.externalWebhookLog.create({
          data: {
            ...webhookLogData,
            success: false,
            errorMsg: 'Pagamento não encontrado no banco de dados',
          },
        });

        return NextResponse.json({ success: true });
      }

      // 6. Verificar se pagamento já foi processado (status final)
      if (payment.status === 'approved' && status === 'approved') {
        // Registrar webhook duplicado
        await prisma.externalWebhookLog.create({
          data: {
            ...webhookLogData,
            status: status,
            success: true,
            errorMsg: 'Pagamento já estava aprovado - webhook duplicado',
          },
        });

        return NextResponse.json({ success: true, message: 'Payment already approved' });
      }

      // 7. Usar transação para garantir consistência
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Capturar status atual pra histórico
        const currentOrderStatus = payment.order?.status || 'PENDING';

        // Atualizar o registro de pagamento
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: status,
            paidAt:
              status === 'approved' && paymentInfo.date_approved
                ? new Date(paymentInfo.date_approved)
                : status === 'approved'
                  ? new Date()
                  : undefined,
          },
        });

        // Se aprovado, atualizar pedido e histórico
        if (status === 'approved' && (paymentMethodId === 'pix' || true)) {
          // Buscar o pedido completo com os produtos para o evento de compra
          const orderWithItems = await tx.order.findUnique({
            where: { id: payment.orderId },
            include: {
              orderItems: {
                include: {
                  product: true,
                },
              },
              customer: true,
              trackingSession: true,
            },
          });

          await tx.order.update({
            where: { id: payment.orderId },
            data: {
              status: 'PAID',
              statusUpdatedAt: new Date(),
              paidAmount: paymentInfo.transaction_amount,
            },
          });
          await tx.orderStatusHistory.create({
            data: {
              orderId: payment.orderId,
              previousStatus: currentOrderStatus,
              newStatus: 'PAID',
              notes: `Pagamento confirmado via webhook do Mercado Pago (método: ${paymentMethodId})`,
            },
          });
          
          // Disparar evento de compra para o Meta CAPI
          if (orderWithItems && orderWithItems.trackingSession) {
            const eventId = `${orderWithItems.trackingSession.id}_PURCHASE`;
            
            // Função para hash SHA256 para o Meta CAPI
            function hashValue(value: string | undefined | null): string | undefined {
              if (!value) return undefined;
              
              try {
                return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
              } catch (error) {
                console.error('Erro ao gerar hash:', error);
                return undefined;
              }
            }
            
            // Extrair nome e sobrenome do cliente
            const customerName = orderWithItems.customer?.name || '';
            const nameParts = customerName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
            
            // Preparar dados do cliente com hash para advanced matching
            const customerEmail = orderWithItems.customer?.email;
            const customerPhone = orderWithItems.customer?.phone;
            
            // Log para debug dos dados do cliente
            console.log('[PURCHASE EVENT] Dados do cliente:', {
              email: customerEmail,
              phone: customerPhone,
              firstName,
              lastName
            });
            
            // Normalizar dados do cliente antes de enviar para o Meta
            const normalize = {
              // Remove espaços, acentos e converte para minúsculas
              text: (str: string | null | undefined): string => {
                if (!str) return '';
                return str.toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '') // remove acentos
                  .replace(/\s/g, '') // remove espaços
                  .replace(/[^a-z0-9]/g, ''); // remove caracteres especiais
              },
              
              // Formata telefone: só dígitos, começando com 55 (BR)
              phone: (phone: string | null | undefined): string => {
                if (!phone) return '';
                const digits = phone.replace(/[^0-9]/g, '');
                // Adiciona código do país (55) se não existir
                if (digits.length > 0 && !digits.startsWith('55')) {
                  return `55${digits}`;
                }
                return digits;
              },
              
              // Formata país para ISO-3166 minúsculo
              country: (country: string | null | undefined): string => {
                if (!country) return '';
                // Se for Brasil ou Brazil, retorna 'br'
                if (/^bra[sz]il$/i.test(country.trim())) {
                  return 'br';
                }
                return country.toLowerCase().trim().substring(0, 2);
              }
            };
            
            // Preparar dados do cliente com hash para advanced matching
            const normalizedPhone = normalize.phone(customerPhone);
            const normalizedFirstName = normalize.text(firstName);
            const normalizedLastName = normalize.text(lastName);
            const normalizedCountry = normalize.country(orderWithItems.trackingSession.country);
            const normalizedCity = normalize.text(orderWithItems.trackingSession.city);
            const normalizedRegion = normalize.text(orderWithItems.trackingSession.region);
            
            console.log('[PURCHASE EVENT] Dados do cliente normalizados:', {
              email: customerEmail?.toLowerCase(),
              phone: normalizedPhone,
              firstName: normalizedFirstName,
              lastName: normalizedLastName,
              country: normalizedCountry,
              city: normalizedCity,
              region: normalizedRegion
            });
            
            // Preparar dados do evento de compra
            const purchaseEvent = {
              event_name: 'Purchase',
              event_id: eventId,
              event_time: Math.floor(Date.now() / 1000),
              event_source_url: orderWithItems.trackingSession.landingPage || undefined,
              action_source: 'website', // Definir action_source diretamente no objeto principal
              user_data: {
                client_ip_address: orderWithItems.trackingSession.ip || undefined,
                client_user_agent: orderWithItems.trackingSession.userAgent || undefined,
                fbp: orderWithItems.trackingSession.fbp || undefined,
                fbc: orderWithItems.trackingSession.fbc || undefined,
                external_id: hashValue(orderWithItems.trackingSession.id),
                // Dados do cliente para advanced matching com hash SHA256
                em: customerEmail ? hashValue(customerEmail.toLowerCase()) : undefined,
                ph: normalizedPhone ? hashValue(normalizedPhone) : undefined,
                fn: normalizedFirstName ? hashValue(normalizedFirstName) : undefined,
                ln: normalizedLastName ? hashValue(normalizedLastName) : undefined,
                country: normalizedCountry ? hashValue(normalizedCountry) : undefined,
                ct: normalizedCity ? hashValue(normalizedCity) : undefined,
                st: normalizedRegion ? hashValue(normalizedRegion) : undefined,
              },
              custom_data: {
                currency: 'BRL',
                value: Number(paymentInfo.transaction_amount), // Valor monetário obrigatório para Purchase
                content_ids: orderWithItems.orderItems.map((item: { productId: string }) => item.productId),
                content_name: orderWithItems.orderItems.map((item: { product?: { name?: string } }) => item.product?.name || '').join(', '),
                content_type: 'product',
                order_id: orderWithItems.id,
                status: 'completed',
                num_items: orderWithItems.orderItems.length
              },
            };
            
            // Remover campos undefined ou null para evitar erros na API
            const cleanPayload = JSON.parse(JSON.stringify(purchaseEvent));
            
            // Enviar evento para o Meta CAPI
            try {
              await trackServerEvent(cleanPayload, orderWithItems.trackingSession.id);
              console.log(`Evento Purchase enviado para o Meta CAPI: ${eventId}`);
            } catch (error) {
              console.error('Erro ao enviar evento Purchase para o Meta CAPI:', error);
            }
          }

          // Disparar webhook para order.paid após a transação
          setTimeout(async () => {
            try {
              const webhookService = getWebhookService(prisma);
              const orderPaidEventHandler = new OrderPaidEventHandler(prisma);
              const orderPaidEvent = await orderPaidEventHandler.createEvent(payment.orderId);
              await webhookService.dispatchEvent(orderPaidEvent);
            } catch (error) {
              console.error(`Erro ao disparar webhook order.paid: ${error}`);
            }
          }, 100); // Pequeno delay para garantir que a transação foi concluída
        } else if (status === 'rejected') {
          await tx.order.update({
            where: { id: payment.orderId },
            data: {
              status: 'CANCELLED',
              statusUpdatedAt: new Date(),
            },
          });
          await tx.orderStatusHistory.create({
            data: {
              orderId: payment.orderId,
              previousStatus: currentOrderStatus,
              newStatus: 'CANCELLED',
              notes: `Pagamento rejeitado pelo Mercado Pago (método: ${paymentMethodId})`,
            },
          });
        }

        // Registrar webhook com sucesso
        await tx.externalWebhookLog.create({
          data: {
            ...webhookLogData,
            status: status,
            success: true,
          },
        });
      });

      // 8. Broadcast SSE para quem estiver conectado
      try {
        // Buscar o pagamento no banco para obter o ID interno
        console.log('[WEBHOOK] Enviando SSE para clientes:', { 
          paymentId: payment.id,
          status 
        });
        
        // Mapear status do MercadoPago para os status aceitos pelo SSE
        let sseStatus: 'pending' | 'approved' | 'rejected' | 'cancelled';
        switch (status) {
          case 'approved':
            sseStatus = 'approved';
            break;
          case 'rejected':
          case 'in_process':
          case 'in_mediation':
            sseStatus = 'rejected';
            break;
          case 'cancelled':
            sseStatus = 'cancelled';
            break;
          default:
            sseStatus = 'pending';
        }
        
        // Usar o ID interno do pagamento para o broadcast, pois é o que o frontend está usando na URL
        // O frontend usa o ID da URL como transactionId, que é o ID interno do pagamento
        broadcastSSE(payment.id, sseStatus);
        console.log('[WEBHOOK] SSE enviado com sucesso');
      } catch (error) {
        console.error('[WEBHOOK] Erro ao enviar SSE:', error);
      }

      // Pagamento processado com sucesso

      return NextResponse.json({ success: true });
    }

    // Ações não relacionadas continuam retornando OK
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
