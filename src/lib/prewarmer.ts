import prisma from "@/lib/prisma";
import { getCachedData } from "@/lib/cache";

export async function warmAdminSystem() {
  Promise.all([
    // Admin Schools
    getCachedData("admin_schools__all", async () => {
      const [sales, schools] = await Promise.all([
        prisma.user.findMany({
          where: { role: "SALE" },
          select: { id: true, name: true },
          orderBy: { name: "asc" }
        }),
        prisma.school.findMany({
          include: { sale: true },
          orderBy: { createdAt: "desc" },
        })
      ]);
      return { sales, schools };
    }, 60),

    // Admin Items
    getCachedData("admin_items_", async () => {
      return prisma.item.findMany({
        orderBy: { createdAt: "desc" },
      });
    }, 60),

    // Admin Investments
    getCachedData("admin_investments_", async () => {
      return prisma.otherInvestment.findMany({
        orderBy: { createdAt: "desc" }
      });
    }, 60),

    // Admin Users
    getCachedData("admin_users_", async () => {
      return prisma.user.findMany({
        orderBy: { createdAt: "desc" },
      });
    }, 60),

    // Admin Proposals
    getCachedData("admin_proposals___", async () => {
      const [sales, rawProposals] = await Promise.all([
        prisma.user.findMany({
          where: { role: "SALE" },
          select: { id: true, name: true, username: true },
          orderBy: { name: "asc" },
        }),
        prisma.proposal.findMany({
          include: { school: true, sale: true },
          orderBy: { createdAt: "desc" },
        })
      ]);
      return { currentUser: null, sales, rawProposals };
    }, 60),
  ]).catch(() => {});
}

export async function warmSaleSystem(userId: string) {
  Promise.all([
    // Sale New Proposal Catalog
    getCachedData(`sale_new_proposal_${userId}`, async () => {
      const [rawSchools, catalogItems, catalogInvestments] = await Promise.all([
        prisma.school.findMany({
          where: { saleId: userId },
          include: {
            proposals: {
              orderBy: { updatedAt: "desc" },
              take: 1,
              include: {
                items: true,
                investments: true,
              }
            }
          }
        }),
        prisma.item.findMany({
          select: { id: true, name: true, specifications: true, standardPrice: true, unit: true }
        }),
        prisma.otherInvestment.findMany({
          select: { id: true, name: true, description: true, standardPrice: true, unit: true }
        })
      ]);
      return { rawSchools, catalogItems, catalogInvestments };
    }, 60),

    // Sale Proposals List
    getCachedData(`sale_proposals_${userId}`, async () => {
      return prisma.proposal.findMany({
        where: { saleId: userId },
        include: { school: true },
        orderBy: { createdAt: "desc" },
      });
    }, 60),

    // Sale Handovers List
    getCachedData(`sale_handovers_${userId}`, async () => {
      return prisma.handover.findMany({
        where: { proposal: { saleId: userId } },
        include: { school: true, proposal: true },
        orderBy: { createdAt: "desc" },
      });
    }, 60),
  ]).catch(() => {});
}
