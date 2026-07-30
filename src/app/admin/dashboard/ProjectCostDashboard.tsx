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

// Smart Money Formatter for Billions (Tỷ) support
const fmtSmartMoney = (val: number) => {
  if (!val || val === 0) return "0 đ";
  const abs = Math.abs(val);
  if (abs >= 1_000_000_000) {
    const billions = (val / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 2 });
    return `${billions} Tỷ đ`;
  }
  return `${val.toLocaleString("vi-VN")} đ`;
};

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
    background: "rgba(15, 23, 42, 0.9)",
    padding: "1rem 1.15rem",
    borderRadius: "14px",
    border: `1.5px solid ${borderColor}`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
    transition: "all 0.2s ease",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.35)",
  }),
  cardTitle: (color: string): React.CSSProperties => ({
    fontSize: "0.85rem",
    fontWeight: 900,
    color,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: "0.75rem",
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
  }),
  row: {
    display: "grid",
    gridTemplateColumns: "62px 1fr 140px", // Strict identical 3-column grid across all 3 cards!
    alignItems: "center",
    background: "rgba(30, 41, 59, 0.65)",
    padding: "0.38rem 0.65rem",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  } as React.CSSProperties,
  badge: (p: ProjectCostStat): React.CSSProperties => ({
    color: p.color,
    background: p.badgeBg,
    padding: "0.15rem 0.45rem",
    borderRadius: "6px",
    fontSize: "0.74rem",
    fontWeight: 900,
    border: `1px solid ${p.border}`,
    display: "inline-block",
    textAlign: "center",
  }),
  hsBadge: {
    background: "rgba(56, 189, 248, 0.18)",
    border: "1px solid rgba(56, 189, 248, 0.4)",
    borderRadius: "14px",
    padding: "0.12rem 0.5rem",
    color: "#38bdf8",
    fontWeight: 800,
    fontSize: "0.72rem",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.2rem",
  } as React.CSSProperties,
  footer: {
    borderTop: "1px dashed rgba(255, 255, 255, 0.2)",
    paddingTop: "0.65rem",
    marginTop: "0.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: "36px",
  } as React.CSSProperties,
  totalValue: (color: string): React.CSSProperties => ({
    whiteSpace: "nowrap",
    fontSize: "1.18rem",
    fontWeight: 900,
    color,
    textAlign: "right",
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
    <div style={S.card("rgba(52, 211, 153, 0.45)")}>
      <div>
        <div style={S.cardTitle("#34d399")}>
          <Calculator size={15} /> 1. NGÂN SÁCH CẤP
        </div>
        <div style={{ fontSize: "0.78rem", color: "#f8fafc", display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.5rem" }}>
          {projects.map(p => (
            <div key={p.projectKey} style={S.row}>
              <div><strong style={S.badge(p)}>{p.projectKey}</strong></div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <span style={S.hsBadge}>
                  <GraduationCap size={11} /> {fmtMoney(p.studentCount)} HS
                </span>
              </div>
              <div title={fmtMoney(p.totalAllocated) + " đ"} style={{ fontWeight: 900, whiteSpace: "nowrap", color: "#34d399", textAlign: "right", fontSize: "0.82rem" }}>
                {fmtSmartMoney(p.totalAllocated)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={S.footer}>
        <span style={{ ...S.hsBadge, padding: "0.18rem 0.6rem", fontWeight: 900, fontSize: "0.76rem", border: "1px solid rgba(56, 189, 248, 0.5)", background: "rgba(56, 189, 248, 0.2)" }}>
          <GraduationCap size={13} /> {fmtMoney(totalStudents)} HS
        </span>
        <span title={fmtMoney(totalAllocated) + " đ"} style={S.totalValue("#34d399")}>{fmtSmartMoney(totalAllocated)}</span>
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
    <div style={S.card("rgba(251, 191, 36, 0.45)")}>
      <div>
        <div style={S.cardTitle("#fbbf24")}>
          <Calculator size={15} /> 2. ĐẦU TƯ CHI TIẾT
        </div>
        <div style={{ fontSize: "0.78rem", color: "#f8fafc", display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.5rem" }}>
          {projects.map(p => (
            <div key={p.projectKey} style={S.row}>
              <div><strong style={S.badge(p)}>{p.projectKey}</strong></div>
              {/* Fixed 3-Column Subgrid aligned perfectly */}
              <div style={{
                fontSize: "0.7rem",
                color: "#cbd5e1",
                display: "grid",
                gridTemplateColumns: "64px 48px 48px",
                gap: "0.2rem",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
              }}>
                <span style={{ color: "#38bdf8", display: "inline-flex", alignItems: "center", gap: "0.2rem", fontWeight: 800 }}>
                  <Laptop size={12} style={{ flexShrink: 0 }} />{fmtShort(p.itemCost)}
                </span>
                <span style={{ color: "#c084fc", display: "inline-flex", alignItems: "center", gap: "0.2rem", fontWeight: 800 }}>
                  <Coins size={12} style={{ flexShrink: 0 }} />{fmtShort(p.otherCost)}
                </span>
                <span style={{ color: "#fbbf24", display: "inline-flex", alignItems: "center", gap: "0.2rem", fontWeight: 800 }}>
                  <Wrench size={12} style={{ flexShrink: 0 }} />{fmtShort(p.constrCost)}
                </span>
              </div>
              <div title={fmtMoney(p.totalInvested) + " đ"} style={{ fontWeight: 900, whiteSpace: "nowrap", color: "#fbbf24", textAlign: "right", fontSize: "0.82rem" }}>
                {fmtSmartMoney(p.totalInvested)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={S.footer}>
        {/* Fixed Grid Footer icons aligned perfectly with rows above */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "64px 48px 48px",
          gap: "0.2rem",
          fontSize: "0.74rem",
          color: "#f8fafc",
          alignItems: "center",
        }}>
          <span style={{ color: "#38bdf8", display: "inline-flex", alignItems: "center", gap: "0.2rem", fontWeight: 800 }}>
            <Laptop size={12} style={{ flexShrink: 0 }} /> {fmtShort(totalItemCost)}
          </span>
          <span style={{ color: "#c084fc", display: "inline-flex", alignItems: "center", gap: "0.2rem", fontWeight: 800 }}>
            <Coins size={12} style={{ flexShrink: 0 }} /> {fmtShort(totalOtherCost)}
          </span>
          <span style={{ color: "#fbbf24", display: "inline-flex", alignItems: "center", gap: "0.2rem", fontWeight: 800 }}>
            <Wrench size={12} style={{ flexShrink: 0 }} /> {fmtShort(totalConstrCost)}
          </span>
        </div>
        <span title={fmtMoney(totalInvested) + " đ"} style={S.totalValue("#fbbf24")}>{fmtSmartMoney(totalInvested)}</span>
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
    <div style={S.card("rgba(129, 140, 248, 0.45)")}>
      <div>
        <div style={S.cardTitle("#a5b4fc")}>
          <Sparkles size={15} /> 3. CHÊNH LỆCH NGÂN SÁCH
        </div>
        <div style={{ fontSize: "0.78rem", color: "#f8fafc", display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.5rem" }}>
          {projects.map(p => {
            const delta = p.delta || 0;
            const isNeg = delta < 0;
            return (
              <div key={p.projectKey} style={S.row}>
                <div><strong style={S.badge(p)}>{p.projectKey}</strong></div>
                <div style={{ fontSize: "0.78rem", fontWeight: 900, textAlign: "center", color: isNeg ? "#ff4d6d" : p.color, ...S.blink(isNeg) }}>
                  {isNeg ? "" : "+"}{p.usagePercentage || 0}%
                </div>
                <div title={(isNeg ? "" : "+") + fmtMoney(delta) + " đ"} style={{ fontSize: "0.85rem", fontWeight: 900, whiteSpace: "nowrap", color: isNeg ? "#ff4d6d" : "#34d399", textAlign: "right", ...S.blink(isNeg) }}>
                  {isNeg ? "" : "+"}{fmtSmartMoney(delta)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={S.footer}>
        <span style={{ fontSize: "0.78rem", color: "#f8fafc", fontWeight: 600 }}>
          Giải ngân:{" "}
          <strong style={{ fontSize: "0.95rem", color: isGrandNeg ? "#ff4d6d" : "#818cf8", ...S.blink(isGrandNeg) }}>
            {isGrandNeg ? "" : "+"}{totalUsage}%
          </strong>
        </span>
        <span title={(isGrandNeg ? "" : "+") + fmtMoney(totalDelta) + " đ"} style={{ ...S.totalValue(isGrandNeg ? "#ff4d6d" : "#34d399"), ...S.blink(isGrandNeg) }}>
          {isGrandNeg ? "" : "+"}{fmtSmartMoney(totalDelta)}
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
      background: "linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(49, 46, 129, 0.65))",
      backdropFilter: "blur(16px)",
      borderRadius: "16px",
      border: "1.5px solid rgba(129, 140, 248, 0.4)",
      padding: "1.15rem 1.35rem",
      boxShadow: "0 8px 28px rgba(0, 0, 0, 0.4)",
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
        borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
      }}>
        {headerContent}
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", fontSize: "0.85rem", color: "#ffffff" }}>
          <span style={{ fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            <Building2 size={15} color="#a5b4fc" /> {schoolCount}
          </span>
          <span style={{ color: "#64748b" }}>•</span>
          <span style={{ fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            <FileText size={15} color="#818cf8" /> {proposalCount}
          </span>
          <span style={{ color: "#64748b" }}>•</span>
          <span style={{
            background: "rgba(56, 189, 248, 0.18)",
            border: "1px solid rgba(56, 189, 248, 0.4)",
            padding: "0.18rem 0.6rem",
            borderRadius: "16px",
            color: "#38bdf8",
            fontWeight: 900,
            fontSize: "0.8rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
          }}>
            <GraduationCap size={14} /> {fmtMoney(studentCount)} HS
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
      background: "rgba(30, 41, 59, 0.8)",
      backdropFilter: "blur(12px)",
      borderRadius: "14px",
      border: `1.5px solid ${proj.border}`,
      padding: "0.9rem 1.05rem",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "100%",
      gap: "0.7rem",
      boxShadow: "0 6px 18px -4px rgba(0, 0, 0, 0.3)",
      transition: "all 0.2s ease",
    }}>
      {/* Header: Badge + Stats */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          <span style={{
            fontSize: "0.85rem", fontWeight: 900,
            padding: "0.28rem 0.8rem", borderRadius: "8px",
            background: proj.badgeBg, color: proj.color,
            border: `1.5px solid ${proj.border}`,
            letterSpacing: "0.03em"
          }}>
            DỰ ÁN {proj.projectKey}
          </span>
          {proj.projectName && proj.projectName.toUpperCase().trim() !== proj.projectKey.toUpperCase().trim() && (
            <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "#ffffff" }}>
              {proj.projectName}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.72rem", color: "#94a3b8" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.15rem", fontWeight: 700 }}>
            <Building2 size={12} color={proj.color} /> {proj.schoolCount || 0}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.15rem", fontWeight: 700 }}>
            <FileText size={12} color="#818cf8" /> {proj.proposalCount || 0}
          </span>
          <span style={{ ...S.hsBadge, fontSize: "0.65rem", padding: "0.06rem 0.4rem" }}>
            <GraduationCap size={10} /> {fmtMoney(proj.studentCount)}
          </span>
        </div>
      </div>

      {/* Budget Row: High Contrast 3 Columns Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "0.35rem",
      }}>
        {/* Ngân sách cấp */}
        <div 
          title={fmtMoney(proj.totalAllocated) + " đ"}
          style={{
            background: "rgba(6, 78, 59, 0.55)",
            padding: "0.45rem 0.4rem",
            borderRadius: "8px",
            borderLeft: "3px solid #34d399",
            borderTop: "1px solid rgba(52, 211, 153, 0.25)",
            borderRight: "1px solid rgba(52, 211, 153, 0.25)",
            borderBottom: "1px solid rgba(52, 211, 153, 0.25)",
            minWidth: 0,
          }}
        >
          <div style={{ fontSize: "0.58rem", color: "#a7f3d0", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.01em", whiteSpace: "nowrap" }}>
            Ngân sách cấp
          </div>
          <div style={{ fontSize: "0.78rem", fontWeight: 900, color: "#34d399", marginTop: "0.15rem", whiteSpace: "nowrap" }}>
            {fmtSmartMoney(proj.totalAllocated)}
          </div>
        </div>

        {/* Đã đầu tư */}
        <div 
          title={fmtMoney(proj.totalInvested) + " đ"}
          style={{
            background: "rgba(120, 53, 15, 0.55)",
            padding: "0.45rem 0.4rem",
            borderRadius: "8px",
            borderLeft: "3px solid #fbbf24",
            borderTop: "1px solid rgba(251, 191, 36, 0.25)",
            borderRight: "1px solid rgba(251, 191, 36, 0.25)",
            borderBottom: "1px solid rgba(251, 191, 36, 0.25)",
            minWidth: 0,
          }}
        >
          <div style={{ fontSize: "0.58rem", color: "#fde68a", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.01em", whiteSpace: "nowrap" }}>
            Đã đầu tư
          </div>
          <div style={{ fontSize: "0.78rem", fontWeight: 900, color: "#fbbf24", marginTop: "0.15rem", whiteSpace: "nowrap" }}>
            {fmtSmartMoney(proj.totalInvested)}
          </div>
        </div>

        {/* Chênh lệch */}
        <div 
          title={(isNeg ? "" : "+") + fmtMoney(proj.delta) + " đ"}
          style={{
            background: isNeg ? "rgba(159, 18, 57, 0.55)" : "rgba(6, 78, 59, 0.55)",
            padding: "0.45rem 0.4rem",
            borderRadius: "8px",
            borderLeft: `3px solid ${isNeg ? "#ff4d6d" : "#34d399"}`,
            borderTop: `1px solid ${isNeg ? "rgba(255, 77, 109, 0.3)" : "rgba(52, 211, 153, 0.25)"}`,
            borderRight: `1px solid ${isNeg ? "rgba(255, 77, 109, 0.3)" : "rgba(52, 211, 153, 0.25)"}`,
            borderBottom: `1px solid ${isNeg ? "rgba(255, 77, 109, 0.3)" : "rgba(52, 211, 153, 0.25)"}`,
            minWidth: 0,
          }}
        >
          <div style={{
            fontSize: "0.58rem", color: isNeg ? "#fecdd3" : "#a7f3d0", fontWeight: 800, textTransform: "uppercase",
            letterSpacing: "0.01em", display: "flex", alignItems: "center", gap: "0.15rem",
            whiteSpace: "nowrap"
          }}>
            {isNeg ? <TrendingDown size={9} color="#ff4d6d" /> : <TrendingUp size={9} color="#34d399" />}
            Chênh lệch
          </div>
          <div style={{
            fontSize: "0.78rem", fontWeight: 900,
            color: isNeg ? "#ff4d6d" : "#34d399",
            marginTop: "0.15rem", whiteSpace: "nowrap",
            ...S.blink(isNeg),
          }}>
            {isNeg ? "" : "+"}{fmtSmartMoney(proj.delta)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
          <span style={{ fontSize: "0.68rem", color: "#cbd5e1", fontWeight: 700 }}>Giải ngân</span>
          <span style={{
            fontSize: "0.85rem", fontWeight: 900,
            color: isNeg ? "#ff4d6d" : proj.color,
            ...S.blink(isNeg),
          }}>
            {isNeg ? "-" : ""}{usage}%
          </span>
        </div>
        <div style={{ width: "100%", height: "6px", borderRadius: "3px", background: "rgba(255, 255, 255, 0.1)", overflow: "hidden" }}>
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

      {/* Cost Breakdown: Horizontal compact with fixed 3-column grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "0.4rem",
        fontSize: "0.7rem",
        padding: "0.45rem 0.6rem",
        background: "rgba(15, 23, 42, 0.75)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "8px",
      }}>
        {[
          { icon: Laptop, label: "Thiết bị", value: proj.itemCost, color: "#38bdf8" },
          { icon: Coins, label: "Khác", value: proj.otherCost, color: "#c084fc" },
          { icon: Wrench, label: "Thi công", value: proj.constrCost, color: "#fbbf24" },
        ].map(item => {
          const IconComp = item.icon;
          return (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.25rem", whiteSpace: "nowrap" }}>
              <IconComp size={12} color={item.color} style={{ flexShrink: 0 }} />
              <span style={{ color: "#cbd5e1", fontSize: "0.68rem", fontWeight: 600 }}>{item.label}:</span>
              <strong style={{ color: item.color, fontWeight: 800 }}>{fmtShort(item.value)}</strong>
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
  actionButton?: React.ReactNode;
}

export default function ProjectCostDashboard({
  projectsData,
  salesData = [],
  title = "Tổng Quan Chi Phí Theo Từng Dự Án",
  subtitle = "Báo cáo chi tiết định mức ngân sách, thực tế đầu tư và phân rã chi phí theo từng dự án triển khai",
  actionButton,
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
        background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))",
        borderRadius: "14px",
        padding: "1rem 1.35rem",
        marginBottom: "1.25rem",
        border: "1.5px solid rgba(255, 255, 255, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 18px rgba(0, 0, 0, 0.3)",
        flexWrap: "wrap",
        gap: "0.85rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", flex: 1, minWidth: "280px" }}>
          <div style={{
            width: "42px", height: "42px", borderRadius: "10px",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#ffffff", boxShadow: "0 3px 12px rgba(99, 102, 241, 0.45)",
            flexShrink: 0,
          }}>
            <Layers size={22} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.18rem", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.01em" }}>{title}</h1>
            <p style={{ margin: "0.15rem 0 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>{subtitle}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          {actionButton}

          {/* Project Navigation Tabs */}
          <div style={{
            display: "flex",
            gap: "0.3rem",
            background: "rgba(15, 23, 42, 0.85)",
            padding: "0.28rem",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}>
            {TABS.map(tab => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    border: "none",
                    background: active ? "linear-gradient(135deg, #4f46e5, #6366f1)" : "transparent",
                    color: active ? "#ffffff" : "#cbd5e1",
                    padding: "0.42rem 0.9rem",
                    borderRadius: "7px",
                    fontSize: "0.8rem",
                    fontWeight: active ? 900 : 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    boxShadow: active ? "0 2px 10px rgba(79, 70, 229, 0.5)" : "none",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Top Summary Banner ────────────────────────────── */}
      <BannerSection
        projects={filteredProjects}
        schoolCount={grand.schools}
        proposalCount={grand.proposals}
        studentCount={grand.students}
        headerContent={
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "#ffffff",
              padding: "0.28rem 0.8rem",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: 900,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              boxShadow: "0 2px 10px rgba(79, 70, 229, 0.4)",
            }}>
              <Globe size={15} />
              {activeTab === "ALL" ? "TỔNG CỘNG 4 DỰ ÁN" : `DỰ ÁN ${activeTab}`}
            </span>
          </div>
        }
      />

      {/* ── 4 Individual Project Cards ────────────────────── */}
      {activeTab === "ALL" && (
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1rem",
            alignItems: "stretch",
          }}>
            {filteredProjects.map(proj => (
              <ProjectCard key={proj.projectKey} proj={proj} />
            ))}
          </div>
        </div>
      )}

      {/* ── Sales Breakdown Section (Admin & Sale Personal) ──── */}
      {salesData.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98))",
            borderRadius: "16px",
            border: "1.5px solid rgba(16, 185, 129, 0.35)",
            padding: "1.35rem",
            boxShadow: "0 8px 28px rgba(0, 0, 0, 0.35)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "10px",
                background: "rgba(16, 185, 129, 0.2)", border: "1.5px solid rgba(16, 185, 129, 0.4)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981",
              }}>
                <Users size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: "#ffffff" }}>
                  Thống Kê Theo Nhân Viên Sale
                </h3>
                <p style={{ margin: "0.1rem 0 0 0", fontSize: "0.78rem", color: "#94a3b8" }}>
                  Chi phí, học sinh mới và giải ngân chi tiết của từng nhân viên kinh doanh
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
              {salesData.map(sale => {
                const isSaleNeg = (sale.totalAllocated - sale.totalInvested) < 0;
                const saleUsage = sale.totalAllocated > 0 ? Math.round((sale.totalInvested / sale.totalAllocated) * 100) : 0;

                return (
                  <div key={sale.saleId} style={{
                    background: "rgba(15, 23, 42, 0.75)",
                    borderRadius: "14px",
                    border: "1.5px solid rgba(255, 255, 255, 0.12)",
                    padding: "1.1rem",
                  }}>
                    {/* Sale Header */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "0.6rem",
                      marginBottom: "0.85rem",
                      paddingBottom: "0.65rem",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                        <div style={{
                          width: "34px", height: "34px", borderRadius: "50%",
                          background: "linear-gradient(135deg, #10b981, #059669)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#ffffff", fontWeight: 900, fontSize: "0.9rem",
                          boxShadow: "0 2px 8px rgba(16, 185, 129, 0.4)",
                        }}>
                          {sale.saleName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 900, color: "#ffffff", fontSize: "0.98rem" }}>
                            {sale.saleName}
                          </div>
                          {sale.email && (
                            <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>{sale.email}</div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", fontSize: "0.8rem" }}>
                        <span style={{ color: "#cbd5e1" }}>
                          Trường phụ trách: <strong style={{ color: "#ffffff", fontWeight: 900 }}>{sale.totalSchools}</strong>
                        </span>
                        <span style={{ color: "#cbd5e1" }}>
                          Dự trù: <strong style={{ color: "#818cf8", fontWeight: 900 }}>{sale.totalProposals}</strong>
                        </span>
                        <span style={{ ...S.hsBadge, fontSize: "0.74rem", fontWeight: 900 }}>
                          <GraduationCap size={12} /> {fmtMoney(sale.totalStudents)} HS
                        </span>
                      </div>
                    </div>

                    {/* Sale Sub-Projects Grid */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                      gap: "0.85rem",
                      alignItems: "stretch",
                    }}>
                      {sale.projectStats.map(p => (
                        <ProjectCard key={p.projectKey} proj={p} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
