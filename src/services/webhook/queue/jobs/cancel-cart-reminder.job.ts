import { Queue } from 'bull';

/**
 * Remove o job de cart-reminder agendado para um determinado pedido.
 * @param queue Queue do Bull
 * @param orderId ID do pedido
 */
export async function cancelCartReminderJob(queue: Queue, orderId: string): Promise<void> {
  const jobs = await queue.getDelayed();
  for (const job of jobs) {
    if (job.data?.payload?.data?.id === orderId) {
      await job.remove();
    }
  }
}
