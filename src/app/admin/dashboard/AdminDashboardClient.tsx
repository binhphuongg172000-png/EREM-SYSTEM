"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { vietnameseIncludes } from "@/lib/vietnamese";
import Link from "next/link";
import * as XLSX from "xlsx";
import { X, ExternalLink, AlertTriangle, CheckCircle2, School as SchoolIcon, Layers, FileSpreadsheet } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { SaleStat, AllocatedSchoolStat, OverdueSchoolStat } from "./page";

type Props = {
  totalSchools: number;
  totalHandovers: number;
  totalAllocated: number;
  totalInvested: number;
  usagePercentage: number;
  remainingBudget: number;
  pendingAllocated: number;
  pendingInvested: number;
  pendingItemBudget: number;
  pendingOtherBudget: number;
  pendingConstructionBudget?: number;
  pendingSchoolCount: number;
  completedAllocated: number;
  completedInvested: number;
  completedItemBudget: number;
  completedOtherBudget: number;
  completedConstructionBudget?: number;
  completedSchoolCount: number;
  draftProposalCount?: number;
  inProgressProposalCount?: number;
  completedProposalCount?: number;
  allProposalsCount?: number;
  saleLeaderboard: SaleStat[];
  allocatedBreakdown?: AllocatedSchoolStat[];
  overdueProposals?: OverdueSchoolStat[];
};

function fmt(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + " tỷ";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  return n.toLocaleString("vi-VN");
}

function fmtFull(n: number) {
  return n.toLocaleString("vi-VN") + " đ";
}

function BudgetBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(pct, 100)}%`, background: color }}
      />
    </div>
  );
}

function KpiCard({
  title,
  icon,
  accentColor,
  mainValue,
  mainColor,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  mainValue: string;
  mainColor: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="relative rounded-xl border border-white/5 bg-[#111827] p-3 flex flex-col gap-1.5 transition-all duration-300 hover:border-white/10 hover:shadow-xl hover:-translate-y-0.5 hover:z-30"
      style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.03), 0 4px 16px rgba(0,0,0,0.3)` }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ background: accentColor }}
      />

      {/* Title row */}
      <div className="flex items-center justify-between">
        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className="flex items-center gap-1">
          {icon}
        </div>
      </div>

      {/* Main value */}
      {mainValue && (
        <div className="text-2xl font-extrabold tracking-tight" style={{ color: mainColor }}>
          {mainValue}
        </div>
      )}

      {/* Slot for extra content */}
      {children}
    </div>
  );
}

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const numericValue = Number(data.value) || 0;
    const formatted = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(numericValue);
    return (
      <div className="bg-[#1e293b]/95 border border-slate-700/80 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-2xl text-xs flex flex-col gap-0.5 whitespace-nowrap z-50">
        <span className="font-bold text-[0.7rem] uppercase tracking-wider" style={{ color: data.payload.fill || data.color }}>
          {data.name}
        </span>
        <span className="font-extrabold text-white text-sm">{formatted}</span>
      </div>
    );
  }
  return null;
};

