"use client";

import React, { useState, useMemo } from "react";
import {
  Building2, FileText, Layers, Sparkles, Users, Globe, Calculator,
  GraduationCap, TrendingUp, TrendingDown, Laptop, Coins, Wrench
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

const fmtSmartMoney = (val: number) => {
  if (!val || val === 0) return "0 đ";
  const abs = Math.abs(val);
  if (abs >= 1_000_000_000) {
    const billions = (val / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 2 });
    return `${billions} Tỷ đ`;
  }
  if (abs >= 100_000_000) {
    const millions = (val / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 });
    return `${millions} Tr đ`;
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

// ─── Minimal Executive Style Constants ──────────────────────────────
const S = {
  card: (borderColor: string): React.CSSProperties => ({
    background: "rgba(15, 23, 42, 0.75)",
    backdropFilter: "blur(12px)",
    padding: "0.85rem 1rem",
    borderRadius: "12px",
    border: `1px solid ${borderColor}`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
  }),
  cardTitle: (color: string): React.CSSProperties => ({
    fontSize: "0.78rem",
    fontWeight: 800,
    color,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: "0.65rem",
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
  }),
  row: {
    display: "grid",
    gridTemplateColumns: "52px 1fr 95px",
    gap: "0.3rem",
    alignItems: "center",
    background: "rgba(15, 23, 42, 0.5)",
    padding: "0.28rem 0.55rem",
    borderRadius: "6px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  } as React.CSSProperties,
  projLabel: (p: ProjectCostStat): React.CSSProperties => ({
    color: p.color,
    fontSize: "0.72rem",
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
  }),
  footer: {
    borderTop: "1px dashed rgba(255, 255, 255, 0.12)",
    paddingTop: "0.55rem",
    marginTop: "0.45rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: "32px",
  } as React.CSSProperties,
  totalValue: (color: string): React.CSSProperties => ({
    whiteSpace: "nowrap",
    fontSize: "0.98rem",
    fontWeight: 900,
    color,
    textAlign: "right",
  }),
  blink: (isNeg: boolean): React.CSSProperties => ({
    animation: isNeg ? "blinkRed 2.2s ease-in-out infinite" : "none",
  }),
};

// ─── Minimal Sub-Components ─────────────────────────────────────────

function BudgetCard({ projects, totalAllocated, totalStudents }: {
  projects: ProjectCostStat[];
  totalAllocated: number;
  totalStudents: number;
}) {
  return (
    <div style={S.card("rgba(52, 211, 153, 0.35)")}>
      <div>
        <div style={S.cardTitle("#34d399")}>
          <Calculator size={14} /> 1. NGÂN SÁCH CẤP
        </div>
        <div style={{ fontSize: "0.74rem", color: "#f8fafc", display: "flex", flexDirection: "column", gap: "0.3rem", marginBottom: "0.4rem" }}>
          {projects.map(p => (
            <div key={p.projectKey} style={S.row}>
              <div>
                <span style={S.projLabel(p)}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.color }} />
                  {p.projectKey}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <span style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.15rem" }}>
                  <GraduationCap size={10} color="#38bdf8" /> {fmtMoney(p.studentCount)} HS
                </span>
              </div>
              <div title={fmtMoney(p.totalAllocated) + " đ"} style={{ fontWeight: 900, whiteSpace: "nowrap", color: "#34d399", textAlign: "right", fontSize: "0.78rem" }}>
                {fmtSmartMoney(p.totalAllocated)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={S.footer}>
        <span style={{ fontSize: "0.72rem", color: "#38bdf8", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
          <GraduationCap size={12} /> {fmtMoney(totalStudents)} HS
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
    <div style={S.card("rgba(251, 191, 36, 0.35)")}>
      <div>
        <div style={S.cardTitle("#fbbf24")}>
          <Calculator size={14} /> 2. ĐẦU TƯ CHI TIẾT
        </div>
        <div style={{ fontSize: "0.74rem", color: "#f8fafc", display: "flex", flexDirection: "column", gap: "0.3rem", marginBottom: "0.4rem" }}>
          {projects.map(p => (
            <div key={p.projectKey} style={S.row}>
              <div>
                <span style={S.projLabel(p)}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.color }} />
                  {p.projectKey}
                </span>
              </div>
              {/* Minimal 3-Column Equal Subgrid */}
              <div style={{
                fontSize: "0.66rem",
                color: "#cbd5e1",
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "0.1rem",
                alignItems: "center",
                width: "100%",
              }}>
                <span style={{ color: "#38bdf8", display: "inline-flex", alignItems: "center", gap: "0.12rem", fontWeight: 700 }}>
                  <Laptop size={10} style={{ flexShrink: 0 }} />{fmtShort(p.itemCost)}
                </span>
                <span style={{ color: "#c084fc", display: "inline-flex", alignItems: "center", gap: "0.12rem", fontWeight: 700 }}>
                  <Coins size={10} style={{ flexShrink: 0 }} />{fmtShort(p.otherCost)}
                </span>
                <span style={{ color: "#fbbf24", display: "inline-flex", alignItems: "center", gap: "0.12rem", fontWeight: 700 }}>
                  <Wrench size={10} style={{ flexShrink: 0 }} />{fmtShort(p.constrCost)}
                </span>
              </div>
              <div title={fmtMoney(p.totalInvested) + " đ"} style={{ fontWeight: 900, whiteSpace: "nowrap", color: "#fbbf24", textAlign: "right", fontSize: "0.78rem" }}>
                {fmtSmartMoney(p.totalInvested)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={S.footer}>
        {/* Footer Minimal Subgrid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "0.1rem",
          fontSize: "0.7rem",
          color: "#f8fafc",
          alignItems: "center",
          flex: 1,
          paddingRight: "0.4rem",
        }}>
          <span style={{ color: "#38bdf8", display: "inline-flex", alignItems: "center", gap: "0.12rem", fontWeight: 800 }}>
            <Laptop size={11} style={{ flexShrink: 0 }} />{fmtShort(totalItemCost)}
          </span>
          <span style={{ color: "#c084fc", display: "inline-flex", alignItems: "center", gap: "0.12rem", fontWeight: 800 }}>
            <Coins size={11} style={{ flexShrink: 0 }} />{fmtShort(totalOtherCost)}
          </span>
          <span style={{ color: "#fbbf24", display: "inline-flex", alignItems: "center", gap: "0.12rem", fontWeight: 800 }}>
            <Wrench size={11} style={{ flexShrink: 0 }} />{fmtShort(totalConstrCost)}
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
    <div style={S.card("rgba(129, 140, 248, 0.35)")}>
      <div>
        <div style={S.cardTitle("#a5b4fc")}>
          <Sparkles size={14} /> 3. CHÊNH LỆCH NGÂN SÁCH
        </div>
        <div style={{ fontSize: "0.74rem", color: "#f8fafc", display: "flex", flexDirection: "column", gap: "0.3rem", marginBottom: "0.4rem" }}>
          {projects.map(p => {
            const delta = p.delta || 0;
            const isNeg = delta < 0;
            return (
              <div key={p.projectKey} style={S.row}>
                <div>
                  <span style={S.projLabel(p)}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.color }} />
                    {p.projectKey}
                  </span>
                </div>
                <div style={{ fontSize: "0.74rem", fontWeight: 800, textAlign: "center", color: isNeg ? "#ff4d6d" : p.color, ...S.blink(isNeg) }}>
                  {p.usagePercentage || 0}%
                </div>
                <div title={fmtMoney(delta) + " đ"} style={{ fontSize: "0.78rem", fontWeight: 900, whiteSpace: "nowrap", color: isNeg ? "#ff4d6d" : "#34d399", textAlign: "right", ...S.blink(isNeg) }}>
                  {fmtSmartMoney(delta)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={S.footer}>
        <span style={{ fontSize: "0.72rem", color: "#f8fafc", fontWeight: 600 }}>
          Đã đầu tư:{" "}
          <strong style={{ fontSize: "0.85rem", color: isGrandNeg ? "#ff4d6d" : "#818cf8", ...S.blink(isGrandNeg) }}>
            {totalUsage}%
          </strong>
        </span>
        <span title={fmtMoney(totalDelta) + " đ"} style={{ ...S.totalValue(isGrandNeg ? "#ff4d6d" : "#34d399"), ...S.blink(isGrandNeg) }}>
          {fmtSmartMoney(totalDelta)}
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
      background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))",
      backdropFilter: "blur(14px)",
      borderRadius: "14px",
      border: "1px solid rgba(129, 140, 248, 0.3)",
      padding: "1rem 1.15rem",
      boxShadow: "0 6px 24px rgba(0, 0, 0, 0.35)",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.6rem",
        marginBottom: "0.85rem",
        paddingBottom: "0.6rem",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      }}>
        {headerContent}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.78rem", color: "#ffffff" }}>
          <span style={{ fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
            <Building2 size={13} color="#a5b4fc" /> {schoolCount} trường
          </span>
          <span style={{ color: "#475569" }}>•</span>
          <span style={{ fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
            <FileText size={13} color="#818cf8" /> {proposalCount} dự trù
          </span>
          <span style={{ color: "#475569" }}>•</span>
          <span style={{
            color: "#38bdf8",
            fontWeight: 800,
            fontSize: "0.76rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.2rem",
          }}>
            <GraduationCap size={13} /> {fmtMoney(studentCount)} HS
          </span>
        </div>
      </div>

      {/* 3 Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(275px, 1fr))", gap: "0.85rem" }}>
        <BudgetCard projects={projects} totalAllocated={totals.allocated} totalStudents={studentCount} />
        <InvestmentCard projects={projects} totalInvested={totals.invested} totalItemCost={totals.itemCost} totalOtherCost={totals.otherCost} totalConstrCost={totals.constrCost} />
        <DeltaCard projects={projects} totalDelta={delta} totalUsage={usage} />
      </div>
    </div>
  );
}

// ─── Compact Minimal Project Card ─────────────────────────────────────
function ProjectCard({ proj }: { proj: ProjectCostStat }) {
  const isNeg = (proj.delta || 0) < 0;
  const usage = proj.usagePercentage || 0;

  return (
    <div style={{
      background: "rgba(30, 41, 59, 0.75)",
      backdropFilter: "blur(10px)",
      borderRadius: "12px",
      border: `1px solid ${proj.border}`,
      padding: "0.75rem 0.85rem",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "100%",
      gap: "0.6rem",
      boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25)",
      transition: "all 0.2s ease",
    }}>
      {/* Header: Clean minimal label (No chunky pill badge) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span style={{ width: 6, height: 6, borderRadius: 2, background: proj.color }} />
          <span style={{ fontSize: "0.78rem", fontWeight: 900, color: proj.color, letterSpacing: "0.02em" }}>
            DỰ ÁN {proj.projectKey}
          </span>
          {proj.projectName && proj.projectName.toUpperCase().trim() !== proj.projectKey.toUpperCase().trim() && (
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#94a3b8" }}>
              • {proj.projectName}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.68rem", color: "#94a3b8" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.12rem", fontWeight: 700 }}>
            <Building2 size={11} color={proj.color} /> {proj.schoolCount || 0}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.12rem", fontWeight: 700 }}>
            <FileText size={11} color="#818cf8" /> {proj.proposalCount || 0}
          </span>
          <span style={{ color: "#38bdf8", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.12rem" }}>
            <GraduationCap size={10} /> {fmtMoney(proj.studentCount)}
          </span>
        </div>
      </div>

      {/* Clean Flat Metric Strip with Zero Box Clutter */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        padding: "0.45rem 0.2rem",
        background: "rgba(15, 23, 42, 0.5)",
        borderRadius: "8px",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        alignItems: "center",
      }}>
        {/* Ngân sách */}
        <div 
          title={fmtMoney(proj.totalAllocated) + " đ"}
          style={{
            padding: "0 0.35rem",
            borderRight: "1px solid rgba(255, 255, 255, 0.08)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em" }}>
            Ngân sách
          </div>
          <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "#34d399", marginTop: "0.12rem" }}>
            {fmtSmartMoney(proj.totalAllocated)}
          </div>
        </div>

        {/* Đầu tư */}
        <div 
          title={fmtMoney(proj.totalInvested) + " đ"}
          style={{
            padding: "0 0.35rem",
            borderRight: "1px solid rgba(255, 255, 255, 0.08)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em" }}>
            Đã đầu tư
          </div>
          <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "#fbbf24", marginTop: "0.12rem" }}>
            {fmtSmartMoney(proj.totalInvested)}
          </div>
        </div>

        {/* Chênh lệch */}
        <div 
          title={fmtMoney(proj.delta) + " đ"}
          style={{
            padding: "0 0.35rem",
            textAlign: "center",
          }}
        >
          <div style={{
            fontSize: "0.6rem", color: isNeg ? "#ff4d6d" : "#94a3b8", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.02em", display: "inline-flex", alignItems: "center", gap: "0.1rem"
          }}>
            {isNeg ? <TrendingDown size={9} color="#ff4d6d" /> : <TrendingUp size={9} color="#34d399" />}
            Chênh lệch
          </div>
          <div style={{
            fontSize: "0.85rem", fontWeight: 900,
            color: isNeg ? "#ff4d6d" : "#34d399",
            marginTop: "0.12rem",
            ...S.blink(isNeg),
          }}>
            {fmtSmartMoney(proj.delta)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
          <span style={{ fontSize: "0.64rem", color: "#cbd5e1", fontWeight: 700 }}>Đã đầu tư</span>
          <span style={{
            fontSize: "0.78rem", fontWeight: 900,
            color: isNeg ? "#ff4d6d" : proj.color,
            ...S.blink(isNeg),
          }}>
            {isNeg ? "-" : ""}{usage}%
          </span>
        </div>
        <div style={{ width: "100%", height: "5px", borderRadius: "3px", background: "rgba(255, 255, 255, 0.08)", overflow: "hidden" }}>
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

      {/* Minimal Cost Breakdown Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "0.1rem",
        padding: "0.35rem 0.45rem",
        background: "rgba(15, 23, 42, 0.6)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "6px",
        alignItems: "center",
      }}>
        {[
          { icon: Laptop, label: "TB:", value: proj.itemCost, color: "#38bdf8" },
          { icon: Coins, label: "Khác:", value: proj.otherCost, color: "#c084fc" },
          { icon: Wrench, label: "TC:", value: proj.constrCost, color: "#fbbf24" },
        ].map(item => {
          const IconComp = item.icon;
          return (
            <div key={item.label} style={{ display: "inline-flex", alignItems: "center", gap: "0.12rem", whiteSpace: "nowrap", overflow: "hidden" }}>
              <IconComp size={10} color={item.color} style={{ flexShrink: 0 }} />
              <span style={{ color: "#cbd5e1", fontSize: "0.62rem", fontWeight: 700 }}>{item.label}</span>
              <strong style={{ color: item.color, fontSize: "0.68rem", fontWeight: 900 }}>{fmtShort(item.value)}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────
export default function ProjectCostDashboard({
  projectsData,
  salesData = [],
  totalUniqueSchools,
  title = "Tổng Quan Chi Phí Theo Từng Dự Án",
  subtitle = "Theo dõi kinh phí cấp, tổng tiền đã lập dự trù và chênh lệch ngân sách",
  actionButton,
}: {
  projectsData: ProjectCostStat[];
  salesData?: SaleCostStat[];
  totalUniqueSchools?: number;
  title?: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<string>("ALL");

  const filteredProjects = useMemo(() => {
    if (activeTab === "ALL") return projectsData;
    return projectsData.filter(p => p.projectKey === activeTab);
  }, [projectsData, activeTab]);

  const grand = useMemo(() => ({
    schools: totalUniqueSchools ?? sumField(projectsData, "schoolCount"),
    proposals: sumField(projectsData, "proposalCount"),
    students: sumField(projectsData, "studentCount"),
  }), [projectsData, totalUniqueSchools]);

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
        background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))",
        borderRadius: "12px",
        padding: "0.85rem 1.15rem",
        marginBottom: "1rem",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
        flexWrap: "wrap",
        gap: "0.75rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1, minWidth: "260px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#ffffff", boxShadow: "0 2px 8px rgba(99, 102, 241, 0.4)",
            flexShrink: 0,
          }}>
            <Layers size={18} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.01em" }}>{title}</h1>
            <p style={{ margin: "0.1rem 0 0 0", fontSize: "0.76rem", color: "#94a3b8" }}>{subtitle}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap" }}>
          {actionButton}

          {/* Project Navigation Tabs */}
          <div style={{
            display: "flex",
            gap: "0.2rem",
            background: "rgba(15, 23, 42, 0.8)",
            padding: "0.2rem",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
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
                    padding: "0.35rem 0.75rem",
                    borderRadius: "6px",
                    fontSize: "0.76rem",
                    fontWeight: active ? 900 : 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    boxShadow: active ? "0 2px 8px rgba(79, 70, 229, 0.4)" : "none",
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{
              color: "#818cf8",
              fontSize: "0.78rem",
              fontWeight: 900,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}>
              <Globe size={13} color="#6366f1" />
              {activeTab === "ALL" ? "TỔNG CỘNG 4 DỰ ÁN" : `DỰ ÁN ${activeTab}`}
            </span>
          </div>
        }
      />

      {/* ── 4 Individual Project Cards ────────────────────── */}
      {activeTab === "ALL" && (
        <div style={{ marginTop: "1.25rem" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(275px, 1fr))",
            gap: "0.85rem",
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
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))",
            borderRadius: "14px",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            padding: "1.15rem",
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.3)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.85rem" }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "8px",
                background: "rgba(16, 185, 129, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981",
              }}>
                <Users size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 900, color: "#ffffff" }}>
                  Thống Kê Theo Nhân Viên Sale
                </h3>
                <p style={{ margin: "0.1rem 0 0 0", fontSize: "0.74rem", color: "#94a3b8" }}>
                  Chi phí, học sinh mới và đầu tư chi tiết của từng nhân viên kinh doanh
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {salesData.map(sale => {
                return (
                  <div key={sale.saleId} style={{
                    background: "rgba(15, 23, 42, 0.65)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    padding: "0.95rem",
                  }}>
                    {/* Sale Header */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                      marginBottom: "0.75rem",
                      paddingBottom: "0.55rem",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                        <div style={{
                          width: "30px", height: "30px", borderRadius: "50%",
                          background: "linear-gradient(135deg, #10b981, #059669)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#ffffff", fontWeight: 900, fontSize: "0.82rem",
                          boxShadow: "0 2px 6px rgba(16, 185, 129, 0.35)",
                        }}>
                          {sale.saleName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 900, color: "#ffffff", fontSize: "0.9rem" }}>
                            {sale.saleName}
                          </div>
                          {sale.email && (
                            <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{sale.email}</div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.76rem" }}>
                        <span style={{ color: "#cbd5e1" }}>
                          Trường: <strong style={{ color: "#ffffff", fontWeight: 900 }}>{sale.totalSchools}</strong>
                        </span>
                        <span style={{ color: "#cbd5e1" }}>
                          Dự trù: <strong style={{ color: "#818cf8", fontWeight: 900 }}>{sale.totalProposals}</strong>
                        </span>
                        <span style={{ color: "#38bdf8", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "0.15rem" }}>
                          <GraduationCap size={11} /> {fmtMoney(sale.totalStudents)} HS
                        </span>
                      </div>
                    </div>

                    {/* Sale Sub-Projects Grid */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
                      gap: "0.75rem",
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
