import { PrismaClient } from '@prisma/client';
import { initialProducts } from './seed-products';
import { seedCheckouts } from './seed-checkouts';
import { seedOrderBumps } from './seed-orderbumps';
import { initialWebhooks } from './seed-webhooks';

import logger from '@/lib/logger';

const prisma = new PrismaClient();

async function cleanDatabase() {
  // Não limpar webhooks para não perder as configurações em produção
  await prisma.product.deleteMany();
  await prisma.checkout.deleteMany();
  await prisma.orderBump.deleteMany();
  await prisma.webhookLog.deleteMany(); // Limpar logs, mas manter os webhooks
}

async function createInitialData() {
  await cleanDatabase();
  logger.info('Database cleaned.');

  try {  
    // Criar produtos
    await prisma.product.createMany({ data: initialProducts });
    logger.info('✅ Products created');

    
    // Criar checkouts
    await seedCheckouts(prisma);
    logger.info('✅ Checkouts created');

    // Criar order bumps
    await seedOrderBumps(prisma);
    logger.info('✅ OrderBumps created');
    
    // Criar webhooks
    await prisma.webhook.createMany({ data: initialWebhooks });    
    logger.info('✅ Webhooks created');
    
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`❌ Error during seed creation: ${error.message}`);
    } else {
      logger.error(`❌ Unknown error during seed creation: ${String(error)}`);
    }
    throw error; // Garante que o erro será propagado
  }
}

createInitialData()
  .catch((error) => {
    if (error instanceof Error) {
      logger.error(`❌ Seed failed: ${error.message}`);
    } else {
      logger.error(`❌ Unknown seed failure: ${String(error)}`);
    }
  })
  .finally(() => {
    prisma.$disconnect();
    logger.info('Prisma client disconnected.');
  });
