import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Wiping all sample data...');

  await prisma.handover.deleteMany({});
  console.log('✓ Deleted all Handovers');

  await prisma.proposalItem.deleteMany({});
  await prisma.proposalInvestment.deleteMany({});
  await prisma.proposal.deleteMany({});
  console.log('✓ Deleted all Proposals');

  await prisma.school.deleteMany({});
  console.log('✓ Deleted all Schools');

  await prisma.item.deleteMany({});
  console.log('✓ Deleted all Items (Thiết bị)');

  await prisma.otherInvestment.deleteMany({});
  console.log('✓ Deleted all OtherInvestments (Đầu tư khác)');

  console.log('\n✅ All sample data wiped. System is clean!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
