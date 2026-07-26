import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const schools = await prisma.school.findMany({
    include: { proposals: { orderBy: { createdAt: "desc" } } }
  });

  for (const school of schools) {
    if (school.proposals.length > 1) {
      const [latest, ...older] = school.proposals;
      for (const old of older) {
        if (old.status !== "CLOSED") {
          await prisma.proposal.update({
            where: { id: old.id },
            data: { status: "CLOSED" }
          });
          console.log(`Updated proposal ${old.id} to CLOSED`);
        }
      }
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
