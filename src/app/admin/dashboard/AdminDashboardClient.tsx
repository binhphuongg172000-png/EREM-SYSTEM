"use client";

import React, { useState, useEffect } from "react";
import { vietnameseIncludes } from "@/lib/vietnamese";
import Link from "next/link";
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
  pendingSchoolCount: number;
  completedAllocated: number;
  completedInvested: number;
  completedItemBudget: number;
  completedOtherBudget: number;
  completedSchoolCount: number;
  draftProposalCount?: number;
  inProgressProposalCount?: number;
  completedProposalCount?: number;
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
      className="relative rounded-2xl border border-white/5 bg-[#111827] p-5 flex flex-col gap-3 transition-all duration-300 hover:border-white/10 hover:shadow-2xl hover:-translate-y-0.5 hover:z-30"
      style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.4)` }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: accentColor }}
      />

      {/* Title row */}
      <div className="flex items-center justify-between">
        <span className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-400">
          {title}
        </span>
        <span className="opacity-70">{icon}</span>
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
  pendingItemBudget,
  pendingOtherBudget,
  pendingSchoolCount,
  completedAllocated,
  completedInvested,
  completedItemBudget,
  completedOtherBudget,
  completedSchoolCount,
  draftProposalCount = 0,
  inProgressProposalCount = 0,
  completedProposalCount = 0,
  saleLeaderboard,
  allocatedBreakdown = [],
  overdueProposals = [],
}: Props) {
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    { name: "Thiết bị", value: pendingItemBudget, color: "#fbbf24" },
    { name: "Đầu tư khác", value: pendingOtherBudget, color: "#d97706" },
    { name: "Chưa đầu tư", value: Math.max(0, pendingAllocated - pendingInvested), color: "#10b981" }
  ];
  
  const completedPieData = [
    { name: "Thiết bị", value: completedItemBudget, color: "#fbbf24" },
    { name: "Đầu tư khác", value: completedOtherBudget, color: "#d97706" },
    { name: "Chưa đầu tư", value: Math.max(0, completedAllocated - completedInvested), color: "#10b981" }
  ];

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
          <div className="flex flex-col mt-2">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-3 w-1/2">
                  <div className="text-[0.7rem] text-slate-400 font-bold uppercase tracking-wider">Cơ cấu Đầu tư</div>
                  
                  <div className="flex flex-col">
                    <span className="text-[0.65rem] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Tổng kinh phí</span>
                    <span className="text-lg font-extrabold text-emerald-400">{fmtFull(pendingInvested)}</span>
                  </div>

                  <div className="flex flex-col text-sm">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      <span className="text-slate-300 font-medium">Thiết bị</span>
                    </div>
                    <span className="text-white font-bold ml-4.5">{fmtFull(pendingItemBudget)}</span>
                  </div>
                  <div className="flex flex-col text-sm">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]"></span>
                      <span className="text-slate-300 font-medium">Đầu tư khác</span>
                    </div>
                    <span className="text-white font-bold ml-4.5">{fmtFull(pendingOtherBudget)}</span>
                  </div>
                  <div className="flex flex-col text-sm">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span className="text-slate-300 font-medium">Chưa đầu tư</span>
                    </div>
                    <span className="text-emerald-400 font-bold ml-4.5">{fmtFull(Math.max(0, pendingAllocated - pendingInvested))}</span>
                  </div>
                </div>
                
                {/* Pie Chart */}
                <div className="w-32 h-32 relative flex-shrink-0">
                  {isClient && (pendingItemBudget > 0 || pendingOtherBudget > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pendingPieData}
                          innerRadius={32}
                          outerRadius={56}
                          dataKey="value"
                          stroke="#1e293b"
                          strokeWidth={3}
                        >
                          {pendingPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} allowEscapeViewBox={{ x: true, y: true }} wrapperStyle={{ zIndex: 9999 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full rounded-full border-4 border-white/5 flex items-center justify-center">
                      <span className="text-[0.6rem] text-slate-500 font-semibold uppercase">Chưa có</span>
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
          <div className="flex flex-col mt-2">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-3 w-1/2">
                  <div className="text-[0.7rem] text-slate-400 font-bold uppercase tracking-wider">Cơ cấu Đầu tư</div>
                  
                  <div className="flex flex-col">
                    <span className="text-[0.65rem] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Tổng kinh phí</span>
                    <span className="text-lg font-extrabold text-emerald-400">{fmtFull(completedInvested)}</span>
                  </div>

                  <div className="flex flex-col text-sm">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      <span className="text-slate-300 font-medium">Thiết bị</span>
                    </div>
                    <span className="text-white font-bold ml-4.5">{fmtFull(completedItemBudget)}</span>
                  </div>
                  <div className="flex flex-col text-sm">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]"></span>
                      <span className="text-slate-300 font-medium">Đầu tư khác</span>
                    </div>
                    <span className="text-white font-bold ml-4.5">{fmtFull(completedOtherBudget)}</span>
                  </div>
                  <div className="flex flex-col text-sm">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span className="text-slate-300 font-medium">Chưa đầu tư</span>
                    </div>
                    <span className="text-emerald-400 font-bold ml-4.5">{fmtFull(Math.max(0, completedAllocated - completedInvested))}</span>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="w-32 h-32 relative flex-shrink-0">
                  {isClient && (completedItemBudget > 0 || completedOtherBudget > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={completedPieData}
                          innerRadius={32}
                          outerRadius={56}
                          dataKey="value"
                          stroke="#1e293b"
                          strokeWidth={3}
                        >
                          {completedPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} allowEscapeViewBox={{ x: true, y: true }} wrapperStyle={{ zIndex: 9999 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full rounded-full border-4 border-white/5 flex items-center justify-center">
                      <span className="text-[0.6rem] text-slate-500 font-semibold uppercase">Chưa có</span>
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
          <div className="flex flex-col mt-2">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2.5 w-1/2">
                  <div className="text-[0.7rem] text-slate-400 font-bold uppercase tracking-wider">Số lượng Chi tiết</div>
                  
                  <div className="flex flex-col text-xs">
                    <span className="text-slate-400 text-[0.65rem] font-semibold uppercase">Số trường</span>
                    <span className="text-blue-400 font-extrabold text-sm">{totalSchools}</span>
                  </div>

                  <div className="flex flex-col text-xs">
                    <span className="text-slate-400 text-[0.65rem] font-semibold uppercase">Dự trù khởi tạo</span>
                    <span className="text-amber-400 font-extrabold text-sm">{draftProposalCount}</span>
                  </div>

                  <div className="flex flex-col text-xs">
                    <span className="text-slate-400 text-[0.65rem] font-semibold uppercase">Đang thực hiện</span>
                    <span className="text-cyan-400 font-extrabold text-sm">{inProgressProposalCount}</span>
                  </div>

                  <div className="flex flex-col text-xs">
                    <span className="text-slate-400 text-[0.65rem] font-semibold uppercase">Đã hoàn thành</span>
                    <span className="text-emerald-400 font-extrabold text-sm">{completedProposalCount}</span>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="w-32 h-36 relative flex-shrink-0 pt-2">
                  {isClient ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={proposalStatsData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {proposalStatsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </KpiCard>

        {/* Box 4 — Ngân sách theo Sale (full list) */}
        <div
          className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#111827] p-5 flex flex-col gap-3 transition-all duration-300 hover:border-white/10"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.4)" }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-violet-500" />
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-400">
              Ngân sách theo từng Sale
            </span>
            <span className="text-lg">👥</span>
          </div>

          {saleLeaderboard.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-600 text-sm py-4">
              Chưa có dữ liệu Sale
            </div>
          ) : (
            <div className="flex flex-col gap-3 overflow-y-auto max-h-52 pr-1 scrollbar-thin">
              {saleLeaderboard.map((sale, idx) => {
                const variance = sale.budgetVariance;
                const pct = sale.totalAllocated > 0
                  ? Math.min((sale.totalInvested / sale.totalAllocated) * 100, 100)
                  : 0;
                return (
                  <div key={sale.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 text-[0.65rem] font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-bold text-white">{sale.name}</span>
                        <span className="text-[0.65rem] text-slate-500">
                          ({sale.schoolCount} trường · {sale.proposalCount} dự trù)
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold ${variance >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {variance >= 0 ? "+" : ""}{fmt(variance)}
                      </span>
                    </div>
                    <BudgetBar
                      pct={pct}
                      color={variance >= 0 ? "linear-gradient(90deg,#7c3aed,#a78bfa)" : "linear-gradient(90deg,#be123c,#fb7185)"}
                    />
                    <div className="flex justify-between text-[0.65rem] text-slate-500 font-medium">
                      <span>Đã đầu tư: {fmt(sale.totalInvested)} đ</span>
                      <span>Cấp: {fmt(sale.totalAllocated)} đ</span>
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

      {/* ── SALE PERFORMANCE TABLE ────────────────────────── */}
      <div className="rounded-2xl border border-white/5 bg-[#111827] overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>🏆</span> Bảng hiệu suất Sale
          </h2>
          <Link href="/admin/users" className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors">
            Quản lý Sale →
          </Link>
        </div>

        {saleLeaderboard.length === 0 ? (
          <div className="py-16 text-center text-slate-600 text-sm">
            Chưa có dữ liệu Sale nào
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[0.68rem] font-bold uppercase tracking-wider text-slate-500 border-b border-white/5">
                <th className="text-left px-5 py-3">#</th>
                <th className="text-left px-5 py-3">Nhân viên Sale</th>
                <th className="text-right px-5 py-3">Số trường</th>
                <th className="text-right px-5 py-3">Số dự trù</th>
                <th className="text-right px-5 py-3">Ngân sách cấp</th>
                <th className="text-right px-5 py-3">Đã đầu tư</th>
                <th className="text-right px-5 py-3">Chênh lệch</th>
                <th className="text-center px-5 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {saleLeaderboard.map((sale, idx) => {
                const isNeg = sale.budgetVariance < 0;
                const pct = sale.totalAllocated > 0
                  ? Math.round((sale.totalInvested / sale.totalAllocated) * 100)
                  : 0;
                return (
                  <tr
                    key={sale.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-5 py-3 text-slate-500 font-bold text-xs">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center text-xs font-black text-white flex-shrink-0">
                          {sale.name.charAt(sale.name.lastIndexOf(" ") + 1)}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-[0.82rem]">{sale.name}</div>
                          <div className="text-slate-500 text-[0.68rem]">@{sale.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right text-slate-300 font-semibold">{sale.schoolCount}</td>
                    <td className="px-5 py-3 text-right text-slate-300 font-semibold">{sale.proposalCount}</td>
                    <td className="px-5 py-3 text-right text-sky-300 font-semibold text-[0.8rem]">
                      {fmt(sale.totalAllocated)} đ
                    </td>
                    <td className="px-5 py-3 text-right text-white font-semibold text-[0.8rem]">
                      {fmt(sale.totalInvested)} đ
                    </td>
                    <td className={`px-5 py-3 text-right font-bold text-[0.8rem] ${isNeg ? "text-rose-400" : "text-emerald-400"}`}>
                      {isNeg ? "" : "+"}{fmt(sale.budgetVariance)} đ
                    </td>
                    <td className="px-5 py-3 text-center">
                      {sale.totalAllocated === 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-slate-700 text-slate-400">Chưa có</span>
                      ) : isNeg ? (
                        <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/20">
                          ⚠ Âm ngân sách
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          ✓ {pct}% sử dụng
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
