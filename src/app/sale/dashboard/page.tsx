import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCachedData } from "@/lib/cache";
import SaleDashboardCharts from "./SaleDashboardCharts";
import { 
  Building2, FileText, Coins, Wallet, TrendingUp, TrendingDown, 
  AlertTriangle, CheckCircle2, Eye, Pencil, Plus, Clock, Lock 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SaleDashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  const [schools, catalogInvestments] = await Promise.all([
    prisma.school.findMany({
      where: { saleId: userId },
      include: {
        proposals: {
          orderBy: { updatedAt: "desc" },
          take: 1,
          include: {
            items: true,
            investments: true,
          }
        }
      }
    }),
    prisma.otherInvestment.findMany({ select: { name: true, category: true } })
  ]);

  const isConstructionItemName = (name: string) => {
    const catalog = catalogInvestments.find(c => c.name === name);
    if (catalog?.category === "CONSTRUCTION") return true;
    const lower = (name || "").toLowerCase();
    return lower.startsWith("gói thi công") || lower.startsWith("gói bảo trì") || lower.startsWith("gói hệ thống");
  };

  const proposals = schools
    .map(s => s.proposals[0] ? { ...s.proposals[0], school: s } : null)
    .filter(Boolean) as NonNullable<any>[];

  const totalSchools = schools.length;
  const totalProposals = proposals.length;
  const totalNewStudents = schools.reduce((sum, s) => sum + Number(s.newStudents || 0), 0);

  let initCount = 0;
  let lockedCount = 0;
  let completedCount = 0;

  let totalAllocated = 0;
  let totalInvested = 0;
  let totalItemCost = 0;
  let totalConstrCost = 0;
  let totalOtherCost = 0;

  const schoolBudgets: Array<{ name: string; allocated: number; invested: number; delta: number }> = [];

  proposals.forEach(p => {
    const allocated = Number(p.allocatedBudget);
    const invested = Number(p.investedBudget);

    totalAllocated += allocated;
    totalInvested += invested;

    (p.items || []).forEach((item: any) => {
      totalItemCost += Number(item.totalPrice || 0);
    });

    (p.investments || []).forEach((inv: any) => {
      if (isConstructionItemName(inv.name)) {
        totalConstrCost += Number(inv.totalPrice || 0);
      } else {
        totalOtherCost += Number(inv.totalPrice || 0);
      }
    });

    if (p.status === "COMPLETED") {
      completedCount++;
    } else if (p.school?.isLocked || p.status === "APPROVED") {
      lockedCount++;
    } else {
      initCount++;
    }

    schoolBudgets.push({
      name: p.school.name,
      allocated,
      invested,
      delta: allocated - invested,
    });
  });

  const delta = totalAllocated - totalInvested;

  const negativeSchools = proposals.filter(p => Number(p.allocatedBudget) < Number(p.investedBudget));
  const positiveSchools = proposals.filter(p => Number(p.allocatedBudget) >= Number(p.investedBudget));

  return (
    <div style={{ animation: "fadeIn 0.25s ease-out" }}>
      {/* Compact Top Header Banner */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "center", marginBottom: "1.25rem" }}>
        {/* Left: Compact Welcome Header (Sub-text removed as requested) */}
        <div className="sale-hero-banner" style={{ margin: 0, padding: "0.85rem 1.25rem", display: "flex", alignItems: "center" }}>
          <h1 className="hero-title" style={{ margin: 0, fontSize: "1.25rem" }}>
            Dashboard Cá nhân Kinh doanh 🚀
          </h1>
        </div>

        {/* Right: Compact Dedicated Create Proposal Box */}
        <div style={{
          background: "linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)",
          border: "1.5px solid rgba(6, 182, 212, 0.4)",
          borderRadius: "14px",
          padding: "0.6rem 1rem",
          display: "flex",
          alignItems: "center",
          boxShadow: "0 6px 20px rgba(6, 182, 212, 0.15)",
        }}>
          <Link 
            href="/sale/proposals/new" 
            prefetch={true} 
            className="btn-cta-primary" 
            style={{ 
              whiteSpace: "nowrap", 
              padding: "0.55rem 1.15rem", 
              fontSize: "0.85rem"
            }}
          >
            <Plus size={17} /> Bắt đầu lập dự trù mới
          </Link>
        </div>
      </div>

      {/* SECTION 1: THÔNG TIN CHUNG (5 Thẻ mét vuông vức) */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h2 style={{ fontSize: "0.8rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.85rem" }}>
          Thông tin chung
        </h2>
        <div className="sale-metric-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
          {/* Metric 1: Trường Quản Lý */}
          <div className="sale-metric-card">
            <div className="metric-header">
              <span className="metric-label">Trường Quản Lý</span>
              <div className="metric-icon-box" style={{ background: "rgba(6, 182, 212, 0.12)", color: "#06b6d4" }}>
                <Building2 size={18} />
              </div>
            </div>
            <div className="metric-value">{totalSchools}</div>
            <div className="metric-sub" style={{ color: "#94a3b8" }}>
              Phân công phụ trách
            </div>
          </div>

          {/* Metric 2: Dự Trù Đã Lập */}
          <div className="sale-metric-card">
            <div className="metric-header">
              <span className="metric-label">Dự Trù Đã Lập</span>
              <div className="metric-icon-box" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#818cf8" }}>
                <FileText size={18} />
              </div>
            </div>
            <div className="metric-value" style={{ color: "#818cf8" }}>{totalProposals}</div>
            <div className="metric-sub" style={{ color: "#94a3b8" }}>
              Tổng hồ sơ dự trù
            </div>
          </div>

          {/* Metric 3: Khởi Tạo */}
          <div className="sale-metric-card">
            <div className="metric-header">
              <span className="metric-label">Khởi Tạo</span>
              <div className="metric-icon-box" style={{ background: "rgba(251, 146, 60, 0.12)", color: "#fb923c" }}>
                <Clock size={18} />
              </div>
            </div>
            <div className="metric-value" style={{ color: "#fb923c" }}>{initCount}</div>
            <div className="metric-sub" style={{ color: "#fb923c" }}>
              Hồ sơ đang tạo mới
            </div>
          </div>

          {/* Metric 4: Đang Thực Hiện */}
          <div className="sale-metric-card">
            <div className="metric-header">
              <span className="metric-label">Đang Thực Hiện</span>
              <div className="metric-icon-box" style={{ background: "rgba(244, 63, 94, 0.12)", color: "#fb7185" }}>
                <Lock size={18} />
              </div>
            </div>
            <div className="metric-value" style={{ color: "#fb7185" }}>{lockedCount}</div>
            <div className="metric-sub" style={{ color: "#fb7185" }}>
              Đã khóa & đang xử lý
            </div>
          </div>

          {/* Metric 5: Hoàn Thành */}
          <div className="sale-metric-card">
            <div className="metric-header">
              <span className="metric-label">Hoàn Thành</span>
              <div className="metric-icon-box" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#34d399" }}>
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="metric-value" style={{ color: "#34d399" }}>{completedCount}</div>
            <div className="metric-sub" style={{ color: "#34d399" }}>
              Đã bàn giao nghiệm thu
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: BIỂU ĐỒ TRỰC QUAN (Biểu đồ Phân bổ & Ngân sách) */}
      <SaleDashboardCharts 
        stats={{
          totalSchools, totalProposals, initCount, lockedCount, completedCount,
          totalAllocated, totalInvested, totalItemCost, totalConstrCost, totalOtherCost, totalNewStudents, delta
        }}
        schoolBudgets={schoolBudgets}
      />

      {/* SECTION 3: TỔNG QUAN NGÂN SÁCH (Đã đưa xuống bên dưới Biểu đồ) */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h2 style={{ fontSize: "0.8rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.85rem" }}>
          Tổng quan Ngân sách
        </h2>
        <div className="sale-metric-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {/* Metric 6: Ngân sách Cấp */}
          <div className="sale-metric-card">
            <div className="metric-header">
              <span className="metric-label">Ngân Sách Cấp</span>
              <div className="metric-icon-box" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
                <Coins size={18} />
              </div>
            </div>
            <div className="metric-value" style={{ color: "#34d399", fontSize: "1.25rem", whiteSpace: "nowrap" }}>
              {totalAllocated.toLocaleString()} đ
            </div>
            <div className="metric-sub" style={{ color: "#34d399", whiteSpace: "nowrap" }}>
              <TrendingUp size={13} /> Định mức giao kinh phí
            </div>
          </div>

          {/* Metric 7: Ngân sách Đã Đầu Tư */}
          <div className="sale-metric-card">
            <div className="metric-header">
              <span className="metric-label">Ngân Sách Đã Đầu Tư</span>
              <div className="metric-icon-box" style={{ background: "rgba(251, 191, 36, 0.12)", color: "#fbbf24" }}>
                <Wallet size={18} />
              </div>
            </div>
            <div className="metric-value" style={{ color: "#fbbf24", fontSize: "1.25rem", whiteSpace: "nowrap" }}>
              {totalInvested.toLocaleString()} đ
            </div>
            
            {/* Explicit 3 Cost Breakdown Sub-Lines */}
            <div style={{ marginTop: "0.6rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.72rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#38bdf8", fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#38bdf8" }}></span> Thiết bị:
                </span>
                <strong style={{ color: "#ffffff" }}>{totalItemCost.toLocaleString()} đ</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#a855f7", fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7" }}></span> Đầu tư khác:
                </span>
                <strong style={{ color: "#ffffff" }}>{totalOtherCost.toLocaleString()} đ</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#f59e0b", fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }}></span> Thi công:
                </span>
                <strong style={{ color: "#ffffff" }}>{totalConstrCost.toLocaleString()} đ</strong>
              </div>
            </div>
          </div>

          {/* Metric 8: Chênh lệch Ngân sách */}
          <div className="sale-metric-card">
            <div className="metric-header">
              <span className="metric-label">Chênh Lệch Ngân Sách</span>
              <div className="metric-icon-box" style={{ 
                background: delta >= 0 ? "rgba(16, 185, 129, 0.12)" : "rgba(244, 63, 94, 0.12)", 
                color: delta >= 0 ? "#10b981" : "#f43f5e" 
              }}>
                {delta >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              </div>
            </div>
            <div className="metric-value" style={{ color: delta >= 0 ? "#34d399" : "#fb7185", fontSize: "1.25rem", whiteSpace: "nowrap" }}>
              {delta >= 0 ? "+" : ""}{delta.toLocaleString()} đ
            </div>
            <div className="metric-sub" style={{ color: delta >= 0 ? "#34d399" : "#fb7185", whiteSpace: "nowrap" }}>
              {delta >= 0 ? "✓ Tiết kiệm ngân sách" : "⚠️ Vượt định mức kinh phí"}
            </div>
          </div>
        </div>
      </div>

      {/* Budget Status Split View */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
        
        {/* Negative Warning Column */}
        <div className="sale-table-card" style={{ borderTop: "3px solid #f43f5e" }}>
          <div style={{ padding: "1.1rem 1.25rem", borderBottom: "1px solid var(--sale-card-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertTriangle size={18} color="#f43f5e" />
              <h2 style={{ fontSize: "1rem", fontWeight: 800, margin: 0, color: "#f43f5e" }}>
                Cảnh báo Vượt Định mức ({negativeSchools.length})
              </h2>
            </div>
            <span style={{ fontSize: "0.72rem", background: "rgba(244, 63, 94, 0.15)", color: "#fb7185", padding: "0.2rem 0.5rem", borderRadius: "6px", fontWeight: 700 }}>
              Cần tối ưu
            </span>
          </div>

          <div style={{ padding: "0.75rem 1.25rem" }}>
            {negativeSchools.length === 0 ? (
              <div style={{ padding: "2rem 1rem", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
                🎉 Tuyệt vời! Tất cả trường học đều nằm trong hạn mức kinh phí cho phép.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {negativeSchools.map(p => {
                  const negDelta = Number(p.allocatedBudget) - Number(p.investedBudget);
                  const isLocked = p.status === "APPROVED" || p.status === "COMPLETED" || p.school?.isLocked;
                  return (
                    <div key={p.id} style={{
                      background: "rgba(244, 63, 94, 0.05)",
                      border: "1px solid rgba(244, 63, 94, 0.2)",
                      borderRadius: "10px",
                      padding: "0.85rem 1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.75rem"
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "#ffffff", fontSize: "0.9rem", marginBottom: "0.2rem" }}>
                          {p.school.name}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#fb7185", fontWeight: 700 }}>
                          Vượt: {negDelta.toLocaleString()} VNĐ
                        </div>
                      </div>

                      {!isLocked ? (
                        <Link 
                          href={`/sale/proposals/new?schoolId=${p.schoolId}`}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: "0.3rem",
                            fontSize: "0.78rem", padding: "0.35rem 0.65rem", borderRadius: "6px",
                            background: "rgba(251, 191, 36, 0.12)", color: "#fbbf24",
                            border: "1px solid rgba(251, 191, 36, 0.3)",
                            textDecoration: "none", fontWeight: 700, whiteSpace: "nowrap"
                          }}
                        >
                          <Pencil size={13} /> Sửa dự trù
                        </Link>
                      ) : (
                        <Link 
                          href={`/sale/proposals/${p.id}`}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: "0.3rem",
                            fontSize: "0.78rem", padding: "0.35rem 0.65rem", borderRadius: "6px",
                            background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8",
                            border: "1px solid rgba(56, 189, 248, 0.3)",
                            textDecoration: "none", fontWeight: 700, whiteSpace: "nowrap"
                          }}
                        >
                          <Eye size={13} /> Xem
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Positive Surplus Column */}
        <div className="sale-table-card" style={{ borderTop: "3px solid #10b981" }}>
          <div style={{ padding: "1.1rem 1.25rem", borderBottom: "1px solid var(--sale-card-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle2 size={18} color="#10b981" />
              <h2 style={{ fontSize: "1rem", fontWeight: 800, margin: 0, color: "#10b981" }}>
                Ngân sách An toàn ({positiveSchools.length})
              </h2>
            </div>
            <span style={{ fontSize: "0.72rem", background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "0.2rem 0.5rem", borderRadius: "6px", fontWeight: 700 }}>
              Đạt chuẩn
            </span>
          </div>

          <div style={{ padding: "0.75rem 1.25rem" }}>
            {positiveSchools.length === 0 ? (
              <div style={{ padding: "2rem 1rem", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
                Chưa có hồ sơ nào trong ngân sách an toàn.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {positiveSchools.map(p => {
                  const posDelta = Number(p.allocatedBudget) - Number(p.investedBudget);
                  return (
                    <div key={p.id} style={{
                      background: "rgba(16, 185, 129, 0.05)",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                      borderRadius: "10px",
                      padding: "0.85rem 1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.75rem"
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "#ffffff", fontSize: "0.9rem", marginBottom: "0.2rem" }}>
                          {p.school.name}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#34d399", fontWeight: 700 }}>
                          Dư: +{posDelta.toLocaleString()} VNĐ
                        </div>
                      </div>

                      <Link 
                        href={`/sale/proposals/${p.id}`}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "0.3rem",
                          fontSize: "0.78rem", padding: "0.35rem 0.65rem", borderRadius: "6px",
                          background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8",
                          border: "1px solid rgba(56, 189, 248, 0.3)",
                          textDecoration: "none", fontWeight: 700, whiteSpace: "nowrap"
                        }}
                      >
                        <Eye size={13} /> Xem
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
