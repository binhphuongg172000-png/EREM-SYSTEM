import React from "react";
import prisma from "@/lib/prisma";
import ProjectCostDashboard, { ProjectCostStat, SaleCostStat, SaleProjectDetail } from "./ProjectCostDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  let rawAllProposals: any[] = [];
  let saleUsers: any[] = [];

  try {
    [rawAllProposals, saleUsers] = await Promise.all([
      prisma.proposal.findMany({
        select: {
          id: true,
          schoolId: true,
          saleId: true,
          projectName: true,
          status: true,
          newStudents: true,
          allocatedBudget: true,
          investedBudget: true,
          sale: { select: { id: true, name: true, email: true } },
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
      }),
      prisma.user.findMany({
        where: {
          OR: [
            { role: "SALE" },
            { role: "sale" },
            { schools: { some: {} } },
            { proposals: { some: {} } }
          ]
        },
        select: { id: true, name: true, email: true }
      })
    ]);
  } catch (error) {
    console.error("AdminDashboardPage fetch error:", error);
  }

  const isConstructionItemName = (name: string) => {
    const lower = (name || "").toLowerCase();
    return lower.includes("thi công") || lower.includes("bảo trì") || lower.includes("hệ thống");
  };

  // Deduplicate proposals so each school counts its latest proposal
  const latestProposalsMap = new Map<string, typeof rawAllProposals[0]>();
  for (const p of rawAllProposals) {
    const schId = p.schoolId || p.school?.id;
    if (schId && !latestProposalsMap.has(schId)) {
      latestProposalsMap.set(schId, p);
    }
  }
  const rawUniqueProposals = Array.from(latestProposalsMap.values());

  // Calculate allocatedBudget dynamically if 0 but newStudents > 0
  const allProposals = rawUniqueProposals.map((p: any) => {
    const newStudents = Number(p.newStudents || p.school?.newStudents || 0);
    const dbAlloc = Number(p.allocatedBudget || 0);
    const allocatedBudget = dbAlloc > 0
      ? dbAlloc
      : (newStudents > 0 ? Math.floor((newStudents * 100000000) / 105) : 0);

    return {
      ...p,
      newStudents,
      allocatedBudget,
      investedBudget: Number(p.investedBudget || 0),
    };
  });

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

  // Helper matching project name case-insensitively
  const matchProjectKey = (pName: string | undefined | null, targetKey: string) => {
    const norm = (pName || "IPRO").toString().toUpperCase().trim();
    return norm === targetKey;
  };

  // 1. Projects Breakdown
  const projectsData: ProjectCostStat[] = PROJECT_CONFIGS.map(cfg => {
    const projProposals = allProposals.filter(p => matchProjectKey(p.projectName, cfg.key));
    const schoolSet = new Set<string>();

    let totalAllocated = 0;
    let totalInvested = 0;
    let studentCount = 0;
    let itemCost = 0;
    let otherCost = 0;
    let constrCost = 0;

    projProposals.forEach(p => {
      const schId = p.schoolId || p.school?.id;
      if (schId) schoolSet.add(schId);

      const alloc = Number(p.allocatedBudget || 0);
      const inv = Number(p.investedBudget || 0);
      const st = Number(p.newStudents || p.school?.newStudents || 0);

      totalAllocated += alloc;
      totalInvested += inv;
      studentCount += st;

      (p.items || []).forEach((i: any) => {
        itemCost += Number(i?.totalPrice || 0);
      });

      (p.investments || []).forEach((invItem: any) => {
        const price = Number(invItem?.totalPrice || 0);
        if (isConstructionItemName(invItem?.name)) {
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
    const saleObj = p.sale || p.school?.sale;
    const sId = p.saleId || p.school?.saleId || saleObj?.id;
    if (sId) {
      if (!salesMap.has(sId)) {
        salesMap.set(sId, {
          saleId: sId,
          saleName: saleObj?.name || "Nhân viên kinh doanh",
          email: saleObj?.email || "",
          proposals: [],
        });
      }
      salesMap.get(sId)!.proposals.push(p);
    }
  });

  const salesData: SaleCostStat[] = Array.from(salesMap.values())
    .filter(s => s.proposals.length > 0)
    .map(s => {
      const allSchoolSet = new Set<string>();
      let saleAllocatedAll = 0;
      let saleInvestedAll = 0;
      let saleStudentsAll = 0;

      const projectStats: SaleProjectDetail[] = PROJECT_CONFIGS.map(cfg => {
        const subProposals = s.proposals.filter(p => matchProjectKey(p.projectName, cfg.key));
        const subSchoolSet = new Set<string>();
        let alloc = 0;
        let inv = 0;
        let stCount = 0;
        let itemCost = 0;
        let otherCost = 0;
        let constrCost = 0;

        subProposals.forEach(p => {
          const schId = p.schoolId || p.school?.id;
          if (schId) {
            subSchoolSet.add(schId);
            allSchoolSet.add(schId);
          }
          alloc += Number(p.allocatedBudget || 0);
          inv += Number(p.investedBudget || 0);
          const st = Number(p.newStudents || p.school?.newStudents || 0);
          stCount += st;

          (p.items || []).forEach((i: any) => {
            itemCost += Number(i?.totalPrice || 0);
          });

          (p.investments || []).forEach((invItem: any) => {
            const price = Number(invItem?.totalPrice || 0);
            if (isConstructionItemName(invItem?.name)) {
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
    .sort((a, b) => b.totalAllocated - a.totalAllocated);

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
