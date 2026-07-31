import React from "react";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import ProjectCostDashboard, { ProjectCostStat } from "@/app/admin/dashboard/ProjectCostDashboard";
import { computeProposalAllocatedBudget, deduplicateActiveProposals } from "@/lib/budget-utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SaleDashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  let rawAllProposals: any[] = [];
  let rawSchools: any[] = [];

  try {
    const [resProposals, resSchools] = await Promise.all([
      prisma.proposal.findMany({
        where: {
          status: { not: "CLOSED" },
          OR: [
            { saleId: userId },
            { school: { saleId: userId } }
          ]
        },
        include: {
          sale: true,
          school: { include: { sale: true } },
          items: true,
          investments: true,
        },
        orderBy: { updatedAt: "desc" }
      }),
      prisma.school.findMany({
        where: { saleId: userId },
        select: { id: true, saleId: true }
      })
    ]);

    rawAllProposals = JSON.parse(JSON.stringify(resProposals));
    rawSchools = JSON.parse(JSON.stringify(resSchools));
  } catch (error) {
    console.error("SaleDashboardPage fetch error:", error);
  }

  const isConstructionItemName = (name: string) => {
    const lower = (name || "").toLowerCase();
    return lower.includes("thi công") || lower.includes("bảo trì") || lower.includes("hệ thống");
  };

  // Deduplicate active proposals so each school counts its latest ACTIVE proposal PER PROJECT (excludes status === "CLOSED")
  const rawUniqueProposals = deduplicateActiveProposals(rawAllProposals);

  const allProposals = rawUniqueProposals.map((p: any) => {
    const newStudents = Number(p.newStudents ?? p.school?.newStudents ?? 0);
    const dbInvested = Number(p.investedBudget || 0);
    const allocatedBudget = computeProposalAllocatedBudget(p);

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

  const matchProjectKey = (pName: string | undefined | null, targetKey: string) => {
    const norm = (pName || "IPRO").toString().toUpperCase().trim();
    return norm === targetKey;
  };

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

  const schoolBudgetList = allProposals.map((p: any) => {
    const delta = p.allocatedBudget - p.investedBudget;
    const usagePercentage = p.allocatedBudget > 0 ? Math.round((p.investedBudget / p.allocatedBudget) * 100) : 0;
    return {
      id: String(p.id),
      proposalId: String(p.id),
      schoolId: String(p.schoolId || p.school?.id || ""),
      schoolName: String(p.school?.name || "Trường chưa đặt tên"),
      projectName: String(p.projectName || "IPRO"),
      saleName: String(p.sale?.name || p.school?.sale?.name || ""),
      newStudents: Number(p.newStudents || 0),
      allocatedBudget: Number(p.allocatedBudget || 0),
      investedBudget: Number(p.investedBudget || 0),
      delta,
      usagePercentage,
    };
  });

  const totalUniqueSchools = new Set(allProposals.map((p: any) => p.schoolId).filter(Boolean)).size;

  return (
    <div style={{ paddingBottom: "2rem" }}>
      <ProjectCostDashboard
        projectsData={projectsData}
        schoolBudgetList={schoolBudgetList}
        totalUniqueSchools={totalUniqueSchools}
        title="Dashboard Cá Nhân Kinh Doanh 🚀"
        subtitle="Theo dõi trực quan ngân sách, số học sinh mới và chi phí thực tế của các dự trù kinh doanh do bạn quản lý"
        actionButton={
          <Link
            href="/sale/proposals/new"
            prefetch={true}
            className="btn-cta-primary"
            style={{
              whiteSpace: "nowrap",
              padding: "0.55rem 1.15rem",
              fontSize: "0.82rem",
              fontWeight: 800
            }}
          >
            <Plus size={16} /> Bắt đầu lập dự trù mới
          </Link>
        }
      />
    </div>
  );
}
