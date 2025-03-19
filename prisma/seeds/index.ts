import { PrismaClient } from '@prisma/client';
import { seedAbTests } from './teste-ab';

const prisma = new PrismaClient();

async function main() {
  await seedAbTests();
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });