import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.school.updateMany({
    data: { oldStudents: 0, newStudents: 0, investedClassrooms: 0 }
  });
  console.log(`✅ Đã reset HS cũ, HS mới, Số phòng của ${result.count} trường về 0`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
