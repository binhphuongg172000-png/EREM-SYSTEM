"use client";

import React, { useState, useMemo } from "react";
import {
  Building2, FileText, Layers, CheckCircle2, AlertTriangle, Sparkles,
  Users, Globe, Calculator, GraduationCap, TrendingUp, TrendingDown,
  Laptop, Coins, Wrench
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────
export type ProjectCostStat = {
  projectKey: "IPRO" | "ICLASS" | "IGEN" | "ILINK";
  projectName: string;
  color: string;
  bg: string;
  border: string;
  badgeBg: string;
  schoolCount: number;
  proposalCount: number;
  studentCount: number;
  totalAllocated: number;
  totalInvested: number;
  itemCost: number;
  otherCost: number;
  constrCost: number;
  delta: number;
  usagePercentage: number;
};

export type SaleProjectDetail = ProjectCostStat;

export type SaleCostStat = {
  saleId: string;
  saleName: string;
  email?: string;
  totalAllocated: number;
  totalInvested: number;
  totalSchools: number;
  totalProposals: number;
  totalStudents: number;
  projectStats: SaleProjectDetail[];
};

// ─── Utilities ────────────────────────────────────────────────────────
const fmtMoney = (val: number) => (val || 0).toLocaleString("vi-VN");
const fmtShort = (val: number) => {
  if (!val || val === 0) return "0đ";
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}T`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
  return `${val}đ`;
};

function sumField(arr: ProjectCostStat[], key: keyof ProjectCostStat) {
  return arr.reduce((s, p) => s + (Number(p[key]) || 0), 0);
}

// ─── Style Constants ──────────────────────────────────────────────────
const S = {
  card: (borderColor: string): React.CSSProperties => ({
    background: "rgba(15, 23, 42, 0.75)",
    padding: "1rem 1.15rem",
    borderRadius: "14px",
    border: `1px solid ${borderColor}`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: "all 0.2s ease",
  }),
  cardTitle: (color: string): React.CSSProperties => ({
    fontSize: "0.78rem",
    fontWeight: 800,
    color,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: "0.7rem",
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
  }),
  row: {
    display: "grid",
    alignItems: "center",
    background: "rgba(30, 41, 59, 0.4)",
    padding: "0.3rem 0.55rem",
    borderRadius: "7px",
  } as React.CSSProperties,
  badge: (p: ProjectCostStat): React.CSSProperties => ({
    color: p.color,
    background: p.badgeBg,
    padding: "0.1rem 0.4rem",
    borderRadius: "5px",
    fontSize: "0.7rem",
    fontWeight: 800,
    border: `1px solid ${p.border}`,
  }),
  hsBadge: {
    background: "rgba(56, 189, 248, 0.12)",
    border: "1px solid rgba(56, 189, 248, 0.3)",
    borderRadius: "14px",
    padding: "0.08rem 0.4rem",
    color: "#38bdf8",
    fontWeight: 800,
    fontSize: "0.68rem",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.15rem",
  } as React.CSSProperties,
  footer: {
    borderTop: "1px dashed rgba(255, 255, 255, 0.15)",
    paddingTop: "0.55rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  } as React.CSSProperties,
  totalValue: (color: string): React.CSSProperties => ({
    whiteSpace: "nowrap",
    fontSize: "1.1rem",
    fontWeight: 900,
    color,
  }),
  blink: (isNeg: boolean): React.CSSProperties => ({
    animation: isNeg ? "blinkRed 2.2s ease-in-out infinite" : "none",
  }),
};

// ─── Reusable Sub-Components ─────────────────────────────────────────

function BudgetCard({ projects, totalAllocated, totalStudents }: {
  projects: ProjectCostStat[];
  totalAllocated: number;
  totalStudents: number;
}) {
  return (
    <div style={S.card("rgba(52, 211, 153, 0.3)")}>
      <div>
        <div style={S.cardTitle("#34d399")}>
          <Calculator size={14} /> 1. NGÂN SÁCH CẤP
        </div>
        <div style={{ fontSize: "0.78rem", color: "#cbd5e1", display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "0.7rem" }}>
          {projects.map(p => (
            <div key={p.projectKey} style={{ ...S.row, gridTemplateColumns: "72px 85px 1fr" }}>
              <div><strong style={S.badge(p)}>{p.projectKey}</strong></div>
              <div style={{ textAlign: "center" }}>
                <span style={S.hsBadge}>
                  <GraduationCap size={10} /> {fmtMoney(p.studentCount)} HS
                </span>
              </div>
              <div style={{ fontWeight: 700, whiteSpace: "nowrap", color: "#34d399", textAlign: "right", fontSize: "0.78rem" }}>
                {fmtMoney(p.totalAllocated)} đ
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={S.footer}>
        <span style={{ ...S.hsBadge, padding: "0.15rem 0.5rem", fontWeight: 900, fontSize: "0.72rem", border: "1px solid rgba(56, 189, 248, 0.4)", background: "rgba(56, 189, 248, 0.15)" }}>
          <GraduationCap size={12} /> {fmtMoney(totalStudents)} HS
        </span>
        <span style={S.totalValue("#34d399")}>{fmtMoney(totalAllocated)} đ</span>
      </div>
    </div>
  );
}

function InvestmentCard({ projects, totalInvested, totalItemCost, totalOtherCost, totalConstrCost }: {
  projects: ProjectCostStat[];
  totalInvested: number;
  totalItemCost: number;
  totalOtherCost: number;
  totalConstrCost: number;
}) {
  return (
    <div style={S.card("rgba(251, 191, 36, 0.3)")}>
      <div>
        <div style={S.cardTitle("#fbbf24")}>
          <Calculator size={14} /> 2. ĐẦU TƯ CHI TIẾT
        </div>
        <div style={{ fontSize: "0.78rem", color: "#cbd5e1", display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "0.7rem" }}>
          {projects.map(p => (
            <div key={p.projectKey} style={{ ...S.row, gridTemplateColumns: "72px 1fr auto" }}>
              <div><strong style={S.badge(p)}>{p.projectKey}</strong></div>
              <div style={{ fontSize: "0.68rem", color: "#94a3b8", display: "flex", gap: "0.4rem", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#38bdf8", display: "inline-flex", alignItems: "center", gap: "0.15rem" }}>
                  <Laptop size={11} />{fmtShort(p.itemCost)}
                </span>
                <span style={{ color: "#c084fc", display: "inline-flex", alignItems: "center", gap: "0.15rem" }}>
                  <Coins size={11} />{fmtShort(p.otherCost)}
                </span>
                <span style={{ color: "#fbbf24", display: "inline-flex", alignItems: "center", gap: "0.15rem" }}>
                  <Wrench size={11} />{fmtShort(p.constrCost)}
                </span>
              </div>
              <div style={{ fontWeight: 700, whiteSpace: "nowrap", color: "#fbbf24", textAlign: "right", fontSize: "0.78rem" }}>
                {fmtMoney(p.totalInvested)} đ
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={S.footer}>
        <div style={{ display: "flex", gap: "0.45rem", fontSize: "0.72rem", color: "#cbd5e1" }}>
          <span style={{ color: "#38bdf8", display: "inline-flex", alignItems: "center", gap: "0.2rem", fontWeight: 700 }}>
            <Laptop size={12} /> {fmtShort(totalItemCost)}
          </span>
          <span style={{ color: "#c084fc", display: "inline-flex", alignItems: "center", gap: "0.2rem", fontWeight: 700 }}>
            <Coins size={12} /> {fmtShort(totalOtherCost)}
          </span>
          <span style={{ color: "#fbbf24", display: "inline-flex", alignItems: "center", gap: "0.2rem", fontWeight: 700 }}>
            <Wrench size={12} /> {fmtShort(totalConstrCost)}
          </span>
        </div>
        <span style={S.totalValue("#fbbf24")}>{fmtMoney(totalInvested)} đ</span>
      </div>
    </div>
  );
}

function DeltaCard({ projects, totalDelta, totalUsage }: {
  projects: ProjectCostStat[];
  totalDelta: number;
  totalUsage: number;
}) {
  const isGrandNeg = totalDelta < 0;
  return (
    <div style={S.card("rgba(129, 140, 248, 0.3)")}>
      <div>
        <div style={S.cardTitle("#818cf8")}>
          <Sparkles size={14} /> 3. CHÊNH LỆCH NGÂN SÁCH
        </div>
        <div style={{ fontSize: "0.78rem", color: "#cbd5e1", display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "0.7rem" }}>
          {projects.map(p => {
            const delta = p.delta || 0;
            const isNeg = delta < 0;
            return (
              <div key={p.projectKey} style={{ ...S.row, gridTemplateColumns: "72px 100px 1fr" }}>
                <div><strong style={S.badge(p)}>{p.projectKey}</strong></div>
                <div style={{ fontSize: "0.72rem", fontWeight: 900, textAlign: "center", color: isNeg ? "#ff4d6d" : p.color, ...S.blink(isNeg) }}>
                  {isNeg ? "-" : ""}{p.usagePercentage || 0}%
                </div>
                <div style={{ fontSize: "0.82rem", fontWeight: 900, whiteSpace: "nowrap", color: isNeg ? "#ff4d6d" : "#34d399", textAlign: "right", ...S.blink(isNeg) }}>
                  {isNeg ? "" : "+"}{delta.toLocaleString("vi-VN")} đ
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={S.footer}>
        <span style={{ fontSize: "0.75rem", color: "#cbd5e1" }}>
          Giải ngân:{" "}
          <strong style={{ fontSize: "0.9rem", color: isGrandNeg ? "#ff4d6d" : "#818cf8", ...S.blink(isGrandNeg) }}>
            {isGrandNeg ? "-" : ""}{totalUsage}%
          </strong>
        </span>
        <span style={{ ...S.totalValue(isGrandNeg ? "#ff4d6d" : "#34d399"), ...S.blink(isGrandNeg) }}>
          {isGrandNeg ? "" : "+"}{fmtMoney(totalDelta)} đ
        </span>
      </div>
    </div>
  );
}

function BannerSection({ projects, schoolCount, proposalCount, studentCount, headerContent }: {
  projects: ProjectCostStat[];
  schoolCount: number;
  proposalCount: number;
  studentCount: number;
  headerContent: React.ReactNode;
}) {
  const totals = useMemo(() => ({
    allocated: sumField(projects, "totalAllocated"),
    invested: sumField(projects, "totalInvested"),
    itemCost: sumField(projects, "itemCost"),
    otherCost: sumField(projects, "otherCost"),
    constrCost: sumField(projects, "constrCost"),
  }), [projects]);

  const delta = totals.allocated - totals.invested;
  const usage = totals.allocated > 0 ? Math.round((totals.invested / totals.allocated) * 100) : 0;

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(49, 46, 129, 0.55))",
      backdropFilter: "blur(16px)",
      borderRadius: "16px",
      border: "1px solid rgba(129, 140, 248, 0.35)",
      padding: "1.15rem 1.35rem",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.75rem",
        marginBottom: "1rem",
        paddingBottom: "0.75rem",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}>
        {headerContent}
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", fontSize: "0.82rem", color: "#cbd5e1" }}>
          <span style={{ fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            <Building2 size={14} color="#a5b4fc" /> {schoolCount}
          </span>
          <span style={{ color: "#475569" }}>•</span>
          <span style={{ fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            <FileText size={14} color="#818cf8" /> {proposalCount}
          </span>
          <span style={{ color: "#475569" }}>•</span>
          <span style={{
            background: "rgba(56, 189, 248, 0.12)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            padding: "0.15rem 0.55rem",
            borderRadius: "16px",
            color: "#38bdf8",
            fontWeight: 800,
            fontSize: "0.78rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
          }}>
            <GraduationCap size={13} /> {fmtMoney(studentCount)} HS
          </span>
        </div>
      </div>

      {/* 3 Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        <BudgetCard projects={projects} totalAllocated={totals.allocated} totalStudents={studentCount} />
        <InvestmentCard projects={projects} totalInvested={totals.invested} totalItemCost={totals.itemCost} totalOtherCost={totals.otherCost} totalConstrCost={totals.constrCost} />
        <DeltaCard projects={projects} totalDelta={delta} totalUsage={usage} />
      </div>
    </div>
  );
}

// ─── Compact Project Card ─────────────────────────────────────────────
function ProjectCard({ proj }: { proj: ProjectCostStat }) {
  const isNeg = (proj.delta || 0) < 0;
  const usage = proj.usagePercentage || 0;

  return (
    <div style={{
      background: "rgba(30, 41, 59, 0.65)",
      backdropFilter: "blur(12px)",
      borderRadius: "14px",
      border: `1.5px solid ${proj.border}`,
      padding: "1rem 1.15rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
      boxShadow: "0 6px 16px -4px rgba(0, 0, 0, 0.25)",
      transition: "all 0.2s ease",
    }}>
      {/* Header: Badge + Stats */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{
            fontSize: "0.85rem", fontWeight: 900,
            padding: "0.3rem 0.75rem", borderRadius: "8px",
            background: proj.badgeBg, color: proj.color,
            border: `1px solid ${proj.border}`,
          }}>
            {proj.projectKey}
          </span>
          <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#ffffff" }}>
            {proj.projectName}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.72rem", color: "#64748b" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.15rem" }}>
            <Building2 size={12} color={proj.color} /> {proj.schoolCount || 0}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.15rem" }}>
            <FileText size={12} color="#818cf8" /> {proj.proposalCount || 0}
          </span>
          <span style={{ ...S.hsBadge, fontSize: "0.65rem", padding: "0.05rem 0.35rem" }}>
            <GraduationCap size={10} /> {fmtMoney(proj.studentCount)}
          </span>
        </div>
      </div>

      {/* Budget Row: Cấp | Đầu tư | Chênh lệch – tất cả trên 1 hàng */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "0.5rem",
      }}>
        {/* Ngân sách cấp */}
        <div style={{
          background: "rgba(15, 23, 42, 0.5)",
          padding: "0.55rem 0.65rem",
          borderRadius: "10px",
          borderLeft: "3px solid #34d399",
        }}>
          <div style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Ngân sách cấp
          </div>
          <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#34d399", marginTop: "0.15rem", whiteSpace: "nowrap" }}>
            {fmtMoney(proj.totalAllocated)} <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>đ</span>
          </div>
        </div>

        {/* Đã đầu tư */}
        <div style={{
          background: "rgba(15, 23, 42, 0.5)",
          padding: "0.55rem 0.65rem",
          borderRadius: "10px",
          borderLeft: "3px solid #fbbf24",
        }}>
          <div style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Đã đầu tư
          </div>
          <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#fbbf24", marginTop: "0.15rem", whiteSpace: "nowrap" }}>
            {fmtMoney(proj.totalInvested)} <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>đ</span>
          </div>
        </div>

        {/* Chênh lệch */}
        <div style={{
          background: isNeg ? "rgba(255, 26, 64, 0.15)" : "rgba(16, 185, 129, 0.1)",
          padding: "0.55rem 0.65rem",
          borderRadius: "10px",
          borderLeft: `3px solid ${isNeg ? "#ff4d6d" : "#34d399"}`,
        }}>
          <div style={{
            fontSize: "0.62rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "0.2rem",
          }}>
            {isNeg ? <TrendingDown size={10} color="#ff4d6d" /> : <TrendingUp size={10} color="#34d399" />}
            Chênh lệch
          </div>
          <div style={{
            fontSize: "0.88rem", fontWeight: 900,
            color: isNeg ? "#ff4d6d" : "#34d399",
            marginTop: "0.15rem", whiteSpace: "nowrap",
            ...S.blink(isNeg),
          }}>
            {isNeg ? "" : "+"}{fmtMoney(proj.delta)} <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>đ</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
          <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>Giải ngân</span>
          <span style={{
            fontSize: "0.82rem", fontWeight: 900,
            color: isNeg ? "#ff4d6d" : proj.color,
            ...S.blink(isNeg),
          }}>
            {isNeg ? "-" : ""}{usage}%
          </span>
        </div>
        <div style={{ width: "100%", height: "6px", borderRadius: "3px", background: "rgba(255, 255, 255, 0.08)", overflow: "hidden" }}>
          <div style={{
            width: `${Math.min(usage, 100)}%`,
            height: "100%",
            background: isNeg
              ? "linear-gradient(90deg, #ff1a40, #ff4d6d)"
              : `linear-gradient(90deg, ${proj.color}, #34d399)`,
            borderRadius: "3px",
            transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          }} />
        </div>
      </div>

      {/* Cost Breakdown: Horizontal compact with clean Lucide icons */}
      <div style={{
        display: "flex",
        gap: "0.5rem",
        fontSize: "0.72rem",
        padding: "0.45rem 0.65rem",
        background: "rgba(15, 23, 42, 0.5)",
        borderRadius: "8px",
        justifyContent: "space-between",
      }}>
        {[
          { icon: Laptop, label: "Thiết bị", value: proj.itemCost, color: "#38bdf8" },
          { icon: Coins, label: "Khác", value: proj.otherCost, color: "#c084fc" },
          { icon: Wrench, label: "Thi công", value: proj.constrCost, color: "#fbbf24" },
        ].map(item => {
          const IconComp = item.icon;
          return (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <IconComp size={13} color={item.color} />
              <span style={{ color: "#94a3b8", fontSize: "0.68rem" }}>{item.label}:</span>
              <strong style={{ color: item.color, fontWeight: 700 }}>{fmtShort(item.value)}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────

interface ProjectCostDashboardProps {
  projectsData: ProjectCostStat[];
  salesData?: SaleCostStat[];
  title?: string;
  subtitle?: string;
}

export default function ProjectCostDashboard({
  projectsData,
  salesData = [],
  title = "Tổng Quan Chi Phí Theo Từng Dự Án",
  subtitle = "Báo cáo chi tiết định mức ngân sách, thực tế đầu tư và phân rã chi phí theo từng dự án triển khai",
}: ProjectCostDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("ALL");

  const filteredProjects = projectsData.filter(p =>
    activeTab === "ALL" || p.projectKey === activeTab
  );

  const grand = useMemo(() => ({
    schools: sumField(projectsData, "schoolCount"),
    proposals: sumField(projectsData, "proposalCount"),
    students: sumField(projectsData, "studentCount"),
  }), [projectsData]);

  const TABS = [
    { key: "ALL", label: "Tổng quan" },
    { key: "IPRO", label: "IPRO" },
    { key: "ICLASS", label: "ICLASS" },
    { key: "IGEN", label: "IGEN" },
    { key: "ILINK", label: "ILINK" },
  ];

  return (
    <div style={{ animation: "fadeIn 0.25s ease-out" }}>
      <style>{`
        @keyframes blinkRed {
          0%, 100% { color: #ff4d6d; opacity: 1; text-shadow: 0 0 12px rgba(255,77,109,0.95), 0 0 4px rgba(255,255,255,0.9); }
          50% { color: #ff1a40; opacity: 0.85; text-shadow: 0 0 6px rgba(255,26,64,0.7); }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ── Header Bar ─────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, rgba(30, 41, 59, 0.92), rgba(15, 23, 42, 0.96))",
        borderRadius: "14px",
        padding: "1rem 1.35rem",
        marginBottom: "1.25rem",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
        flexWrap: "wrap",
        gap: "0.85rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#ffffff", boxShadow: "0 3px 10px rgba(99, 102, 241, 0.35)",
          }}>
            <Layers size={20} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em" }}>{title}</h1>
            <p style={{ margin: "0.1rem 0 0 0", fontSize: "0.78rem", color: "#64748b" }}>{subtitle}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: "0.25rem",
          background: "rgba(15, 23, 42, 0.6)",
          padding: "0.25rem",
          borderRadius: "10px",
          border: "1px solid rgba(51, 65, 85, 0.6)",
        }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                fontSize: "0.75rem", fontWeight: 700,
                padding: "0.38rem 0.8rem",
                borderRadius: "7px", border: "none", cursor: "pointer",
                background: activeTab === tab.key ? "#4f46e5" : "transparent",
                color: activeTab === tab.key ? "#ffffff" : "#64748b",
                boxShadow: activeTab === tab.key ? "0 2px 6px rgba(79, 70, 229, 0.35)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── GRAND TOTAL BANNER ─────────────────────────── */}
      {activeTab === "ALL" && (
        <div style={{ marginBottom: "1.5rem", animation: "slideUp 0.3s ease-out" }}>
          <BannerSection
            projects={projectsData}
            schoolCount={grand.schools}
            proposalCount={grand.proposals}
            studentCount={grand.students}
            headerContent={
              <span style={{
                padding: "0.38rem 1rem", borderRadius: "8px",
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                color: "#ffffff", fontWeight: 900, fontSize: "0.95rem",
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                boxShadow: "0 3px 10px rgba(99, 102, 241, 0.35)", whiteSpace: "nowrap",
              }}>
                <Globe size={16} /> TỔNG CỘNG 4 DỰ ÁN
              </span>
            }
          />
        </div>
      )}

      {/* ── PROJECT CARDS ─────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
      }}>
        {filteredProjects.map((proj, i) => (
          <div key={proj.projectKey} style={{ animation: `slideUp 0.3s ease-out ${i * 0.05}s both` }}>
            <ProjectCard proj={proj} />
          </div>
        ))}
      </div>

      {/* ── SALES SECTION ─────────────────────────────── */}
      {salesData.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          {/* Section Header */}
          <div style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.92), rgba(15, 23, 42, 0.96))",
            borderRadius: "14px", padding: "0.85rem 1.35rem", marginBottom: "1.25rem",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex", alignItems: "center", gap: "0.7rem",
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "9px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#ffffff", boxShadow: "0 3px 10px rgba(16, 185, 129, 0.25)",
            }}>
              <Users size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#ffffff" }}>
                Thống Kê Theo Nhân Viên Sale
              </h2>
              <p style={{ margin: "0.1rem 0 0 0", fontSize: "0.75rem", color: "#64748b" }}>
                Chi phí, học sinh mới và giải ngân chi tiết của từng nhân viên kinh doanh
              </p>
            </div>
          </div>

          {/* Per-Sale Banners */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {salesData.map((s, i) => {
              const sp = s.projectStats || [];
              const students = s.totalStudents || sumField(sp, "studentCount");
              return (
                <div key={s.saleId} style={{ animation: `slideUp 0.3s ease-out ${i * 0.08}s both` }}>
                  <BannerSection
                    projects={sp}
                    schoolCount={s.totalSchools}
                    proposalCount={s.totalProposals}
                    studentCount={students}
                    headerContent={
                      <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                        <div style={{
                          width: "40px", height: "40px", borderRadius: "50%",
                          background: "linear-gradient(135deg, #6366f1, #a855f7)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 900, color: "#ffffff", fontSize: "1.05rem",
                          boxShadow: "0 3px 10px rgba(99, 102, 241, 0.35)",
                        }}>
                          {(s.saleName || "S").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff" }}>{s.saleName}</span>
                            <span style={{
                              padding: "0.12rem 0.5rem", borderRadius: "5px",
                              background: "rgba(99, 102, 241, 0.15)", border: "1px solid rgba(99, 102, 241, 0.3)",
                              color: "#a5b4fc", fontWeight: 700, fontSize: "0.68rem",
                            }}>
                              Sale
                            </span>
                          </div>
                          <p style={{ margin: "0.05rem 0 0 0", fontSize: "0.72rem", color: "#475569" }}>
                            {s.email || ""}
                          </p>
                        </div>
                      </div>
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
