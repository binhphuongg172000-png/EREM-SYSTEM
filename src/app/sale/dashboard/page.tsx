import React from "react";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import ProjectCostDashboard, { ProjectCostStat } from "@/app/admin/dashboard/ProjectCostDashboard";

export const dynamic = "force-dynamic";

export default async function SaleDashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  let rawSchools: any[] = [];
  try {
    rawSchools = await prisma.school.findMany({
      where: { saleId: userId },
      include: {
        proposals: {
          orderBy: { updatedAt: "desc" },
          take: 1,
          include: {
            items: { select: { totalPrice: true } },
            investments: { select: { name: true, description: true, totalPrice: true } },
          }
        }
      }
    });
  } catch (error) {
    console.error("SaleDashboardPage fetch error:", error);
  }

  const isConstructionItemName = (name: string) => {
    const lower = (name || "").toLowerCase();
    return lower.includes("thi công") || lower.includes("bảo trì") || lower.includes("hệ thống");
  };

  const proposals = rawSchools
    .map(s => (s.proposals && s.proposals[0]) ? { ...s.proposals[0], school: s } : null)
    .filter(Boolean) as NonNullable<any>[];

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

  const projectsData: ProjectCostStat[] = PROJECT_CONFIGS.map(cfg => {
    const projProposals = proposals.filter(p => (p.projectName || "IPRO") === cfg.key);
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

  return (
    <div style={{ paddingBottom: "2rem" }}>
      {/* Top Welcome & CTA Card */}
      <div className="dashboard-top-hero-wrap" style={{ marginBottom: "1.5rem" }}>
        {/* Left: Page Title */}
        <div className="sale-hero-banner" style={{ margin: 0, padding: "0.85rem 1.15rem", flex: 1 }}>
          <h1 className="hero-title" style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "#ffffff" }}>
            Dashboard Cá Nhân Kinh Doanh 🚀
          </h1>
        </div>

        {/* Right: Primary CTA Button */}
        <div className="cta-create-wrap">
          <Link 
            href="/sale/proposals/new" 
            prefetch={true} 
            className="btn-cta-primary"
            style={{ 
              whiteSpace: "nowrap",
              padding: "0.65rem 1.25rem", 
              fontSize: "0.85rem",
              fontWeight: 800
            }}
          >
            <Plus size={18} /> Bắt đầu lập dự trù mới
          </Link>
        </div>
      </div>

      <ProjectCostDashboard
        projectsData={projectsData}
        title="Tổng Quan Chi Phí Cá Nhân Theo Từng Dự Án 🚀"
        subtitle="Theo dõi trực quan ngân sách, số học sinh mới và chi phí thực tế của các dự trù kinh doanh do bạn quản lý"
      />
    </div>
  );
}
