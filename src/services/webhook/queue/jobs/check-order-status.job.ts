import { Queue } from 'bull';

export function addCheckOrderStatusJob(queue: Queue, orderId: string) {
  return queue.add('cart-reminder', { payload: { data: { id: orderId } } }, {
    delay: 100 * 1000,
    removeOnComplete: true,
    attempts: 1
  });
}
