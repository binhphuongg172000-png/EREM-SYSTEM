import React from "react";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import SaleProposalsClient from "./SaleProposalsClient";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SaleProposalsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  const rawProposals = await prisma.proposal.findMany({
    where: { saleId: userId },
    include: { school: true },
    orderBy: { createdAt: "desc" },
  });

  // User should only see the latest proposal per school
  const seenSchools = new Set<string>();
  const latestProposals = rawProposals.filter((p) => {
    if (seenSchools.has(p.schoolId)) {
      return false;
    }
    seenSchools.add(p.schoolId);
    return true;
  });

  const proposals = latestProposals.map((p) => ({
    id: p.id,
    schoolId: p.schoolId,
    saleId: p.saleId,
    status: p.status,
    rejectReason: p.rejectReason,
    allocatedBudget: Number(p.allocatedBudget),
    investedBudget: Number(p.investedBudget),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    school: p.school,
  }));

  // Stats
  const totalProposals = proposals.length;
  const completedCount = proposals.filter(p => p.status === "COMPLETED").length;
  const lockedCount = proposals.filter(p => !["COMPLETED"].includes(p.status) && (p.school?.isLocked || p.status === "APPROVED")).length;
  const initCount = totalProposals - completedCount - lockedCount;

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .new-proposal-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.6rem 1.5rem; border-radius: 12px;
          background: linear-gradient(135deg, #38bdf8, #818cf8);
          color: #ffffff; font-weight: 700; font-size: 0.9rem;
          border: none; cursor: pointer; text-decoration: none;
          box-shadow: 0 4px 15px rgba(56, 189, 248, 0.3);
          transition: all 0.2s ease;
        }
        .new-proposal-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(56, 189, 248, 0.45);
        }
        .stat-mini {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 1rem; border-radius: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>Danh sách Dự trù của bạn</h1>
          <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0.25rem 0 0 0" }}>Quản lý tất cả hồ sơ dự trù kinh phí</p>
        </div>
        <Link href="/sale/proposals/new" className="new-proposal-btn">
          <Plus size={18} />
          Lập dự trù mới
        </Link>
      </div>

      {/* Mini Stats */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <div className="stat-mini">
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#38bdf8" }} />
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Tổng cộng</span>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#ffffff" }}>{totalProposals}</span>
        </div>
        <div className="stat-mini">
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fbbf24" }} />
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Khởi tạo</span>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fbbf24" }}>{initCount}</span>
        </div>
        <div className="stat-mini">
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f43f5e" }} />
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Đang thực hiện</span>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#f43f5e" }}>{lockedCount}</span>
        </div>
        <div className="stat-mini">
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34d399" }} />
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Hoàn thành</span>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#34d399" }}>{completedCount}</span>
        </div>
      </div>

      <SaleProposalsClient proposals={proposals} />
    </div>
  );
}
