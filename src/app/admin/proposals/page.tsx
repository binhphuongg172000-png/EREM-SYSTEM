import React from "react";
import prisma from "@/lib/prisma";
import SearchInput from "../SearchInput";
import ProposalRowActions from "./ProposalRowActions";
import ProposalFilters from "./ProposalFilters";
import ProposalStatusSelect from "./ProposalStatusSelect";
import { Building2, Calendar, TrendingUp, TrendingDown, UserCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; saleId?: string; latest?: string; budget?: string; status?: string }>;
}) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";
  const saleId = resolvedParams?.saleId || "";
  const latest = resolvedParams?.latest ?? "true";
  const budget = resolvedParams?.budget || "";
  const statusFilter = resolvedParams?.status || "";

  const sales = await prisma.user.findMany({
    where: { role: "SALE" },
    select: { id: true, name: true, username: true },
    orderBy: { name: "asc" },
  });

  const whereClause: any = {};
  if (saleId) {
    whereClause.saleId = saleId;
  }
  if (search) {
    whereClause.OR = [
      { school: { name: { contains: search, mode: "insensitive" } } },
      { school: { address: { contains: search, mode: "insensitive" } } },
      { sale: { name: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (statusFilter === "init") {
    whereClause.status = { notIn: ["COMPLETED"] };
    whereClause.school = { ...whereClause.school, isLocked: false };
  } else if (statusFilter === "locked") {
    whereClause.status = { notIn: ["COMPLETED"] };
    whereClause.school = { ...whereClause.school, isLocked: true };
  } else if (statusFilter === "completed") {
    whereClause.status = "COMPLETED";
  }

  const rawProposals = await prisma.proposal.findMany({
    where: whereClause,
    include: {
      school: true,
      sale: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // If latest === "true", filter to keep only the newest proposal per school
  let displayProposals = rawProposals;
  if (latest === "true") {
    const seenSchoolIds = new Set<string>();
    displayProposals = rawProposals.filter((p) => {
      if (seenSchoolIds.has(p.schoolId)) return false;
      seenSchoolIds.add(p.schoolId);
      return true;
    });
  }

  // Budget filter (client-side since it needs calculation)
  if (budget === "positive") {
    displayProposals = displayProposals.filter(p => Number(p.allocatedBudget) - Number(p.investedBudget) >= 0);
  } else if (budget === "negative") {
    displayProposals = displayProposals.filter(p => Number(p.allocatedBudget) - Number(p.investedBudget) < 0);
  }

  // Calculate stats based on displayed proposals
  const totalProposals = displayProposals.length;
  const completedCount = displayProposals.filter(p => p.status === "COMPLETED").length;
  const lockedCount = displayProposals.filter(p => !["COMPLETED"].includes(p.status) && (p.school?.isLocked || p.status === "APPROVED")).length;
  const initCount = totalProposals - completedCount - lockedCount;

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .stat-mini {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 1rem; border-radius: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .proposal-row { transition: background 0.15s ease; }
        .proposal-row:hover { background: rgba(56, 189, 248, 0.04) !important; }
        .school-name {
          font-weight: 700; color: #ffffff; display: flex;
          align-items: center; gap: 0.5rem; margin-bottom: 0.15rem;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .school-address {
          font-size: 0.78rem; color: #64748b; padding-left: 1.5rem;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .delta-chip {
          display: inline-flex; align-items: center; gap: 0.25rem;
          padding: 0.2rem 0.6rem; border-radius: 6px;
          font-size: 0.8rem; font-weight: 700; white-space: nowrap;
        }
        .delta-positive { background: rgba(52,211,153,0.1); color: #34d399; }
        .delta-negative { background: rgba(244,63,94,0.1); color: #fb7185; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>Kho Dự trù Toàn Hệ thống</h1>
          <p style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "0.25rem", fontWeight: 500, margin: "0.25rem 0 0 0" }}>
            Quản lý toàn bộ dự trù kinh phí do Sale lập trên cả nước
          </p>
        </div>
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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "0.75rem", flexWrap: "wrap" }}>
        <SearchInput placeholder="Tìm trường, địa chỉ, tên sale..." />
        <ProposalFilters
          sales={sales}
          currentSaleId={saleId}
          currentLatest={latest}
          currentBudget={budget}
          currentLock={statusFilter}
        />
      </div>

      <div className="card table-container" style={{ padding: 0, overflow: "visible", borderRadius: "12px" }}>
        <table className="table table-hover" style={{ tableLayout: "fixed", width: "100%", margin: 0 }}>
          <colgroup>
            <col style={{ width: "24%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "15%" }} />
          </colgroup>
          <thead>
            <tr>
              <th style={{ paddingLeft: "1.25rem" }}>Trường học</th>
              <th>Nhân viên Sale</th>
              <th>Ngày lập</th>
              <th style={{ textAlign: "right" }}>Chênh lệch</th>
              <th style={{ textAlign: "center" }}>Trạng thái</th>
              <th style={{ textAlign: "right", paddingRight: "1.25rem" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {displayProposals.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "3rem 2rem", textAlign: "center", color: "#64748b" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(56,189,248,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                    <Building2 size={24} color="#38bdf8" />
                  </div>
                  <p style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: 500, margin: "0 0 0.25rem" }}>Không tìm thấy hồ sơ nào phù hợp</p>
                  <p style={{ color: "#475569", fontSize: "0.8rem", margin: 0 }}>Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </td>
              </tr>
            ) : (
              displayProposals.map((p) => {
                const delta = Number(p.allocatedBudget) - Number(p.investedBudget);
                
                const serializedProposal = {
                  ...p,
                  allocatedBudget: Number(p.allocatedBudget),
                  investedBudget: Number(p.investedBudget)
                };

                return (
                  <tr key={p.id} className="proposal-row">
                    <td style={{ paddingLeft: "1.25rem", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <div className="school-name">
                        <Building2 size={14} color="#64748b" style={{ flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{p.school?.name}</span>
                      </div>
                      <div className="school-address">{p.school?.address}</div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#38bdf8", fontWeight: 600, fontSize: "0.75rem" }}>
                        <UserCircle size={13} color="#64748b" style={{ flexShrink: 0 }} />
                        <span>{p.sale?.name}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#94a3b8", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                        <Calendar size={13} color="#475569" />
                        {new Date(p.createdAt).toLocaleString("vi-VN", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <span className={`delta-chip ${delta >= 0 ? "delta-positive" : "delta-negative"}`}>
                        {delta >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        {delta >= 0 ? "+" : ""}{delta.toLocaleString()} đ
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <ProposalStatusSelect proposal={serializedProposal} />
                    </td>
                    <td style={{ textAlign: "right", paddingRight: "1.25rem" }}>
                      <ProposalRowActions proposal={serializedProposal} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
