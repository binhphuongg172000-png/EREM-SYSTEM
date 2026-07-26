const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('PRISMA CONNECTED SUCCESSFULLY!', result);
  } catch (err) {
    console.error('PRISMA ERROR CODE:', err.code);
    console.error('PRISMA ERROR MESSAGE:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
