import React from "react";
import prisma from "@/lib/prisma";
import ProjectCostDashboard, { ProjectCostStat, SaleCostStat, SaleProjectDetail } from "./ProjectCostDashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const rawAllProposals = await prisma.proposal.findMany({
    select: {
      id: true,
      schoolId: true,
      projectName: true,
      status: true,
      newStudents: true,
      allocatedBudget: true,
      investedBudget: true,
      school: { 
        select: { 
          id: true, 
          name: true, 
          newStudents: true,
          saleId: true,
          sale: { select: { id: true, name: true, email: true } } 
        } 
      },
      items: { select: { totalPrice: true } },
      investments: { select: { name: true, description: true, totalPrice: true } },
    },
    orderBy: { updatedAt: "desc" }
  });

  const saleUsers = await prisma.user.findMany({
    where: { role: "SALE" },
    select: { id: true, name: true, email: true }
  });

  const isConstructionItemName = (name: string) => {
    const lower = (name || "").toLowerCase();
    return lower.includes("thi công") || lower.includes("bảo trì") || lower.includes("hệ thống");
  };

  // Deduplicate proposals so each school counts its latest proposal
  const latestProposalsMap = new Map<string, typeof rawAllProposals[0]>();
  for (const p of rawAllProposals) {
    if (p.schoolId && !latestProposalsMap.has(p.schoolId)) {
      latestProposalsMap.set(p.schoolId, p);
    }
  }
  const allProposals = Array.from(latestProposalsMap.values());

  const PROJECT_CONFIGS: Array<{
    key: "IPRO" | "ICLASS" | "IGEN" | "ILINK";
    name: string;
    color: string;
    bg: string;
    border: string;
    badgeBg: string;
  }> = [
    { key: "IPRO", name: "IPRO", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.12)", border: "rgba(56, 189, 248, 0.3)", badgeBg: "rgba(56, 189, 248, 0.2)" },
    { key: "ICLASS", name: "ICLASS", color: "#c084fc", bg: "rgba(168, 85, 247, 0.12)", border: "rgba(168, 85, 247, 0.3)", badgeBg: "rgba(168, 85, 247, 0.2)" },
    { key: "IGEN", name: "IGEN", color: "#fbbf24", bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.3)", badgeBg: "rgba(245, 158, 11, 0.2)" },
    { key: "ILINK", name: "ILINK", color: "#34d399", bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.3)", badgeBg: "rgba(16, 185, 129, 0.2)" },
  ];

  // 1. Projects Breakdown
  const projectsData: ProjectCostStat[] = PROJECT_CONFIGS.map(cfg => {
    const projProposals = allProposals.filter(p => (p.projectName || "IPRO") === cfg.key);
    const schoolSet = new Set<string>();

    let totalAllocated = 0;
    let totalInvested = 0;
    let studentCount = 0;
    let itemCost = 0;
    let otherCost = 0;
    let constrCost = 0;

    projProposals.forEach(p => {
      schoolSet.add(p.schoolId);
      const alloc = Number(p.allocatedBudget || 0);
      const inv = Number(p.investedBudget || 0);
      const st = Number(p.newStudents || p.school?.newStudents || 0);

      totalAllocated += alloc;
      totalInvested += inv;
      studentCount += st;

      p.items.forEach(i => {
        itemCost += Number(i.totalPrice || 0);
      });

      p.investments.forEach(invItem => {
        const price = Number(invItem.totalPrice || 0);
        if (isConstructionItemName(invItem.name)) {
          constrCost += price;
        } else {
          otherCost += price;
        }
      });
    });

    const delta = totalAllocated - totalInvested;
    const usagePercentage = totalAllocated > 0 ? Math.round((totalInvested / totalAllocated) * 100) : 0;

    return {
      projectKey: cfg.key,
      projectName: cfg.name,
      color: cfg.color,
      bg: cfg.bg,
      border: cfg.border,
      badgeBg: cfg.badgeBg,
      schoolCount: schoolSet.size,
      proposalCount: projProposals.length,
      studentCount,
      totalAllocated,
      totalInvested,
      itemCost,
      otherCost,
      constrCost,
      delta,
      usagePercentage,
    };
  });

  // 2. Sales Breakdown Grouped by Project
  const salesMap = new Map<string, {
    saleId: string;
    saleName: string;
    email?: string;
    proposals: typeof allProposals;
  }>();

  saleUsers.forEach(u => {
    salesMap.set(u.id, {
      saleId: u.id,
      saleName: u.name || "Chưa đặt tên",
      email: u.email || "",
      proposals: [],
    });
  });

  allProposals.forEach(p => {
    const saleObj = p.school?.sale;
    const saleId = p.school?.saleId || saleObj?.id;
    if (saleId) {
      if (!salesMap.has(saleId)) {
        salesMap.set(saleId, {
          saleId,
          saleName: saleObj?.name || "Kinh doanh",
          email: saleObj?.email || "",
          proposals: [],
        });
      }
      salesMap.get(saleId)!.proposals.push(p);
    }
  });

  const salesData: SaleCostStat[] = Array.from(salesMap.values())
    .map(s => {
      const allSchoolSet = new Set<string>();
      let saleAllocatedAll = 0;
      let saleInvestedAll = 0;
      let saleStudentsAll = 0;

      const projectStats: SaleProjectDetail[] = PROJECT_CONFIGS.map(cfg => {
        const subProposals = s.proposals.filter(p => (p.projectName || "IPRO") === cfg.key);
        const subSchoolSet = new Set<string>();
        let alloc = 0;
        let inv = 0;
        let stCount = 0;
        let itemCost = 0;
        let otherCost = 0;
        let constrCost = 0;

        subProposals.forEach(p => {
          subSchoolSet.add(p.schoolId);
          allSchoolSet.add(p.schoolId);
          alloc += Number(p.allocatedBudget || 0);
          inv += Number(p.investedBudget || 0);
          const st = Number(p.newStudents || p.school?.newStudents || 0);
          stCount += st;

          p.items.forEach(i => {
            itemCost += Number(i.totalPrice || 0);
          });

          p.investments.forEach(invItem => {
            const price = Number(invItem.totalPrice || 0);
            if (isConstructionItemName(invItem.name)) {
              constrCost += price;
            } else {
              otherCost += price;
            }
          });
        });

        saleAllocatedAll += alloc;
        saleInvestedAll += inv;
        saleStudentsAll += stCount;
        const delta = alloc - inv;
        const usagePercentage = alloc > 0 ? Math.round((inv / alloc) * 100) : 0;

        return {
          projectKey: cfg.key,
          projectName: cfg.name,
          color: cfg.color,
          bg: cfg.bg,
          border: cfg.border,
          badgeBg: cfg.badgeBg,
          schoolCount: subSchoolSet.size,
          proposalCount: subProposals.length,
          studentCount: stCount,
          totalAllocated: alloc,
          totalInvested: inv,
          itemCost,
          otherCost,
          constrCost,
          delta,
          usagePercentage,
        };
      });

      return {
        saleId: s.saleId,
        saleName: s.saleName,
        email: s.email,
        totalAllocated: saleAllocatedAll,
        totalInvested: saleInvestedAll,
        totalSchools: allSchoolSet.size,
        totalProposals: s.proposals.length,
        totalStudents: saleStudentsAll,
        projectStats,
      };
    })
    .sort((a, b) => b.totalInvested - a.totalInvested);

  return (
    <div style={{ paddingBottom: "2rem" }}>
      <ProjectCostDashboard
        projectsData={projectsData}
        salesData={salesData}
        title="Dashboard Thống Kê Chi Phí Theo Từng Dự Án & Nhân Viên Sale 📊"
        subtitle="Theo dõi trực quan định mức ngân sách, số học sinh mới và chi phí giải ngân chi tiết của từng dự án và từng nhân viên kinh doanh"
      />
    </div>
  );
}
