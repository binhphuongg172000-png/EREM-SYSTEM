const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const items = await prisma.otherInvestment.findMany();
  let constrCount = 0;
  let invCount = 0;

  for (const item of items) {
    const name = item.name.trim();

    if (
      name.startsWith("Gói thi công") ||
      name.startsWith("Gói bảo trì") ||
      name.startsWith("Gói hệ thống")
    ) {
      await prisma.otherInvestment.update({
        where: { id: item.id },
        data: { category: "CONSTRUCTION" }
      });
      console.log(`[CONSTRUCTION] ${item.name}`);
      constrCount++;
    } else {
      await prisma.otherInvestment.update({
        where: { id: item.id },
        data: { category: "INVESTMENT" }
      });
      console.log(`[INVESTMENT] ${item.name}`);
      invCount++;
    }
  }

  console.log(`DONE: ${constrCount} construction packages in CONSTRUCTION, ${invCount} items in INVESTMENT.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
