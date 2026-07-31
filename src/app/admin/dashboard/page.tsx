import React from "react";
import prisma from "@/lib/prisma";
import ProjectCostDashboard, { ProjectCostStat, SaleCostStat, SaleProjectDetail } from "./ProjectCostDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  let rawAllProposals: any[] = [];
  let saleUsers: any[] = [];
  let rawSchools: any[] = [];

  try {
    const resProposals = await prisma.proposal.findMany({
      include: {
        sale: true,
        school: {
          include: { sale: true }
        },
        items: true,
        investments: true,
      },
      orderBy: { updatedAt: "desc" }
    });
    rawAllProposals = JSON.parse(JSON.stringify(resProposals));
  } catch (error) {
    console.error("AdminDashboardPage rawAllProposals fetch error:", error);
  }

  try {
    const resUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: "SALE" },
          { role: "sale" },
          { schools: { some: {} } },
          { proposals: { some: {} } }
        ]
      },
      select: { id: true, name: true, email: true }
    });
    saleUsers = JSON.parse(JSON.stringify(resUsers));
  } catch (error) {
    console.error("AdminDashboardPage saleUsers fetch error:", error);
  }

  try {
    const resSchools = await prisma.school.findMany({
      select: { id: true, saleId: true }
    });
    rawSchools = JSON.parse(JSON.stringify(resSchools));
  } catch (error) {
    console.error("AdminDashboardPage rawSchools fetch error:", error);
  }

  const isConstructionItemName = (name: string) => {
    const lower = (name || "").toLowerCase();
    return lower.includes("thi công") || lower.includes("bảo trì") || lower.includes("hệ thống");
  };

  // Deduplicate proposals so each school counts its latest proposal PER PROJECT
  const latestProposalsMap = new Map<string, typeof rawAllProposals[0]>();
  for (const p of rawAllProposals) {
    const schId = p.schoolId || p.school?.id || p.id;
    const projName = p.projectName || "IPRO";
    const key = `${schId}_${projName}`;
    if (schId && !latestProposalsMap.has(key)) {
      latestProposalsMap.set(key, p);
    }
  }
  const rawUniqueProposals = Array.from(latestProposalsMap.values());

  const allProposals = rawUniqueProposals.map((p: any) => {
    const newStudents = Number(p.newStudents || p.school?.newStudents || 0);
    const dbAlloc = Number(p.allocatedBudget || 0);
    const dbInvested = Number(p.investedBudget || 0);
    const allocatedBudget = dbAlloc > 0
      ? dbAlloc
      : (newStudents > 0 ? Math.floor((newStudents * 100000000) / 105) : 0);

    return {
      ...p,
      id: String(p.id),
      schoolId: String(p.schoolId || p.school?.id || ""),
      saleId: String(p.saleId || p.school?.saleId || p.sale?.id || ""),
      projectName: String(p.projectName || "IPRO"),
      status: String(p.status || "DRAFT"),
      newStudents,
      allocatedBudget,
      investedBudget: dbInvested,
      sale: p.sale ? { id: String(p.sale.id), name: String(p.sale.name || ""), email: String(p.sale.email || "") } : null,
      school: p.school ? { 
        id: String(p.school.id), 
        name: String(p.school.name || ""), 
        saleId: String(p.school.saleId || ""),
        sale: p.school.sale ? { id: String(p.school.sale.id), name: String(p.school.sale.name || ""), email: String(p.school.sale.email || "") } : null
      } : null,
      items: (p.items || []).map((i: any) => ({
        totalPrice: Number(i?.totalPrice || 0)
      })),
      investments: (p.investments || []).map((invItem: any) => ({
        name: String(invItem?.name || ""),
        description: String(invItem?.description || ""),
        totalPrice: Number(invItem?.totalPrice || 0)
      })),
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
      const st = Number(p.newStudents || 0);

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

  // 2. Sales Breakdown Grouped by Project (Includes ALL Sales users)
  const salesMap = new Map<string, {
    saleId: string;
    saleName: string;
    email?: string;
    schoolIds: Set<string>;
    proposals: typeof allProposals;
  }>();

  saleUsers.forEach(u => {
    salesMap.set(String(u.id), {
      saleId: String(u.id),
      saleName: String(u.name || "Chưa đặt tên"),
      email: String(u.email || ""),
      schoolIds: new Set<string>(),
      proposals: [],
    });
  });

  rawSchools.forEach(sch => {
    if (sch.saleId && salesMap.has(String(sch.saleId))) {
      salesMap.get(String(sch.saleId))!.schoolIds.add(String(sch.id));
    }
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
          schoolIds: new Set<string>(),
          proposals: [],
        });
      }
      salesMap.get(sId)!.proposals.push(p);
      if (p.schoolId || p.school?.id) {
        salesMap.get(sId)!.schoolIds.add(p.schoolId || p.school?.id);
      }
    }
  });

  const salesData: SaleCostStat[] = Array.from(salesMap.values())
    .map(s => {
      const allSchoolSet = new Set<string>(s.schoolIds);
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
          const st = Number(p.newStudents || 0);
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
    .sort((a, b) => (b.totalAllocated - a.totalAllocated) || (b.totalProposals - a.totalProposals) || (b.totalSchools - a.totalSchools));

  const totalUniqueSchools = new Set(allProposals.map((p: any) => p.schoolId).filter(Boolean)).size;

  return (
    <div style={{ paddingBottom: "2rem" }}>
      <ProjectCostDashboard
        projectsData={projectsData}
        salesData={salesData}
        totalUniqueSchools={totalUniqueSchools}
        title="Dashboard Thống Kê Chi Phí Theo Từng Dự Án & Nhân Viên Sale 📊"
        subtitle="Theo dõi trực quan định mức ngân sách, số học sinh mới và chi phí giải ngân chi tiết của từng dự án và từng nhân viên kinh doanh"
      />
    </div>
  );
}
