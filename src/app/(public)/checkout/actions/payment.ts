// src/actions/payment.ts
'use server'

import { prisma } from '@/lib/prisma';

export async function checkPaymentStatus(paymentId: string) {
  try {
    // Buscar pagamento primeiro pelo ID
    let payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            checkout: true
          }
        }
      }
    });

    // Se não encontrar pelo ID, tentar pelo mercadoPagoId
    if (!payment) {
      payment = await prisma.payment.findFirst({
        where: { mercadoPagoId: paymentId },
        include: {
          order: {
            include: {
              checkout: true
            }
          }
        }
      });
    }

    if (!payment) {
      return { error: 'Pagamento não encontrado' };
    }

    // Obter URL de upsell do checkout, se existir
    const upsellPageUrl = payment.order?.checkout?.upsellPageUrl || null;

    // Retornar status do pagamento e URL de upsell
    return {
      status: payment.status,
      upsellPageUrl
    };
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    return { error: 'Erro ao verificar status do pagamento' };
  }
}