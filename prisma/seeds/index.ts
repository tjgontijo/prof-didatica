import { PrismaClient } from '@prisma/client';
import { initialProducts } from './seed-products';
import { seedCheckouts } from './seed-checkouts';
import { seedOrderBumps } from './seed-orderbumps';



import logger from '@/lib/logger';

const prisma = new PrismaClient();

async function cleanDatabase() {
  await prisma.product.deleteMany();
}

async function createInitialData() {
  logger.info('Cleaning database...');
  await cleanDatabase();
  logger.info('Database cleaned.');

  try {  

    await prisma.product.createMany({ data: initialProducts });
    logger.info('Products created');

    
    await seedCheckouts(prisma);
    await seedOrderBumps(prisma);

    
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error during seed creation: ${error.message}`);
    } else {
      logger.error(`Unknown error during seed creation: ${String(error)}`);
    }
    throw error; // Garante que o erro será propagado
  }
}

createInitialData()
  .catch((error) => {
    if (error instanceof Error) {
      logger.error(`Seed failed: ${error.message}`);
    } else {
      logger.error(`Unknown seed failure: ${String(error)}`);
    }
  })
  .finally(() => {
    prisma.$disconnect();
    logger.info('Prisma client disconnected.');
  });
