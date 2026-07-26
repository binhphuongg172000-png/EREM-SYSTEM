import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import AdminDashboardClient from "./AdminDashboardClient";

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

export default async function AdminDashboardPage() {
  // 1. Overall counts
  const totalSchools = await prisma.school.count();
  const totalHandovers = await prisma.handover.count();

  // 2. Budget aggregates
  const budgetAggregate = await prisma.proposal.aggregate({
    _sum: { allocatedBudget: true, investedBudget: true },
  });
  const totalAllocated = Number(budgetAggregate._sum.allocatedBudget || 0);
  const totalInvested = Number(budgetAggregate._sum.investedBudget || 0);
  const usagePercentage = totalAllocated > 0 ? Math.round((totalInvested / totalAllocated) * 100) : 0;
  const remainingBudget = totalAllocated - totalInvested;

  // 3. Bucket proposals by status
  const allProposals = await prisma.proposal.findMany({ include: { school: true } });

  let pendingCount = 0, pendingAllocated = 0, pendingInvested = 0;
  let completedCount = 0, completedAllocated = 0, completedInvested = 0;

  allProposals.forEach(p => {
    const alloc = Number(p.allocatedBudget);
    const inv = Number(p.investedBudget);

    if (p.status === "COMPLETED") {
      completedCount++;
      completedAllocated += alloc;
      completedInvested += inv;
    } else if (p.status === "PENDING") {
      pendingCount++;
      pendingAllocated += alloc;
      pendingInvested += inv;
    }
  });

  // 4. Sale leaderboard
  const salesUsers = await prisma.user.findMany({
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
  });

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

  return (
    <AdminDashboardClient
      totalSchools={totalSchools}
      totalHandovers={totalHandovers}
      totalAllocated={totalAllocated}
      totalInvested={totalInvested}
      usagePercentage={usagePercentage}
      remainingBudget={remainingBudget}
      pendingCount={pendingCount}
      pendingAllocated={pendingAllocated}
      pendingInvested={pendingInvested}
      completedCount={completedCount}
      completedAllocated={completedAllocated}
      completedInvested={completedInvested}
      saleLeaderboard={saleLeaderboard}
    />
  );
}
