import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCachedData } from "@/lib/cache";
import SaleProposalsClient from "./SaleProposalsClient";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SaleProposalsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  const raw = await getCachedData(
    `sale_proposals_list_${userId}`,
    async () => {
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
    },
    30,
    [`sale_proposals_${userId}`]
  );

  // Business rule: Each school has ONLY 1 latest proposal displayed
  const schoolMap = new Map<string, typeof raw[0]>();
  for (const p of raw) {
    if (!p.schoolId) continue;
    if (!schoolMap.has(p.schoolId)) {
      schoolMap.set(p.schoolId, p);
    }
  }
  const uniqueRaw = Array.from(schoolMap.values());

  const proposals = JSON.parse(JSON.stringify(uniqueRaw)).map((p: any) => {
    let allocatedBudget = Number(p.allocatedBudget || 0);
    let investedBudget = Number(p.investedBudget || 0);

    return {
      ...p,
      allocatedBudget,
      investedBudget,
    };
  });

  const totalProposals = proposals.length;
  const completedCount = proposals.filter((p: any) => p.status === "COMPLETED").length;
  const lockedCount = proposals.filter((p: any) => !["COMPLETED"].includes(p.status) && (p.school?.isLocked || p.status === "APPROVED")).length;
  const initCount = totalProposals - completedCount - lockedCount;

  const counts = { totalProposals, initCount, lockedCount, completedCount };

  return (
    <div style={{ animation: "fadeIn 0.25s ease-out" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>
            Kho Hồ sơ Dự trù Kinh phí
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "0.25rem 0 0 0" }}>
            Quản lý và lập hồ sơ dự trù cho các trường học được phân công
          </p>
        </div>
        <Link href="/sale/proposals/new" prefetch={true} className="btn-cta-primary">
          <Plus size={16} /> Lập dự trù mới
        </Link>
      </div>

      <SaleProposalsClient proposals={proposals} counts={counts} />
    </div>
  );
}