export default function AdminDashboardClient({
  totalSchools,
  totalHandovers,
  totalAllocated,
  totalInvested,
  usagePercentage,
  remainingBudget,
  pendingAllocated,
  pendingInvested,
  pendingItemBudget = 0,
  pendingOtherBudget = 0,
  pendingConstructionBudget = 0,
  pendingSchoolCount = 0,
  completedAllocated = 0,
  completedInvested = 0,
  completedItemBudget = 0,
  completedOtherBudget = 0,
  completedConstructionBudget = 0,
  completedSchoolCount = 0,
  draftProposalCount = 0,
  inProgressProposalCount = 0,
  completedProposalCount = 0,
  saleLeaderboard = [],
  allocatedBreakdown = [],
  overdueProposals = [],
}: Props) {
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSaleModal, setSelectedSaleModal] = useState<SaleStat | null>(null);
  const [modalTab, setModalTab] = useState<"ALL" | "NEGATIVE" | "POSITIVE">("ALL");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleExportExcel = () => {
    if (!saleLeaderboard || saleLeaderboard.length === 0) return;

    const dataToExport = saleLeaderboard.map((sale, idx) => ({
      "STT": idx + 1,
      "Nhân viên Sale": sale.name,
      "Số trường quản lý": sale.schoolCount,
      "Số học sinh mới": sale.totalStudents,
      "Ngân sách cấp (VNĐ)": sale.totalAllocated,
      "Đã đầu tư (VNĐ)": sale.totalInvested,
      "Kinh phí Thiết bị (VNĐ)": sale.totalItemBudget,
      "Kinh phí Thi công (VNĐ)": sale.totalConstructionBudget,
      "Kinh phí Đầu tư khác (VNĐ)": sale.totalOtherBudget,
      "Chênh lệch Ngân sách (VNĐ)": sale.budgetVariance,
      "Đánh giá Ngân sách": sale.budgetVariance < 0 ? "Vượt định mức (Âm)" : "Trong hạn mức (Dương)"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bao_Cao_Ngan_Sach_Sale");

    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 28 },
      { wch: 18 },
      { wch: 18 },
      { wch: 22 },
      { wch: 22 },
      { wch: 24 },
      { wch: 24 },
      { wch: 24 },
      { wch: 26 },
      { wch: 24 }
    ];

    const todayStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Bao_Cao_Ngan_Sach_Sale_${todayStr}.xlsx`);
  };

  const filteredAllocated = allocatedBreakdown.filter(item =>
    vietnameseIncludes(item.schoolName, searchQuery)
  );

  const pendingVariance = pendingAllocated - pendingInvested;
  const completedVariance = completedAllocated - completedInvested;

  // Data for Proposals & Schools Bar Chart
  const proposalStatsData = [
    { name: "Trường", value: totalSchools, color: "#3b82f6" },
    { name: "Khởi tạo", value: draftProposalCount, color: "#f59e0b" },
    { name: "Đang làm", value: inProgressProposalCount, color: "#06b6d4" },
    { name: "Hoàn thành", value: completedProposalCount, color: "#10b981" },
  ];

  // Data for Pie Charts (Full circle = Allocated Budget)
  const pendingPieData = [
    { name: "Thiết bị", value: pendingItemBudget, color: "#38bdf8" },
    { name: "Đầu tư khác", value: pendingOtherBudget, color: "#a855f7" },
    { name: "Thi công", value: pendingConstructionBudget, color: "#f59e0b" },
    { name: "Chưa đầu tư", value: Math.max(0, pendingAllocated - pendingInvested), color: "#10b981" }
  ].filter(d => d.value > 0);
  
  const completedPieData = [
    { name: "Thiết bị", value: completedItemBudget, color: "#38bdf8" },
    { name: "Đầu tư khác", value: completedOtherBudget, color: "#a855f7" },
    { name: "Thi công", value: completedConstructionBudget, color: "#f59e0b" },
    { name: "Chưa đầu tư", value: Math.max(0, completedAllocated - completedInvested), color: "#10b981" }
  ].filter(d => d.value > 0);

  // Tooltip formatter cho tiền tệ
  const formatTooltip = (value: any, name: any) => {
    const numericValue = Number(value) || 0;
    return [new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(numericValue), name];
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            TỔNG QUAN HỆ THỐNG
            <span className="inline-flex items-center gap-1 text-[0.6rem] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Realtime
            </span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Số liệu tài chính &amp; hiệu suất tổng hợp toàn quốc
          </p>
        </div>
        <div className="flex gap-2 text-xs text-slate-400">
          <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 font-semibold">
            🏫 {totalSchools} Trường
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 font-semibold">
            📋 {totalHandovers} BBBG
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ─────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">

        {/* Box 1 — Dự trù Khởi tạo */}
        <KpiCard
          title="Ngân sách Dự trù Khởi tạo"
          icon={<span className="text-lg">🕐</span>}
          accentColor="#f59e0b"
          mainValue=""
          mainColor="#fbbf24"
        >
          <div className="flex flex-col mt-1">
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/5">
              {/* Header: Total Budget on 1 line */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
                <div>
                  <span className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider block">Cơ cấu &amp; Tổng kinh phí</span>
                  <strong className="text-base font-black text-emerald-400 whitespace-nowrap block mt-0.5">
                    {fmtFull(pendingInvested)}
                  </strong>
                </div>
                <span className="text-[0.68rem] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                  {draftProposalCount + inProgressProposalCount + completedProposalCount} hồ sơ
                </span>
              </div>

              {/* Body: Breakdown List + Donut Chart */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                      <span className="text-slate-300 font-medium truncate">Thiết bị</span>
                    </div>
                    <span className="text-white font-bold whitespace-nowrap ml-1">{fmt(pendingItemBudget)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
                      <span className="text-slate-300 font-medium truncate">Đầu tư khác</span>
                    </div>
                    <span className="text-white font-bold whitespace-nowrap ml-1">{fmt(pendingOtherBudget)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                      <span className="text-slate-300 font-medium truncate">Thi công</span>
                    </div>
                    <span className="text-white font-bold whitespace-nowrap ml-1">{fmt(pendingConstructionBudget)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span className="text-slate-300 font-medium truncate">Chưa đầu tư</span>
                    </div>
                    <span className="text-emerald-400 font-bold whitespace-nowrap ml-1">{fmt(Math.max(0, pendingAllocated - pendingInvested))}</span>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="w-24 h-24 relative flex-shrink-0">
                  {isClient && (pendingItemBudget > 0 || pendingOtherBudget > 0 || pendingConstructionBudget > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pendingPieData}
                          innerRadius={24}
                          outerRadius={42}
                          dataKey="value"
                          stroke="#111827"
                          strokeWidth={2}
                          isAnimationActive={true}
                          animationBegin={100}
                          animationDuration={1200}
                          animationEasing="ease-out"
                        >
                          {pendingPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} allowEscapeViewBox={{ x: true, y: true }} wrapperStyle={{ zIndex: 9999 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full rounded-full border-2 border-dashed border-slate-700 bg-slate-900/40 flex flex-col items-center justify-center p-1">
                      <span className="text-[0.6rem] text-slate-500 font-bold uppercase tracking-wider">Chưa có</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </KpiCard>

        {/* Box 2 — Dự trù Hoàn thành */}
        <KpiCard
          title="Ngân sách Dự trù Hoàn thành"
          icon={<span className="text-lg">✅</span>}
          accentColor="#10b981"
          mainValue=""
          mainColor="#34d399"
        >
          <div className="flex flex-col mt-1">
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/5">
              {/* Header: Total Budget on 1 line */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
                <div>
                  <span className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider block">Cơ cấu &amp; Tổng kinh phí</span>
                  <strong className="text-base font-black text-emerald-400 whitespace-nowrap block mt-0.5">
                    {fmtFull(completedInvested)}
                  </strong>
                </div>
                <span className="text-[0.68rem] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                  {completedProposalCount} hồ sơ
                </span>
              </div>

              {/* Body: Breakdown List + Donut Chart */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                      <span className="text-slate-300 font-medium truncate">Thiết bị</span>
                    </div>
                    <span className="text-white font-bold whitespace-nowrap ml-1">{fmt(completedItemBudget)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
                      <span className="text-slate-300 font-medium truncate">Đầu tư khác</span>
                    </div>
                    <span className="text-white font-bold whitespace-nowrap ml-1">{fmt(completedOtherBudget)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                      <span className="text-slate-300 font-medium truncate">Thi công</span>
                    </div>
                    <span className="text-white font-bold whitespace-nowrap ml-1">{fmt(completedConstructionBudget)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span className="text-slate-300 font-medium truncate">Chưa đầu tư</span>
                    </div>
                    <span className="text-emerald-400 font-bold whitespace-nowrap ml-1">{fmt(Math.max(0, completedAllocated - completedInvested))}</span>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="w-24 h-24 relative flex-shrink-0">
                  {isClient && (completedItemBudget > 0 || completedOtherBudget > 0 || completedConstructionBudget > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={completedPieData}
                          innerRadius={24}
                          outerRadius={42}
                          dataKey="value"
                          stroke="#111827"
                          strokeWidth={2}
                          isAnimationActive={true}
                          animationBegin={100}
                          animationDuration={1200}
                          animationEasing="ease-out"
                        >
                          {completedPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} allowEscapeViewBox={{ x: true, y: true }} wrapperStyle={{ zIndex: 9999 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full rounded-full border-2 border-dashed border-slate-700 bg-slate-900/40 flex flex-col items-center justify-center p-1">
                      <span className="text-[0.6rem] text-slate-500 font-bold uppercase tracking-wider">Chưa có</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </KpiCard>

        {/* Box 3 — Thống kê Trường & Dự trù */}
        <KpiCard
          title="Trường & Trạng thái Dự trù"
          icon={<span className="text-lg">📊</span>}
          accentColor="#3b82f6"
          mainValue=""
          mainColor="#60a5fa"
        >
          <div className="flex flex-col mt-1">
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/5">
              {/* Header: Total Schools & Proposals */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
                <div>
                  <span className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider block">Tổng số trường phụ trách</span>
                  <strong className="text-base font-black text-blue-400 whitespace-nowrap block mt-0.5">
                    {totalSchools} trường
                  </strong>
                </div>
                <span className="text-[0.68rem] font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20 whitespace-nowrap">
                  {draftProposalCount + inProgressProposalCount + completedProposalCount} hồ sơ
                </span>
              </div>

              {/* Body: Breakdown List + Donut Chart */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                      <span className="text-slate-300 font-medium truncate">Khởi tạo</span>
                    </div>
                    <span className="text-amber-400 font-bold whitespace-nowrap ml-1">{draftProposalCount}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                      <span className="text-slate-300 font-medium truncate">Đang làm</span>
                    </div>
                    <span className="text-blue-400 font-bold whitespace-nowrap ml-1">{inProgressProposalCount}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span className="text-slate-300 font-medium truncate">Hoàn thành</span>
                    </div>
                    <span className="text-emerald-400 font-bold whitespace-nowrap ml-1">{completedProposalCount}</span>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="w-24 h-24 relative flex-shrink-0">
                  {isClient && (draftProposalCount > 0 || inProgressProposalCount > 0 || completedProposalCount > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Khởi tạo", value: draftProposalCount, color: "#f59e0b" },
                            { name: "Đang làm", value: inProgressProposalCount, color: "#3b82f6" },
                            { name: "Hoàn thành", value: completedProposalCount, color: "#10b981" },
                          ].filter(d => d.value > 0)}
                          innerRadius={24}
                          outerRadius={42}
                          dataKey="value"
                          stroke="#111827"
                          strokeWidth={2}
                          isAnimationActive={true}
                          animationBegin={100}
                          animationDuration={1200}
                          animationEasing="ease-out"
                        >
                          {[
                            { name: "Khởi tạo", value: draftProposalCount, color: "#f59e0b" },
                            { name: "Đang làm", value: inProgressProposalCount, color: "#3b82f6" },
                            { name: "Hoàn thành", value: completedProposalCount, color: "#10b981" },
                          ].filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} allowEscapeViewBox={{ x: true, y: true }} wrapperStyle={{ zIndex: 9999 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full rounded-full border-2 border-dashed border-slate-700 bg-slate-900/40 flex flex-col items-center justify-center p-1">
                      <span className="text-[0.6rem] text-slate-500 font-bold uppercase tracking-wider">Chưa có</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </KpiCard>

        {/* Box 4 — Ngân sách theo Sale (full list) */}
        <div
          className="relative overflow-hidden rounded-xl border border-white/5 bg-[#111827] p-3 flex flex-col gap-1.5 transition-all duration-300 hover:border-white/10"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 4px 16px rgba(0,0,0,0.3)" }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-violet-500" />
          <div className="flex items-center justify-between">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
              Ngân sách theo từng Sale
            </span>
            <span className="text-sm">👥</span>
          </div>

          {saleLeaderboard.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-600 text-xs py-3">
              Chưa có dữ liệu Sale
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-36 pr-1 scrollbar-thin">
              {saleLeaderboard.map((sale, idx) => {
                const variance = sale.budgetVariance;
                const pct = sale.totalAllocated > 0
                  ? Math.min((sale.totalInvested / sale.totalAllocated) * 100, 100)
                  : 0;
                return (
                  <div key={sale.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-4 h-4 rounded-full bg-violet-500/20 text-violet-300 text-[0.6rem] font-black flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-white truncate max-w-[90px]">{sale.name}</span>
                      </div>
                      <span
                        className={`text-[0.7rem] font-bold whitespace-nowrap ${variance >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {variance >= 0 ? "+" : ""}{fmt(variance)}
                      </span>
                    </div>
                    <BudgetBar
                      pct={pct}
                      color={variance >= 0 ? "linear-gradient(90deg,#7c3aed,#a78bfa)" : "linear-gradient(90deg,#be123c,#fb7185)"}
                    />
                    <div className="flex justify-between text-[0.6rem] text-slate-500 font-medium">
                      <span>Đầu tư: {fmt(sale.totalInvested)}</span>
                      <span>Cấp: {fmt(sale.totalAllocated)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Box 4 — Tổng quan chung */}
        <KpiCard
          title="Tổng quan chung toàn hệ thống"
          icon={<span className="text-lg">🌐</span>}
          accentColor="#38bdf8"
          mainValue={fmtFull(totalInvested)}
          mainColor="#38bdf8"
        >
          <div className="flex justify-between text-[0.72rem] font-semibold text-slate-400">
            <span>Ngân sách cấp: {fmt(totalAllocated)}</span>
            <span className="text-sky-300">{usagePercentage}% đã sử dụng</span>
          </div>
          <BudgetBar
            pct={usagePercentage}
            color="linear-gradient(90deg,#0284c7,#38bdf8)"
          />
          <div className="flex justify-between text-[0.7rem]">
            <span className="text-slate-500">Ngân sách còn dư</span>
            <span className={remainingBudget >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
              {remainingBudget >= 0 ? "+" : ""}{fmt(remainingBudget)} đ
            </span>
          </div>
        </KpiCard>

      </div>

      {/* ── BUDGET ANALYSIS BAR CHART ─────────────────────── */}
      {saleLeaderboard.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-[#111827] p-5" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
          <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-base">📊</span> So sánh Ngân sách Cấp vs Đầu tư Thực tế theo Sale
          </h2>
          <div className="w-full h-80">
            {isClient ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={saleLeaderboard.map(sale => ({
                    name: sale.name.split(" ").slice(-2).join(" "),
                    "Ngân sách cấp": sale.totalAllocated,
                    "Đã đầu tư": sale.totalInvested,
                  }))}
                  margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000000).toLocaleString('vi-VN')}M`}
                  />
                  <Tooltip
                    formatter={formatTooltip}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#f8fafc' }}
                    cursor={{ fill: '#334155', opacity: 0.4 }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Ngân sách cấp" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Đã đầu tư" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">Đang tải biểu đồ...</div>
            )}
          </div>
        </div>
      )}

      {/* ── ALLOCATED BUDGET BY SCHOOL & SALE TABLE ────────────────────── */}
      <div className="rounded-2xl border border-white/5 bg-[#111827] overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>💰</span> Chi tiết Ngân sách Cấp theo Trường & Sale
          </h2>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Tìm theo Trường hoặc Sale..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
        </div>

        {filteredAllocated.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-medium">
            Chưa có dữ liệu phân bổ ngân sách
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[0.68rem] font-bold uppercase tracking-wider text-slate-500 border-b border-white/5 bg-slate-900/40">
                  <th className="text-left px-5 py-3">#</th>
                  <th className="text-left px-5 py-3">Trường học</th>
                  <th className="text-left px-5 py-3">Sale quản lý</th>
                  <th className="text-center px-5 py-3">HS Mới</th>
                  <th className="text-right px-5 py-3">Ngân sách được cấp</th>
                  <th className="text-right px-5 py-3">Đã đầu tư</th>
                  <th className="text-center px-5 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllocated.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3 text-slate-500 font-bold text-xs">{idx + 1}</td>
                    <td className="px-5 py-3 font-semibold text-white text-[0.82rem]">
                      🏫 {item.schoolName}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        👤 {item.saleName}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center font-extrabold text-sky-400 text-xs">
                      🎓 {item.newStudents} HS
                    </td>
                    <td className="px-5 py-3 text-right text-emerald-400 font-bold text-[0.82rem]">
                      {fmtFull(item.allocatedBudget)}
                    </td>
                    <td className="px-5 py-3 text-right text-amber-300 font-bold text-[0.82rem]">
                      {fmtFull(item.investedBudget)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {item.status === "COMPLETED" ? (
                        <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          ✓ Hoàn thành
                        </span>
                      ) : item.status === "APPROVED" || item.status === "PENDING" ? (
                        <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                          ⏳ Đang thực hiện
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-slate-700 text-slate-400">
                          ✎ Bản thảo
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── SALE PERFORMANCE OVERVIEW TABLE ────────────────────────── */}
      <div className="rounded-2xl border border-white/5 bg-[#111827] overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🏆</span> Tổng quan Hiệu suất Ngân sách theo từng Sale
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Thống kê ngân sách cấp, số học sinh, kinh phí đầu tư (thiết bị, thi công &amp; đầu tư khác) và chi tiết từng trường
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet size={15} />
            <span>Xuất báo cáo Excel</span>
          </button>
        </div>

        {saleLeaderboard.length === 0 ? (
          <div className="py-16 text-center text-slate-600 text-sm">
            Chưa có dữ liệu Sale nào
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 bg-white/[0.02] border-b border-white/5">
                  <th className="text-left px-2 py-2.5 w-[3%]">#</th>
                  <th className="text-left px-2.5 py-2.5 w-[16%]">Nhân viên Sale</th>
                  <th className="text-right px-2 py-2.5 w-[8%]">HS mới</th>
                  <th className="text-right px-2 py-2.5 w-[11%]">Ngân sách cấp</th>
                  <th className="text-right px-2 py-2.5 w-[11%]">Đã đầu tư</th>
                  <th className="text-right px-2 py-2.5 w-[10%]">Thiết bị</th>
                  <th className="text-right px-2 py-2.5 w-[10%]">Thi công</th>
                  <th className="text-right px-2 py-2.5 w-[10%]">Đầu tư khác</th>
                  <th className="text-right px-2 py-2.5 w-[11%]">Chênh lệch</th>
                  <th className="text-center px-2 py-2.5 w-[10%]">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {saleLeaderboard.map((sale, idx) => {
                  const isNeg = sale.budgetVariance < 0;
                  return (
                    <tr
                      key={sale.id}
                      onClick={() => {
                        setSelectedSaleModal(sale);
                        setModalTab("ALL");
                      }}
                      className="border-b border-white/[0.03] hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      <td className="px-2 py-2.5 text-slate-500 font-bold text-xs text-left">{idx + 1}</td>
                      <td className="px-2.5 py-2.5">
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center text-[0.65rem] font-black text-white flex-shrink-0 shadow-md">
                            {sale.name.charAt(sale.name.lastIndexOf(" ") + 1)}
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-white text-[0.78rem] group-hover:text-sky-300 transition-colors truncate">{sale.name}</div>
                            <div className="text-slate-400 text-[0.65rem] truncate">{sale.schoolCount} trường</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-right font-semibold text-slate-300 text-[0.72rem] whitespace-nowrap">
                        {sale.totalStudents.toLocaleString("vi-VN")} HS
                      </td>
                      <td className="px-2 py-2.5 text-right font-bold text-sky-400 text-[0.72rem] whitespace-nowrap">
                        {fmtFull(sale.totalAllocated)}
                      </td>
                      <td className="px-2 py-2.5 text-right font-bold text-white text-[0.72rem] whitespace-nowrap">
                        {fmtFull(sale.totalInvested)}
                      </td>
                      <td className="px-2 py-2.5 text-right font-semibold text-amber-400 text-[0.72rem] whitespace-nowrap">
                        {fmtFull(sale.totalItemBudget)}
                      </td>
                      <td className="px-2 py-2.5 text-right font-semibold text-cyan-400 text-[0.72rem] whitespace-nowrap">
                        {fmtFull(sale.totalConstructionBudget)}
                      </td>
                      <td className="px-2 py-2.5 text-right font-semibold text-amber-600 text-[0.72rem] whitespace-nowrap">
                        {fmtFull(sale.totalOtherBudget)}
                      </td>
                      <td className={`px-2 py-2.5 text-right font-black text-[0.72rem] whitespace-nowrap ${isNeg ? "text-rose-400" : "text-emerald-400"}`}>
                        {isNeg ? "" : "+"}{fmtFull(sale.budgetVariance)}
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSaleModal(sale);
                            setModalTab("ALL");
                          }}
                          className="px-2.5 py-1 rounded-lg text-[0.7rem] font-bold bg-sky-500/10 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 transition-all flex items-center justify-center mx-auto whitespace-nowrap"
                        >
                          <span>Xem chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── INTERACTIVE SALE SCHOOLS BUDGET MODAL (PORTAL TO BODY) ────────────────────────── */}
      {selectedSaleModal && isClient && createPortal(
        (() => {
          const negSchools = selectedSaleModal.schools.filter(s => s.variance < 0);
          const posSchools = selectedSaleModal.schools.filter(s => s.variance >= 0);
          const displaySchools = modalTab === "NEGATIVE" 
            ? negSchools 
            : modalTab === "POSITIVE" 
            ? posSchools 
            : selectedSaleModal.schools;

          return (
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
              style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, width: "100vw", height: "100vh", zIndex: 999999 }}
              onClick={() => setSelectedSaleModal(null)}
            >
              <div
                className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-4xl w-full flex flex-col shadow-2xl overflow-hidden relative max-h-[85vh] my-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedSaleModal(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors z-10"
                >
                  <X size={20} />
                </button>

                {/* Modal Header */}
                <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center text-sm font-black text-white shadow-lg">
                      {selectedSaleModal.name.charAt(selectedSaleModal.name.lastIndexOf(" ") + 1)}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white flex items-center gap-2">
                        Chi tiết Ngân sách các Trường — Sale {selectedSaleModal.name}
                      </h3>
                      <p className="text-slate-400 text-xs">
                        Quản lý {selectedSaleModal.schoolCount} trường học · {selectedSaleModal.totalStudents.toLocaleString("vi-VN")} HS · {selectedSaleModal.proposalCount} hồ sơ dự trù
                      </p>
                    </div>
                  </div>

                  {/* Summary Financial Pills */}
                  <div className="grid grid-cols-4 gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 text-[0.62rem] font-bold uppercase tracking-wider block">Ngân sách cấp</span>
                      <strong className="text-sky-400 text-xs sm:text-sm font-black block mt-0.5">{fmtFull(selectedSaleModal.totalAllocated)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[0.62rem] font-bold uppercase tracking-wider block">Đã đầu tư</span>
                      <strong className="text-white text-xs sm:text-sm font-black block mt-0.5">{fmtFull(selectedSaleModal.totalInvested)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[0.62rem] font-bold uppercase tracking-wider block">Chênh lệch</span>
                      <strong className={`text-xs sm:text-sm font-black block mt-0.5 ${selectedSaleModal.budgetVariance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {selectedSaleModal.budgetVariance >= 0 ? "+" : ""}{fmtFull(selectedSaleModal.budgetVariance)}
                      </strong>
                    </div>
                    <div className="border-l border-slate-800 pl-3">
                      <span className="text-slate-500 text-[0.62rem] font-bold uppercase tracking-wider block mb-1">Cơ cấu đầu tư chi tiết</span>
                      <div className="flex flex-col gap-0.5 text-[0.7rem]">
                        <div className="flex justify-between items-center gap-2"><span className="text-amber-400 font-medium">• Thiết bị:</span> <strong className="text-amber-300 font-bold">{fmtFull(selectedSaleModal.totalItemBudget)}</strong></div>
                        <div className="flex justify-between items-center gap-2"><span className="text-cyan-400 font-medium">• Thi công:</span> <strong className="text-cyan-300 font-bold">{fmtFull(selectedSaleModal.totalConstructionBudget)}</strong></div>
                        <div className="flex justify-between items-center gap-2"><span className="text-amber-600 font-medium">• Đầu tư khác:</span> <strong className="text-amber-500 font-bold">{fmtFull(selectedSaleModal.totalOtherBudget)}</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Tab Filter Control */}
                  <div className="flex gap-2 text-xs font-bold pt-0.5">
                    <button
                      onClick={() => setModalTab("ALL")}
                      className={`px-3 py-1.5 rounded-lg border transition-all ${
                        modalTab === "ALL"
                          ? "bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm"
                          : "bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800"
                      }`}
                    >
                      Tất cả trường ({selectedSaleModal.schools.length})
                    </button>
                    <button
                      onClick={() => setModalTab("NEGATIVE")}
                      className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                        modalTab === "NEGATIVE"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm"
                          : "bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800"
                      }`}
                    >
                      <span>🛑 Trường Vượt Định Mức (Ngân sách Âm)</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[0.6rem] bg-rose-500/30 text-rose-300">
                        {negSchools.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setModalTab("POSITIVE")}
                      className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                        modalTab === "POSITIVE"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                          : "bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800"
                      }`}
                    >
                      <span>❇️ Trường Trong Hạn Mức (Ngân sách Dương)</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[0.6rem] bg-emerald-500/30 text-emerald-300">
                        {posSchools.length}
                      </span>
                    </button>
                  </div>
                </div>

                {/* School Cards List */}
                <div className="p-5 overflow-y-auto flex flex-col gap-2.5 max-h-[48vh] scrollbar-thin">
                  {displaySchools.length === 0 ? (
                    <div className="py-10 text-center text-slate-500 text-sm">
                      Không có trường nào trong mục này.
                    </div>
                  ) : (
                    displaySchools.map((item) => {
                      const isNeg = item.variance < 0;
                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                            isNeg
                              ? "bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50"
                              : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex flex-col gap-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <SchoolIcon size={15} className={isNeg ? "text-rose-400" : "text-sky-400"} />
                              <strong className="text-white font-bold text-sm truncate">{item.schoolName}</strong>
                              <span className="text-slate-400 text-xs font-semibold">({item.studentsCount} HS)</span>
                              {isNeg ? (
                                <span className="px-2 py-0.5 rounded text-[0.62rem] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                  ⚠ Âm ngân sách
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[0.62rem] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                  ✓ Trong định mức
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3 text-[0.72rem] text-slate-400 mt-0.5">
                              <span>Ngân sách cấp: <strong className="text-sky-300 font-bold">{fmtFull(item.allocatedBudget)}</strong></span>
                              <span>Đã đầu tư: <strong className="text-white font-bold">{fmtFull(item.investedBudget)}</strong></span>
                              <span className="text-slate-500">
                                (Thiết bị: {fmt(item.itemBudget)} · Thi công: {fmt(item.constructionBudget)} · Khác: {fmt(item.otherBudget)})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0 text-right">
                            <div>
                              <span className="text-[0.6rem] font-bold uppercase tracking-wider text-slate-400 block">Chênh lệch</span>
                              <strong className={`text-sm font-black ${isNeg ? "text-rose-400" : "text-emerald-400"}`}>
                                {isNeg ? "" : "+"}{fmtFull(item.variance)}
                              </strong>
                            </div>

                            {item.proposalId && (
                              <Link
                                href={`/admin/proposals/${item.proposalId}`}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 transition-all flex items-center gap-1"
                              >
                                <span>Dự trù</span>
                                <ExternalLink size={12} />
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-3.5 border-t border-slate-800 bg-slate-900/60 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedSaleModal(null)}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              </div>
            </div>
          );
        })(),
        document.body
      )}
    </div>
  );
}
