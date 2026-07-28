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

  const { proposals, counts } = await getCachedData(
    `sale_proposals_list_${userId}`,
    async () => {
      const raw = await prisma.proposal.findMany({
        where: {
          school: {
            saleId: userId,
          },
        },
        include: {
          school: true,
          items: true,
        },
        orderBy: { updatedAt: "desc" },
      });

      const proposals = raw.map((p) => {
        let allocatedBudget = Number(p.allocatedBudget);
        let investedBudget = 0;

        p.items.forEach((pi) => {
          investedBudget += Number(pi.totalPrice);
        });

        return {
          ...p,
          allocatedBudget,
          investedBudget,
        };
      });

      const totalProposals = proposals.length;
      const completedCount = proposals.filter(p => p.status === "COMPLETED").length;
      const lockedCount = proposals.filter(p => !["COMPLETED"].includes(p.status) && (p.school?.isLocked || p.status === "APPROVED")).length;
      const initCount = totalProposals - completedCount - lockedCount;

      return { proposals, counts: { totalProposals, initCount, lockedCount, completedCount } };
    },
    30
  );

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
