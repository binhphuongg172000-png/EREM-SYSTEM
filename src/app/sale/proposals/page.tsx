import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCachedData } from "@/lib/cache";
import SaleProposalsClient from "./SaleProposalsClient";
import { Plus } from "lucide-react";
import { computeProposalAllocatedBudget, deduplicateActiveProposals } from "@/lib/budget-utils";

export const dynamic = "force-dynamic";

export default async function SaleProposalsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  let res: any[] = [];
  try {
    res = await prisma.proposal.findMany({
      where: {
        status: { not: "CLOSED" },
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
  } catch (err) {
    console.error("SaleProposalsPage fetch error:", err);
  }
  const raw = JSON.parse(JSON.stringify(res));

  // Business rule: Each school has 1 active proposal per project displayed (excludes status CLOSED)
  const uniqueRaw = deduplicateActiveProposals(raw);

  const proposals = uniqueRaw.map((p: any) => {
    const allocatedBudget = computeProposalAllocatedBudget(p);
    const investedBudget = Number(p.investedBudget || 0);

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
