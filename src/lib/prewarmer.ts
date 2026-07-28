import prisma from "@/lib/prisma";
import { getCachedData } from "@/lib/cache";

export async function warmAdminSystem() {
  Promise.all([
    // Admin Dashboard
    getCachedData("admin_dashboard_data_v3", async () => {
      const [
        totalSchools,
        totalHandovers,
        rawAllProposals,
        salesUsers
      ] = await Promise.all([
        prisma.school.count(),
        prisma.handover.count(),
        prisma.proposal.findMany({ 
          include: { school: true, sale: true, items: true, investments: true },
          orderBy: { updatedAt: "desc" }
        }),
        prisma.user.findMany({
          where: { role: "SALE" },
          include: {
            schools: {
              include: {
                proposals: {
                  select: { id: true, allocatedBudget: true, investedBudget: true, status: true },
                  orderBy: { updatedAt: "desc" },
                  take: 1
                },
              },
            },
          },
        }),
      ]);
      return { totalSchools, totalHandovers, rawAllProposals, salesUsers };
    }, 60),

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

    // Admin Proposals
    getCachedData("admin_all_proposals_data", async () => {
      const [sales, rawProposals] = await Promise.all([
        prisma.user.findMany({
          where: { role: "SALE" },
          select: { id: true, name: true, username: true },
          orderBy: { name: "asc" },
        }),
        prisma.proposal.findMany({
          include: {
            school: true,
            sale: true,
          },
          orderBy: { createdAt: "desc" },
        })
      ]);
      const cleanProposals = JSON.parse(JSON.stringify(rawProposals));
      return { sales, rawProposals: cleanProposals };
    }, 60),
  ]).catch(() => {});
}

export async function warmSaleSystem(userId: string) {
  Promise.all([
    // Sale Dashboard
    getCachedData(`sale_dashboard_data_v3_${userId}`, async () => {
      const [schools, catalogInvestments] = await Promise.all([
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
        prisma.otherInvestment.findMany({ select: { name: true, category: true } })
      ]);
      return { schools, catalogInvestments };
    }, 60),

    // Sale Proposals List
    getCachedData(`sale_proposals_list_${userId}`, async () => {
      const res = await prisma.proposal.findMany({
        where: {
          school: {
            saleId: userId,
          },
        },
        include: {
          school: true,
          items: true,
          investments: true,
        },
        orderBy: { updatedAt: "desc" },
      });
      return JSON.parse(JSON.stringify(res));
    }, 60),
  ]).catch(() => {});
}
