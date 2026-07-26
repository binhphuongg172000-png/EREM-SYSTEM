"use client";

import React from "react";
import Link from "next/link";
import type { SaleStat } from "./page";

type Props = {
  totalSchools: number;
  totalHandovers: number;
  totalAllocated: number;
  totalInvested: number;
  usagePercentage: number;
  remainingBudget: number;
  pendingCount: number;
  pendingAllocated: number;
  pendingInvested: number;
  completedCount: number;
  completedAllocated: number;
  completedInvested: number;
  saleLeaderboard: SaleStat[];
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
      className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#111827] p-5 flex flex-col gap-3 transition-all duration-300 hover:border-white/10 hover:shadow-2xl hover:-translate-y-0.5"
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
      <div className="text-2xl font-extrabold tracking-tight" style={{ color: mainColor }}>
        {mainValue}
      </div>

      {/* Slot for extra content */}
      {children}
    </div>
  );
}

export default function AdminDashboardClient({
  totalSchools,
  totalHandovers,
  totalAllocated,
  totalInvested,
  usagePercentage,
  remainingBudget,
  pendingCount,
  pendingAllocated,
  pendingInvested,
  completedCount,
  completedAllocated,
  completedInvested,
  saleLeaderboard,
}: Props) {
  const pendingVariance = pendingAllocated - pendingInvested;
  const completedVariance = completedAllocated - completedInvested;

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

      {/* ── 4 KPI CARDS (2×2) ─────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Box 1 — Dự trù Khởi tạo */}
        <KpiCard
          title="Ngân sách Dự trù Khởi tạo"
          icon={<span className="text-lg">🕐</span>}
          accentColor="#f59e0b"
          mainValue={fmtFull(pendingInvested)}
          mainColor="#fbbf24"
        >
          <div className="flex justify-between text-[0.72rem] font-semibold text-slate-400">
            <span>{pendingCount} dự trù đang chờ</span>
            <span className="text-slate-300">Ngân sách cấp: {fmt(pendingAllocated)}</span>
          </div>
          <BudgetBar
            pct={pendingAllocated > 0 ? (pendingInvested / pendingAllocated) * 100 : 0}
            color="linear-gradient(90deg,#d97706,#fbbf24)"
          />
          <div className="flex justify-between text-[0.7rem]">
            <span className="text-slate-500">Đã đầu tư / Ngân sách cấp</span>
            <span className={pendingVariance >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
              {pendingVariance >= 0 ? "+" : ""}{fmt(pendingVariance)} đ
            </span>
          </div>
        </KpiCard>

        {/* Box 2 — Dự trù Hoàn thành */}
        <KpiCard
          title="Ngân sách Dự trù Hoàn thành"
          icon={<span className="text-lg">✅</span>}
          accentColor="#10b981"
          mainValue={fmtFull(completedInvested)}
          mainColor="#34d399"
        >
          <div className="flex justify-between text-[0.72rem] font-semibold text-slate-400">
            <span>{completedCount} dự trù hoàn thành</span>
            <span className="text-slate-300">Ngân sách cấp: {fmt(completedAllocated)}</span>
          </div>
          <BudgetBar
            pct={completedAllocated > 0 ? (completedInvested / completedAllocated) * 100 : 0}
            color="linear-gradient(90deg,#059669,#34d399)"
          />
          <div className="flex justify-between text-[0.7rem]">
            <span className="text-slate-500">Đã đầu tư / Ngân sách cấp</span>
            <span className={completedVariance >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
              {completedVariance >= 0 ? "+" : ""}{fmt(completedVariance)} đ
            </span>
          </div>
        </KpiCard>

        {/* Box 3 — Ngân sách theo Sale (full list) */}
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
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-base">📊</span> So sánh Ngân sách Cấp vs Đầu tư Thực tế theo Sale
          </h2>
          <div className="flex gap-6 items-end min-h-[140px] overflow-x-auto pb-2">
            {saleLeaderboard.map(sale => {
              const maxBudget = Math.max(...saleLeaderboard.map(s => s.totalAllocated), 1);
              const allocH = Math.max((sale.totalAllocated / maxBudget) * 120, 4);
              const investH = Math.max((sale.totalInvested / maxBudget) * 120, 4);
              const isOver = sale.totalInvested > sale.totalAllocated;
              return (
                <div key={sale.id} className="flex flex-col items-center gap-2 min-w-[80px]">
                  <div className="flex items-end gap-1 h-[120px]">
                    <div
                      title={`Ngân sách cấp: ${fmtFull(sale.totalAllocated)}`}
                      className="w-7 rounded-t-md transition-all duration-700 cursor-pointer hover:opacity-80"
                      style={{ height: allocH, background: "linear-gradient(180deg,#0ea5e9,#0369a1)" }}
                    />
                    <div
                      title={`Đã đầu tư: ${fmtFull(sale.totalInvested)}`}
                      className="w-7 rounded-t-md transition-all duration-700 cursor-pointer hover:opacity-80"
                      style={{
                        height: investH,
                        background: isOver
                          ? "linear-gradient(180deg,#f43f5e,#be123c)"
                          : "linear-gradient(180deg,#10b981,#047857)"
                      }}
                    />
                  </div>
                  <span className="text-[0.65rem] font-semibold text-slate-400 text-center leading-tight w-full">
                    {sale.name.split(" ").slice(-2).join(" ")}
                  </span>
                </div>
              );
            })}
            <div className="flex flex-col gap-2 ml-4 justify-end pb-6">
              <div className="flex items-center gap-2 text-[0.68rem] text-slate-400">
                <div className="w-3 h-3 rounded-sm" style={{ background: "#0ea5e9" }} />
                Ngân sách cấp
              </div>
              <div className="flex items-center gap-2 text-[0.68rem] text-slate-400">
                <div className="w-3 h-3 rounded-sm" style={{ background: "#10b981" }} />
                Đã đầu tư (dương)
              </div>
              <div className="flex items-center gap-2 text-[0.68rem] text-slate-400">
                <div className="w-3 h-3 rounded-sm" style={{ background: "#f43f5e" }} />
                Đã đầu tư (âm)
              </div>
            </div>
          </div>
        </div>
      )}

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
