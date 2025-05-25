// src/actions/payment.ts
'use server';

import { prisma } from '@/lib/prisma';

export async function checkPaymentStatus(paymentId: string) {
  try {
    // Buscar pagamento primeiro pelo ID
    let payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            checkout: true,
          },
        },
      },
    });

    // Se não encontrar pelo ID, tentar pelo mercadoPagoId
    if (!payment) {
      payment = await prisma.payment.findFirst({
        where: { mercadoPagoId: paymentId },
        include: {
          order: {
            include: {
              checkout: true,
            },
          },
        },
      });
    }

    if (!payment) {
      return { error: 'Pagamento não encontrado' };
    }

    // Retornar status do pagamento e URL de upsell
    return {
      status: payment.status,    
    };
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    return { error: 'Erro ao verificar status do pagamento' };
  }
}
