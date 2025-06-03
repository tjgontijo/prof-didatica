import { Job } from 'bull';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { getOrderWebhookOrchestrator } from '../../order/services/order-webhook.service';

interface CartReminderJobData {
  webhook: {
    id: string;
    url: string;
    headers: Record<string, string>;
  };
  payload: {
    event: string;
    data: {
      id: string;
    };
  };
}

export async function cartReminderProcessor(job: Job<CartReminderJobData>) {
  const prisma = new PrismaClient();
  try {
    const orderId = job.data.payload.data.id;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order?.status === OrderStatus.DRAFT) {
      const orchestrator = getOrderWebhookOrchestrator(prisma);
      await orchestrator.dispatchCartReminder(orderId);
      await prisma.$executeRaw`UPDATE "Order" SET status = 'ABANDONED_CART' WHERE id = ${order.id}`;
    }
  } finally {
    await prisma.$disconnect();
  }
}
