const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const items = await prisma.otherInvestment.findMany();
  let count = 0;

  for (const item of items) {
    const nameLower = item.name.toLowerCase();
    const descLower = (item.description || "").toLowerCase();

    if (
      nameLower.includes("thi công") ||
      nameLower.includes("lắp đặt") ||
      nameLower.includes("di dời") ||
      nameLower.includes("tháo gỡ") ||
      nameLower.includes("bảo trì") ||
      nameLower.includes("điện") ||
      descLower.includes("thi công")
    ) {
      await prisma.otherInvestment.update({
        where: { id: item.id },
        data: { category: "CONSTRUCTION" }
      });
      console.log(`[CONSTRUCTION] ${item.name}`);
      count++;
    }
  }

  console.log(`Successfully moved ${count} construction items to CONSTRUCTION category!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
