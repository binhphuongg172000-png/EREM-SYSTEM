import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCachedData } from "@/lib/cache";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { role, userId } = body;

  try {
    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      // Warm admin dashboard cache in the background
      await Promise.all([
        getCachedData("admin_dashboard_data", async () => {
          const [totalSchools, totalHandovers, budgetAggregate, allProposals, salesUsers] =
            await Promise.all([
              prisma.school.count(),
              prisma.handover.count(),
              prisma.proposal.aggregate({
                _sum: { allocatedBudget: true, investedBudget: true },
              }),
              prisma.proposal.findMany({
                include: { school: true, sale: true, items: true, investments: true },
              }),
              prisma.user.findMany({
                where: { role: "SALE" },
                include: {
                  schools: {
                    include: {
                      proposals: {
                        select: { id: true, allocatedBudget: true, investedBudget: true, status: true },
                      },
                    },
                  },
                },
              }),
            ]);
          return { totalSchools, totalHandovers, budgetAggregate, allProposals, salesUsers };
        }, 60, ["admin_dashboard"]),

        getCachedData("admin_schools__all", async () => {
          const [sales, schools] = await Promise.all([
            prisma.user.findMany({
              where: { role: "SALE" },
              select: { id: true, name: true },
              orderBy: { name: "asc" },
            }),
            prisma.school.findMany({
              include: { sale: true },
              orderBy: { createdAt: "desc" },
            }),
          ]);
          return { sales, schools };
        }, 60, ["admin_schools"]),

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
            }),
          ]);
          return { currentUser: null, sales, rawProposals };
        }, 60, ["admin_proposals"]),
      ]).catch(() => {});
    } else if (role === "SALE" && userId) {
      await Promise.all([
        getCachedData(`sale_dashboard_${userId}`, async () => {
          const schools = await prisma.school.findMany({
            where: { saleId: userId },
            include: {
              proposals: {
                orderBy: { updatedAt: "desc" },
                take: 1,
              },
            },
          });
          const proposals = schools
            .map((s) => (s.proposals[0] ? { ...s.proposals[0], school: s } : null))
            .filter(Boolean) as any[];

          let initCount = 0, lockedCount = 0, completedCount = 0;
          let totalAllocated = 0, totalInvested = 0;
          const schoolBudgets: any[] = [];

          proposals.forEach((p) => {
            const allocated = Number(p.allocatedBudget);
            const invested = Number(p.investedBudget);
            totalAllocated += allocated;
            totalInvested += invested;
            if (p.status === "COMPLETED") completedCount++;
            else if (p.school?.isLocked || p.status === "APPROVED") lockedCount++;
            else initCount++;
            schoolBudgets.push({ name: p.school.name, allocated, invested, delta: allocated - invested });
          });

          const delta = totalAllocated - totalInvested;
          return {
            totalSchools: schools.length,
            totalProposals: proposals.length,
            initCount, lockedCount, completedCount,
            totalAllocated, totalInvested, delta,
            negativeSchools: proposals.filter((p) => Number(p.allocatedBudget) < Number(p.investedBudget)),
            positiveSchools: proposals.filter((p) => Number(p.allocatedBudget) >= Number(p.investedBudget)),
            schoolBudgets,
          };
        }, 60, [`sale_dashboard_${userId}`]),

        getCachedData(`sale_proposals_${userId}`, async () => {
          return prisma.proposal.findMany({
            where: { saleId: userId },
            include: { school: true },
            orderBy: { createdAt: "desc" },
          });
        }, 60, [`sale_proposals_${userId}`]),
      ]).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
