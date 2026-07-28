"use client";

import React from "react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { PieChart as PieIcon, BarChart3, TrendingUp, Clock, Lock, CheckCircle2, Coins, Wallet, ShieldCheck, AlertTriangle } from "lucide-react";

interface SaleDashboardChartsProps {
  stats: {
    totalSchools: number;
    totalProposals: number;
    initCount: number;
    lockedCount: number;
    completedCount: number;
    totalAllocated: number;
    totalInvested: number;
    delta: number;
  };
  schoolBudgets: Array<{
    name: string;
    allocated: number;
    invested: number;
    delta: number;
  }>;
}

export default function SaleDashboardCharts({ stats, schoolBudgets }: SaleDashboardChartsProps) {
  // Data for Chart 1: Donut Chart (General Info Status Distribution)
  const statusData = [
    { name: "Khởi tạo", value: stats.initCount, color: "#fb923c" },
    { name: "Đang thực hiện", value: stats.lockedCount, color: "#f43f5e" },
    { name: "Hoàn thành", value: stats.completedCount, color: "#10b981" },
  ].filter(d => d.value > 0);

  const chartStatusData = statusData.length > 0 ? statusData : [
    { name: "Chưa có dữ liệu", value: 1, color: "#475569" }
  ];

  // Calculate budget utilization rate %
  const utilizationRate = stats.totalAllocated > 0 
    ? Math.min(100, Math.round((stats.totalInvested / stats.totalAllocated) * 100))
    : 0;

  // Aggregate Budget Comparison Data for Chart 2
  const aggregateBudgetData = [
    {
      category: "Tổng Ngân Sách",
      "Ngân sách cấp": stats.totalAllocated,
      "Đã đầu tư": stats.totalInvested,
      "Chênh lệch": Math.abs(stats.delta),
    }
  ];

  // Positive vs Negative School Counts
  const positiveCount = schoolBudgets.filter(s => s.delta >= 0).length;
  const negativeCount = schoolBudgets.filter(s => s.delta < 0).length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.5rem", marginBottom: "1.75rem" }}>
      
      {/* CHART 1: BIỂU ĐỒ PHÂN BỔ THÔNG TIN CHUNG & TRẠNG THÁI */}
      <div className="sale-table-card" style={{ padding: "1.35rem 1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(99, 102, 241, 0.15)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PieIcon size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                  Biểu đồ Phân bổ Hồ sơ Dự trù
                </h3>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Tỷ lệ hồ sơ theo từng giai đoạn xử lý</span>
              </div>
            </div>
            <span style={{ fontSize: "0.72rem", background: "rgba(99, 102, 241, 0.12)", color: "#818cf8", padding: "0.2rem 0.6rem", borderRadius: "6px", fontWeight: 700 }}>
              Tổng: {stats.totalProposals} hồ sơ
            </span>
          </div>

          <div style={{ height: "200px", width: "100%", position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(15, 23, 42, 0.8)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: "#0f172a", borderColor: "#334155", borderRadius: "10px", color: "#fff", fontSize: "0.825rem" }}
                  formatter={(val: any) => [`${val} hồ sơ`, "Số lượng"]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Summary Label */}
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              textAlign: "center", pointerEvents: "none"
            }}>
              <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "#ffffff", lineHeight: 1 }}>
                {stats.totalProposals}
              </div>
              <div style={{ fontSize: "0.68rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, marginTop: "0.25rem" }}>
                Hồ sơ
              </div>
            </div>
          </div>
        </div>

        {/* Status Legend Breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--sale-card-border)" }}>
          <div style={{ background: "rgba(251, 146, 60, 0.08)", border: "1px solid rgba(251, 146, 60, 0.2)", borderRadius: "10px", padding: "0.6rem 0.75rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.7rem", color: "#fb923c", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}>
              <Clock size={12} /> Khởi tạo
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#ffffff", marginTop: "0.2rem" }}>
              {stats.initCount}
            </div>
          </div>

          <div style={{ background: "rgba(244, 63, 94, 0.08)", border: "1px solid rgba(244, 63, 94, 0.2)", borderRadius: "10px", padding: "0.6rem 0.75rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.7rem", color: "#fb7185", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}>
              <Lock size={12} /> Đang thực hiện
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#ffffff", marginTop: "0.2rem" }}>
              {stats.lockedCount}
            </div>
          </div>

          <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "10px", padding: "0.6rem 0.75rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.7rem", color: "#34d399", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}>
              <CheckCircle2 size={12} /> Hoàn thành
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#ffffff", marginTop: "0.2rem" }}>
              {stats.completedCount}
            </div>
          </div>
        </div>
      </div>

      {/* CHART 2: BIỂU ĐỒ TỔNG QUAN VÀ CÂN ĐỐI NGÂN SÁCH HỆ THỐNG */}
      <div className="sale-table-card" style={{ padding: "1.35rem 1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BarChart3 size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                  Biểu đồ Cân đối Ngân sách Tổng hợp
                </h3>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Tổng hợp Định mức Cấp vs Đã Đầu Tư Toàn Bộ Hệ Thống</span>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600 }}>Tỷ lệ sử dụng</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: utilizationRate <= 100 ? "#34d399" : "#fb7185" }}>
                {utilizationRate}%
              </div>
            </div>
          </div>

          {/* Aggregate Budget Visualizer Bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", margin: "1rem 0" }}>
            {/* Bar 1: Ngân sách cấp */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.35rem" }}>
                <span style={{ color: "#94a3b8", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Coins size={14} color="#10b981" /> Ngân Sách Cấp (Định mức)
                </span>
                <strong style={{ color: "#34d399", fontWeight: 800 }}>{stats.totalAllocated.toLocaleString()} VNĐ</strong>
              </div>
              <div style={{ height: "10px", background: "rgba(30, 41, 59, 0.8)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: "100%", background: "#10b981", borderRadius: "999px" }} />
              </div>
            </div>

            {/* Bar 2: Ngân sách đã đầu tư */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.35rem" }}>
                <span style={{ color: "#94a3b8", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Wallet size={14} color="#fbbf24" /> Ngân Sách Đã Đầu Tư
                </span>
                <strong style={{ color: "#fbbf24", fontWeight: 800 }}>{stats.totalInvested.toLocaleString()} VNĐ</strong>
              </div>
              <div style={{ height: "10px", background: "rgba(30, 41, 59, 0.8)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${utilizationRate}%`, background: "#fbbf24", borderRadius: "999px" }} />
              </div>
            </div>

            {/* Bar 3: Chênh lệch ngân sách */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.35rem" }}>
                <span style={{ color: "#94a3b8", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <TrendingUp size={14} color={stats.delta >= 0 ? "#34d399" : "#fb7185"} /> 
                  {stats.delta >= 0 ? "Chênh Lệch Dư (Tiết kiệm)" : "Chênh Lệch Vượt (Thiếu)"}
                </span>
                <strong style={{ color: stats.delta >= 0 ? "#34d399" : "#fb7185", fontWeight: 800 }}>
                  {stats.delta >= 0 ? "+" : ""}{stats.delta.toLocaleString()} VNĐ
                </strong>
              </div>
              <div style={{ height: "10px", background: "rgba(30, 41, 59, 0.8)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ 
                  height: "100%", 
                  width: stats.totalAllocated > 0 ? `${Math.min(100, Math.round((Math.abs(stats.delta) / stats.totalAllocated) * 100))}%` : "0%", 
                  background: stats.delta >= 0 ? "#06b6d4" : "#f43f5e", 
                  borderRadius: "999px" 
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* School Budget Status Counts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem", marginTop: "0.75rem", paddingTop: "0.85rem", borderTop: "1px solid var(--sale-card-border)" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "10px", padding: "0.6rem 0.85rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <ShieldCheck size={14} /> Ngân sách an toàn
            </div>
            <strong style={{ fontSize: "1rem", color: "#ffffff" }}>{positiveCount} trường</strong>
          </div>

          <div style={{ background: "rgba(244, 63, 94, 0.08)", border: "1px solid rgba(244, 63, 94, 0.2)", borderRadius: "10px", padding: "0.6rem 0.85rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: "0.75rem", color: "#fb7185", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <AlertTriangle size={14} /> Vượt định mức
            </div>
            <strong style={{ fontSize: "1rem", color: "#ffffff" }}>{negativeCount} trường</strong>
          </div>
        </div>
      </div>

    </div>
  );
}
