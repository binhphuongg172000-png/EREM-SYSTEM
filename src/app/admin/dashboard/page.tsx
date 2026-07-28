import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import AdminDashboardClient from "./AdminDashboardClient";
import { getCachedData } from "@/lib/cache";
import { warmAdminSystem } from "@/lib/prewarmer";

export const dynamic = "force-dynamic";

export type SaleStat = {
  id: string;
  name: string;
  username: string;
  schoolCount: number;
  proposalCount: number;
  totalAllocated: number;
  totalInvested: number;
  budgetVariance: number;
};

export type AllocatedSchoolStat = {
  id: string;
  schoolName: string;
  saleName: string;
  newStudents: number;
  allocatedBudget: number;
  investedBudget: number;
  status: string;
};

export type OverdueSchoolStat = {
  id: string;
  proposalId: string;
  schoolName: string;
  saleName: string;
  createdAt: string;
  daysStalled: number;
  allocatedBudget: number;
};

export default async function AdminDashboardPage() {
  const {
    totalSchools,
    totalHandovers,
    budgetAggregate,
    allProposals,
    salesUsers
  } = await getCachedData("admin_dashboard_data", async () => {
    const [
      totalSchools,
      totalHandovers,
      budgetAggregate,
      allProposals,
      salesUsers
    ] = await Promise.all([
      prisma.school.count(),
      prisma.handover.count(),
      prisma.proposal.aggregate({
        _sum: { allocatedBudget: true, investedBudget: true },
      }),
      prisma.proposal.findMany({ include: { school: true, sale: true, items: true, investments: true } }),
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
  }, 15);

  const totalAllocated = Number(budgetAggregate._sum.allocatedBudget || 0);
  const totalInvested = Number(budgetAggregate._sum.investedBudget || 0);
  const usagePercentage = totalAllocated > 0 ? Math.round((totalInvested / totalAllocated) * 100) : 0;
  const remainingBudget = totalAllocated - totalInvested;

  let pendingAllocated = 0, pendingInvested = 0;
  let pendingItemBudget = 0, pendingOtherBudget = 0;
  let completedAllocated = 0, completedInvested = 0;
  let completedItemBudget = 0, completedOtherBudget = 0;

  const pendingSchoolSet = new Set<string>();
  const completedSchoolSet = new Set<string>();

  let draftProposalCount = 0;
  let inProgressProposalCount = 0;
  let completedProposalCount = 0;

  allProposals.forEach(p => {
    const alloc = Number(p.allocatedBudget);
    const inv = Number(p.investedBudget);
    
    let pItemBudget = 0;
    p.items.forEach((item: any) => pItemBudget += Number(item.totalPrice));
    let pOtherBudget = 0;
    p.investments.forEach((invItem: any) => pOtherBudget += Number(invItem.totalPrice));

    if (p.status === "DRAFT") {
      draftProposalCount++;
    } else if (p.status === "PENDING" || p.status === "APPROVED") {
      inProgressProposalCount++;
      pendingAllocated += alloc;
      pendingInvested += inv;
      pendingItemBudget += pItemBudget;
      pendingOtherBudget += pOtherBudget;
      pendingSchoolSet.add(p.schoolId);
    } else if (p.status === "COMPLETED") {
      completedProposalCount++;
      completedAllocated += alloc;
      completedInvested += inv;
      completedItemBudget += pItemBudget;
      completedOtherBudget += pOtherBudget;
      completedSchoolSet.add(p.schoolId);
    }
  });

  const pendingSchoolCount = pendingSchoolSet.size;
  const completedSchoolCount = completedSchoolSet.size;

  const saleLeaderboard: SaleStat[] = salesUsers.map(sale => {
    let proposalCount = 0, totalAllocatedBudget = 0, totalInvestedBudget = 0;

    sale.schools.forEach(school => {
      school.proposals.forEach(p => {
        proposalCount++;
        totalAllocatedBudget += Number(p.allocatedBudget);
        totalInvestedBudget += Number(p.investedBudget);
      });
    });

    return {
      id: sale.id,
      name: sale.name,
      username: sale.username,
      schoolCount: sale.schools.length,
      proposalCount,
      totalAllocated: totalAllocatedBudget,
      totalInvested: totalInvestedBudget,
      budgetVariance: totalAllocatedBudget - totalInvestedBudget,
    };
  }).sort((a, b) => b.totalAllocated - a.totalAllocated);

  const allocatedBreakdown: AllocatedSchoolStat[] = allProposals.map(p => ({
    id: p.id,
    schoolName: p.school?.name || "N/A",
    saleName: p.sale?.name || "N/A",
    newStudents: p.school?.newStudents || 0,
    allocatedBudget: Number(p.allocatedBudget || 0),
    investedBudget: Number(p.investedBudget || 0),
    status: p.status,
  })).sort((a, b) => b.allocatedBudget - a.allocatedBudget);

  // Quá 5 ngày chưa chuyển sang trạng thái đang thực hiện
  const nowTime = new Date().getTime();
  const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

  const overdueProposals: OverdueSchoolStat[] = allProposals
    .filter(p => {
      if (p.status === "COMPLETED" || p.status === "APPROVED") return false;
      const createdTime = new Date(p.createdAt).getTime();
      return (nowTime - createdTime) >= FIVE_DAYS_MS;
    })
    .map(p => {
      const createdTime = new Date(p.createdAt).getTime();
      const daysStalled = Math.floor((nowTime - createdTime) / (24 * 60 * 60 * 1000));
      return {
        id: p.schoolId,
        proposalId: p.id,
        schoolName: p.school?.name || "N/A",
        saleName: p.sale?.name || "N/A",
        createdAt: new Date(p.createdAt).toLocaleDateString("vi-VN"),
        daysStalled,
        allocatedBudget: Number(p.allocatedBudget || 0),
      };
    })
    .sort((a, b) => b.daysStalled - a.daysStalled);

  return (
    <AdminDashboardClient
      totalSchools={totalSchools}
      totalHandovers={totalHandovers}
      totalAllocated={totalAllocated}
      totalInvested={totalInvested}
      usagePercentage={usagePercentage}
      remainingBudget={remainingBudget}
      pendingAllocated={pendingAllocated}
      pendingInvested={pendingInvested}
      pendingItemBudget={pendingItemBudget}
      pendingOtherBudget={pendingOtherBudget}
      pendingSchoolCount={pendingSchoolCount}
      completedAllocated={completedAllocated}
      completedInvested={completedInvested}
      completedItemBudget={completedItemBudget}
      completedOtherBudget={completedOtherBudget}
      completedSchoolCount={completedSchoolCount}
      draftProposalCount={draftProposalCount}
      inProgressProposalCount={inProgressProposalCount}
      completedProposalCount={completedProposalCount}
      saleLeaderboard={saleLeaderboard}
      allocatedBreakdown={allocatedBreakdown}
      overdueProposals={overdueProposals}
    />
  );
}
