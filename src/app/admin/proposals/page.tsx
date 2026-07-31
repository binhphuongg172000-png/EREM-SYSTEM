import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import SearchInput from "../SearchInput";
import ProposalRowActions from "./ProposalRowActions";
import ProposalFilters from "./ProposalFilters";
import ProposalStatusSelect from "./ProposalStatusSelect";
import { getCachedData } from "@/lib/cache";
import { vietnameseIncludes } from "@/lib/vietnamese";
import { Building2, Calendar, TrendingUp, TrendingDown, UserCircle, AlertTriangle } from "lucide-react";
import { cookies } from "next/headers";
import PaginationControls from "@/components/PaginationControls";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; saleId?: string; latest?: string; budget?: string; status?: string; project?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";
  const saleId = resolvedParams?.saleId || "";
  const latest = resolvedParams?.latest ?? "true";
  const budget = resolvedParams?.budget || "";
  const statusFilter = resolvedParams?.status || "";
  const projectFilter = resolvedParams?.project || "";

  const cookieStore = await cookies();
  const userRole = cookieStore.get("userRole")?.value;
  const isSysAdmin = userRole === "SUPER_ADMIN";
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  const nowTime = Date.now();
  const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

  let sales: any[] = [];
  let dbProposals: any[] = [];
  try {
    [sales, dbProposals] = await Promise.all([
      prisma.user.findMany({
        where: { OR: [{ role: "SALE" }, { role: "sale" }] },
        select: { id: true, name: true, username: true },
        orderBy: { name: "asc" },
      }),
      prisma.proposal.findMany({
        include: {
          school: true,
          sale: true,
        },
        orderBy: { createdAt: "desc" },
      })
    ]);
  } catch (err) {
    console.error("AdminProposalsPage fetch error:", err);
  }
  const allProposals = JSON.parse(JSON.stringify(dbProposals)).map((p: any) => {
    if (p.status === "CLOSED") {
      return {
        ...p,
        allocatedBudget: Number(p.allocatedBudget || 0),
      };
    }
    const newStudents = Number(p.school?.newStudents) || 0;
    const allocatedBudget = newStudents > 0 ? Math.floor((newStudents * 100000000) / 105) : Number(p.allocatedBudget || 0);
    return {
      ...p,
      allocatedBudget
    };
  });

  // Active proposals dataset for top header stat cards (excludes CLOSED history proposals)
  const activeProposals = allProposals.filter((p: any) => p.status !== "CLOSED");

  // Count total overdue proposals across system (>5 days not in progress/completed/closed)
  const overdueCount = activeProposals.filter((p: any) => {
    if (p.status === "COMPLETED" || p.status === "APPROVED") return false;
    const createdTime = new Date(p.createdAt).getTime();
    return (nowTime - createdTime) >= FIVE_DAYS_MS;
  }).length;

  // Filter in memory for instant status/sale/search switching
  const rawProposals = allProposals.filter((p: any) => {
    if (saleId && p.saleId !== saleId) return false;
    if (search && !(
      vietnameseIncludes(p.school?.name, search) ||
      vietnameseIncludes(p.school?.address, search) ||
      vietnameseIncludes(p.sale?.name, search)
    )) return false;
    if (projectFilter && (p.projectName || "IPRO") !== projectFilter) return false;
    if (statusFilter === "init") {
      if (p.status === "COMPLETED" || p.status === "CLOSED" || p.school?.isLocked) return false;
    } else if (statusFilter === "locked") {
      if (p.status === "COMPLETED" || p.status === "CLOSED" || !p.school?.isLocked) return false;
    } else if (statusFilter === "completed") {
      if (p.status !== "COMPLETED") return false;
    } else if (statusFilter === "closed") {
      if (p.status !== "CLOSED") return false;
    } else if (statusFilter === "overdue") {
      if (p.status === "COMPLETED" || p.status === "APPROVED" || p.status === "CLOSED") return false;
      const createdTime = new Date(p.createdAt).getTime();
      if ((nowTime - createdTime) < FIVE_DAYS_MS) return false;
    }
    return true;
  });

  // If latest === "true", filter to keep only the newest proposal per school & project
  let displayProposals = rawProposals;
  if (latest === "true") {
    const seenSchoolProjectKeys = new Set<string>();
    displayProposals = rawProposals.filter((p: any) => {
      const key = `${p.schoolId}_${p.projectName || "IPRO"}`;
      if (seenSchoolProjectKeys.has(key)) return false;
      seenSchoolProjectKeys.add(key);
      return true;
    });
  }

  // Budget filter (client-side since it needs calculation)
  if (budget === "positive") {
    displayProposals = displayProposals.filter((p: any) => Number(p.allocatedBudget) - Number(p.investedBudget) >= 0);
  } else if (budget === "negative") {
    displayProposals = displayProposals.filter((p: any) => Number(p.allocatedBudget) - Number(p.investedBudget) < 0);
  }

  const page = Math.max(1, Number(resolvedParams?.page || 1));
  const pageSize = 20;
  const totalItems = displayProposals.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const limitedProposals = displayProposals.slice((page - 1) * pageSize, page * pageSize);

  // System Total Stats (Excludes CLOSED proposals so metrics reflect active work)
  const totalProposals = activeProposals.length;
  const completedCount = activeProposals.filter((p: any) => p.status === "COMPLETED").length;
  const lockedCount = activeProposals.filter((p: any) => p.status !== "COMPLETED" && (p.school?.isLocked || p.status === "APPROVED")).length;
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>Kho Dự trù Toàn Hệ thống</h1>
          <p style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "0.25rem", fontWeight: 500, margin: "0.25rem 0 0 0" }}>
            Quản lý toàn bộ dự trù kinh phí do Sale lập trên cả nước
          </p>
        </div>
      </div>
            {/* SADMIN OVERDUE WARNING BANNER */}
      {overdueCount > 0 && (
        <div style={{
          borderRadius: "12px",
          border: "1px solid rgba(244, 63, 94, 0.4)",
          background: "linear-gradient(135deg, rgba(225, 29, 72, 0.12) 0%, rgba(15, 23, 42, 0.98) 100%)",
          padding: "1rem 1.25rem",
          marginBottom: "1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.85rem",
          boxShadow: "0 8px 30px rgba(244, 63, 94, 0.12)",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Left Glowing Accent Bar */}
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: "#f43f5e", boxShadow: "0 0 10px #f43f5e" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", paddingLeft: "0.35rem" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "rgba(244, 63, 94, 0.15)", border: "1px solid rgba(244, 63, 94, 0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              <AlertTriangle size={20} color="#f43f5e" />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: "#ffffff", fontSize: "0.925rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                MỤC CẢNH BÁO: Có {overdueCount} dự trù quá 5 ngày chưa chuyển sang Đang thực hiện
              </div>
              <div style={{ color: "#ffe4e6", fontSize: "0.825rem", marginTop: "0.2rem", opacity: 0.9 }}>
                Các dự trù này đang bị tạm dừng ở bước Khởi tạo. Vui lòng kiểm tra và đôn đốc bộ phận liên quan.
              </div>
            </div>
          </div>

          <Link
            href="/admin/proposals?status=overdue"
            style={{
              background: "linear-gradient(135deg, #f43f5e, #e11d48)",
              color: "#ffffff",
              boxShadow: "0 4px 14px rgba(244, 63, 94, 0.35)",
              border: "none",
              fontWeight: 700,
              fontSize: "0.8rem",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease"
            }}
          >
            <AlertTriangle size={15} /> Xem ngay {overdueCount} dự trù trễ →
          </Link>
        </div>
      )}

      {/* Mini Stats (Clickable filters) */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <Link href="/admin/proposals" className="stat-mini" style={{ textDecoration: "none", cursor: "pointer", border: !statusFilter ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.08)", background: !statusFilter ? "rgba(56,189,248,0.18)" : "rgba(30,41,59,0.7)" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#38bdf8" }} />
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Tổng cộng</span>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#ffffff" }}>{totalProposals}</span>
        </Link>
        <Link href="/admin/proposals?status=init" className="stat-mini" style={{ textDecoration: "none", cursor: "pointer", border: statusFilter === "init" ? "1px solid #fbbf24" : "1px solid rgba(255,255,255,0.08)", background: statusFilter === "init" ? "rgba(251,191,36,0.18)" : "rgba(30,41,59,0.7)" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fbbf24" }} />
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Khởi tạo</span>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fbbf24" }}>{initCount}</span>
        </Link>
        <Link href="/admin/proposals?status=locked" className="stat-mini" style={{ textDecoration: "none", cursor: "pointer", border: statusFilter === "locked" ? "1px solid #a855f7" : "1px solid rgba(255,255,255,0.08)", background: statusFilter === "locked" ? "rgba(168,85,247,0.18)" : "rgba(30,41,59,0.7)" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a855f7" }} />
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Đang thực hiện</span>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#c084fc" }}>{lockedCount}</span>
        </Link>
        <Link href="/admin/proposals?status=completed" className="stat-mini" style={{ textDecoration: "none", cursor: "pointer", border: statusFilter === "completed" ? "1px solid #34d399" : "1px solid rgba(255,255,255,0.08)", background: statusFilter === "completed" ? "rgba(52,211,153,0.18)" : "rgba(30,41,59,0.7)" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34d399" }} />
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Hoàn thành</span>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#34d399" }}>{completedCount}</span>
        </Link>
        <Link
          href="/admin/proposals?status=overdue"
          className="stat-mini"
          style={{
            textDecoration: "none",
            cursor: "pointer",
            border: statusFilter === "overdue" ? "1px solid #f43f5e" : "1px solid rgba(244,63,94,0.4)",
            background: statusFilter === "overdue" ? "rgba(244,63,94,0.25)" : "rgba(244,63,94,0.1)",
          }}
        >
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f43f5e", boxShadow: "0 0 8px #f43f5e" }} />
          <span style={{ fontSize: "0.8rem", color: "#fca5a5", fontWeight: 600 }}>Quá 5 ngày chưa làm</span>
          <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#f43f5e" }}>{overdueCount}</span>
        </Link>
      </div>



      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "0.75rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", flex: 1 }}>
          <SearchInput placeholder="Tìm theo tên trường học..." />
          <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>
            Hiển thị tối đa: {limitedProposals.length} / {displayProposals.length} hồ sơ
          </span>
        </div>
        <ProposalFilters
          sales={sales}
          currentSaleId={saleId}
          currentLatest={latest}
          currentBudget={budget}
          currentLock={statusFilter}
          currentProject={projectFilter}
        />
      </div>

      <div className="card table-container" style={{ padding: 0, overflow: "visible", borderRadius: "12px" }}>
        <table className="table table-hover" style={{ tableLayout: "fixed", width: "100%", margin: 0 }}>
          <colgroup>
            <col style={{ width: "5%" }} />
            <col style={{ width: "22%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <thead>
            <tr>
              <th style={{ width: "50px", textAlign: "center", paddingLeft: "0.75rem" }}>STT</th>
              <th>Trường học</th>
              <th>Nhân viên Sale</th>
              <th>Ngày lập</th>
              <th style={{ textAlign: "right" }}>Chênh lệch</th>
              <th style={{ textAlign: "center" }}>Trạng thái</th>
              <th style={{ textAlign: "right", paddingRight: "1.25rem" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {limitedProposals.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "3rem 2rem", textAlign: "center", color: "#64748b" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(56,189,248,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                    <Building2 size={24} color="#38bdf8" />
                  </div>
                  <p style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: 500, margin: "0 0 0.25rem" }}>Không tìm thấy hồ sơ nào phù hợp</p>
                  <p style={{ color: "#475569", fontSize: "0.8rem", margin: 0 }}>Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </td>
              </tr>
            ) : (
              limitedProposals.map((p: any, idx: number) => {
                const delta = Number(p.allocatedBudget) - Number(p.investedBudget);
                
                const createdTime = new Date(p.createdAt).getTime();
                const isOverdue = p.status !== "COMPLETED" && p.status !== "APPROVED" && (nowTime - createdTime) >= FIVE_DAYS_MS;
                const daysStalled = Math.floor((nowTime - createdTime) / (24 * 60 * 60 * 1000));

                const serializedProposal = {
                  ...p,
                  allocatedBudget: Number(p.allocatedBudget),
                  investedBudget: Number(p.investedBudget)
                };

                return (
                  <tr key={p.id} className="proposal-row" style={isOverdue ? { background: "rgba(244, 63, 94, 0.03)" } : {}}>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "#94a3b8", paddingLeft: "0.75rem" }}>
                      {(page - 1) * pageSize + idx + 1}
                    </td>
                    <td style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                      <div className="school-name">
                        <Building2 size={14} color="#64748b" style={{ flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{p.school?.name}</span>
                        <span style={{
                          fontSize: "0.68rem", fontWeight: 800, padding: "2px 7px", borderRadius: "6px",
                          border: "1px solid", marginLeft: "0.35rem", display: "inline-flex", alignItems: "center", flexShrink: 0,
                          borderColor: (p.projectName || "IPRO") === "ICLASS" ? "#a855f7" : (p.projectName || "IPRO") === "IGEN" ? "#f59e0b" : (p.projectName || "IPRO") === "ILINK" ? "#10b981" : "#38bdf8",
                          color: (p.projectName || "IPRO") === "ICLASS" ? "#a855f7" : (p.projectName || "IPRO") === "IGEN" ? "#f59e0b" : (p.projectName || "IPRO") === "ILINK" ? "#34d399" : "#38bdf8",
                          background: (p.projectName || "IPRO") === "ICLASS" ? "rgba(168,85,247,0.12)" : (p.projectName || "IPRO") === "IGEN" ? "rgba(245,158,11,0.12)" : (p.projectName || "IPRO") === "ILINK" ? "rgba(16,185,129,0.12)" : "rgba(56,189,248,0.12)"
                        }}>
                          {p.projectName || "IPRO"}
                        </span>
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
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#94a3b8", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                          <Calendar size={13} color="#475569" />
                          {new Date(p.createdAt).toLocaleString("vi-VN", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </div>
                        {isOverdue && (
                          <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#fb7185", background: "rgba(244,63,94,0.15)", border: "1px solid rgba(244,63,94,0.3)", padding: "0.1rem 0.4rem", borderRadius: "6px", width: "fit-content" }}>
                            🔥 Quá {daysStalled} ngày chưa làm
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <span className={`delta-chip ${delta >= 0 ? "delta-positive" : "delta-negative"}`}>
                        {delta >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        {delta >= 0 ? "+" : ""}{delta.toLocaleString()} đ
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <ProposalStatusSelect proposal={serializedProposal} isSysAdmin={isSysAdmin} />
                    </td>
                    <td style={{ textAlign: "right", paddingRight: "1.25rem" }}>
                      <ProposalRowActions proposal={serializedProposal} isSuperAdmin={isSuperAdmin} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
}
