import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import AdminDashboardClient from "./AdminDashboardClient";
import { getCachedData } from "@/lib/cache";
import { warmAdminSystem } from "@/lib/prewarmer";

export const dynamic = "force-dynamic";

export type SaleSchoolDetail = {
  id: string;
  proposalId?: string;
  schoolName: string;
  studentsCount: number;
  allocatedBudget: number;
  investedBudget: number;
  itemBudget: number;
  otherBudget: number;
  constructionBudget: number;
  variance: number;
  status: string;
};

export type SaleStat = {
  id: string;
  name: string;
  username: string;
  schoolCount: number;
  proposalCount: number;
  totalStudents: number;
  totalAllocated: number;
  totalInvested: number;
  totalItemBudget: number;
  totalOtherBudget: number;
  totalConstructionBudget: number;
  budgetVariance: number;
  schools: SaleSchoolDetail[];
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
  const { totalSchools, totalHandovers, rawAllProposals, salesUsers } = await getCachedData(
    "admin_dashboard_data_v3",
    async () => {
      const [
        totalSchools,
        totalHandovers,
        rawAllProposals,
        salesUsers
      ] = await Promise.all([
        prisma.school.count(),
        prisma.handover.count(),
        prisma.proposal.findMany({ 
          select: {
            id: true,
            schoolId: true,
            saleId: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            allocatedBudget: true,
            investedBudget: true,
            school: { select: { id: true, name: true, newStudents: true, isLocked: true } },
            sale: { select: { id: true, name: true, username: true } },
            items: { select: { totalPrice: true } },
            investments: { select: { name: true, description: true, totalPrice: true } },
          },
          orderBy: { updatedAt: "desc" }
        }),
        prisma.user.findMany({
          where: { role: "SALE" },
          select: {
            id: true,
            name: true,
            username: true,
            schools: {
              select: {
                id: true,
                name: true,
                newStudents: true,
              }
            }
          }
        }),
      ]);
      return { totalSchools, totalHandovers, rawAllProposals, salesUsers };
    },
    30,
    ["admin_dashboard"]
  );

  // Business rule: Deduplicate proposals so each school only counts its 1 latest proposal
  const latestProposalsMap = new Map<string, typeof rawAllProposals[0]>();
  for (const p of rawAllProposals) {
    if (p.schoolId && !latestProposalsMap.has(p.schoolId)) {
      latestProposalsMap.set(p.schoolId, p);
    }
  }
  const allProposals = Array.from(latestProposalsMap.values());

  // Calculate live real-time budget totals across all unique school latest proposals
  let totalAllocated = 0;
  let totalInvested = 0;
  allProposals.forEach(p => {
    totalAllocated += Number(p.allocatedBudget || 0);
    totalInvested += Number(p.investedBudget || 0);
  });

  const usagePercentage = totalAllocated > 0 ? Math.round((totalInvested / totalAllocated) * 100) : 0;
  const remainingBudget = totalAllocated - totalInvested;

  let pendingAllocated = 0, pendingInvested = 0;
  let pendingItemBudget = 0, pendingOtherBudget = 0, pendingConstructionBudget = 0;
  let completedAllocated = 0, completedInvested = 0;
  let completedItemBudget = 0, completedOtherBudget = 0, completedConstructionBudget = 0;

  const pendingSchoolSet = new Set<string>();
  const completedSchoolSet = new Set<string>();

  let draftProposalCount = 0;
  let inProgressProposalCount = 0;
  let completedProposalCount = 0;

  const isConstructionItemName = (name: string) => {
    const lower = (name || "").toLowerCase();
    return lower.startsWith("gói thi công") || lower.startsWith("gói bảo trì") || lower.startsWith("gói hệ thống");
  };

  allProposals.forEach(p => {
    const alloc = Number(p.allocatedBudget || 0);
    const inv = Number(p.investedBudget || 0);
    
    let pItemBudget = 0;
    p.items.forEach((item: any) => pItemBudget += Number(item.totalPrice || 0));
    let pOtherBudget = 0;
    let pConstrBudget = 0;
    p.investments.forEach((invItem: any) => {
      if (isConstructionItemName(invItem.name)) {
        pConstrBudget += Number(invItem.totalPrice || 0);
      } else {
        pOtherBudget += Number(invItem.totalPrice || 0);
      }
    });

    if (p.status === "DRAFT") {
      draftProposalCount++;
    } else if (p.status === "PENDING" || p.status === "APPROVED") {
      inProgressProposalCount++;
    } else if (p.status === "COMPLETED") {
      completedProposalCount++;
      completedAllocated += alloc;
      completedInvested += inv;
      completedItemBudget += pItemBudget;
      completedOtherBudget += pOtherBudget;
      completedConstructionBudget += pConstrBudget;
      completedSchoolSet.add(p.schoolId);
    }

    // TÍNH TỔNG BẤT KỂ TRẠNG THÁI DỰ TRÙ (DRAFT, PENDING, APPROVED, COMPLETED)
    pendingAllocated += alloc;
    pendingInvested += inv;
    pendingItemBudget += pItemBudget;
    pendingOtherBudget += pOtherBudget;
    pendingConstructionBudget += pConstrBudget;
    pendingSchoolSet.add(p.schoolId);
  });

  const pendingSchoolCount = pendingSchoolSet.size;
  const completedSchoolCount = completedSchoolSet.size;

  const proposalMapBySchool = new Map<string, any>();
  allProposals.forEach(p => {
    if (p.schoolId) proposalMapBySchool.set(p.schoolId, p);
  });

  const saleLeaderboard: SaleStat[] = salesUsers.map(sale => {
    let proposalCount = 0;
    let totalAllocatedBudget = 0;
    let totalInvestedBudget = 0;
    let totalItemBudget = 0;
    let totalOtherBudget = 0;
    let totalConstructionBudget = 0;
    let totalStudents = 0;

    const schoolsDetail: SaleSchoolDetail[] = [];

    sale.schools.forEach(school => {
      const p = proposalMapBySchool.get(school.id);
      let allocated = 0;
      let invested = 0;
      let itemB = 0;
      let otherB = 0;
      let constructionB = 0;
      let status = "NONE";
      let proposalId = undefined;
      const students = school.newStudents || 0;

      totalStudents += students;

      if (p) {
        proposalCount++;
        proposalId = p.id;
        status = p.status;
        allocated = Number(p.allocatedBudget || 0);
        invested = Number(p.investedBudget || 0);

        p.items?.forEach((item: any) => itemB += Number(item.totalPrice || 0));
        
        p.investments?.forEach((invItem: any) => {
          const invPrice = Number(invItem.totalPrice || 0);
          const nameLower = (invItem.name || "").toLowerCase();
          const descLower = (invItem.description || "").toLowerCase();

          if (nameLower.includes("thi công") || nameLower.includes("lắp đặt") || nameLower.includes("xây dựng") || descLower.includes("thi công")) {
            constructionB += invPrice;
          } else {
            otherB += invPrice;
          }
        });

        totalAllocatedBudget += allocated;
        totalInvestedBudget += invested;
        totalItemBudget += itemB;
        totalOtherBudget += otherB;
        totalConstructionBudget += constructionB;
      }

      schoolsDetail.push({
        id: school.id,
        proposalId,
        schoolName: school.name,
        studentsCount: students,
        allocatedBudget: allocated,
        investedBudget: invested,
        itemBudget: itemB,
        otherBudget: otherB,
        constructionBudget: constructionB,
        variance: allocated - invested,
        status
      });
    });

    return {
      id: sale.id,
      name: sale.name,
      username: sale.username,
      schoolCount: sale.schools.length,
      proposalCount,
      totalStudents,
      totalAllocated: totalAllocatedBudget,
      totalInvested: totalInvestedBudget,
      totalItemBudget,
      totalOtherBudget,
      totalConstructionBudget,
      budgetVariance: totalAllocatedBudget - totalInvestedBudget,
      schools: schoolsDetail.sort((a, b) => a.variance - b.variance)
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
      pendingConstructionBudget={pendingConstructionBudget}
      pendingSchoolCount={pendingSchoolCount}
      completedAllocated={completedAllocated}
      completedInvested={completedInvested}
      completedItemBudget={completedItemBudget}
      completedOtherBudget={completedOtherBudget}
      completedConstructionBudget={completedConstructionBudget}
      completedSchoolCount={completedSchoolCount}
      draftProposalCount={draftProposalCount}
      inProgressProposalCount={inProgressProposalCount}
      completedProposalCount={completedProposalCount}
      allProposalsCount={allProposals.length}
      saleLeaderboard={saleLeaderboard}
      allocatedBreakdown={allocatedBreakdown}
      overdueProposals={overdueProposals}
    />
  );
}
