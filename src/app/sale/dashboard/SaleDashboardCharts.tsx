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
    totalItemCost?: number;
    totalConstrCost?: number;
    totalOtherCost?: number;
    totalNewStudents?: number;
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
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", marginBottom: "1.75rem" }}>
      
      {/* CHART 1: BIỂU ĐỒ PHÂN BỔ THÔNG TIN CHUNG & TRẠNG THÁI */}
      <div className="sale-table-card" style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(99, 102, 241, 0.15)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PieIcon size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: "0.9rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                  Biểu đồ Phân bổ Hồ sơ Dự trù
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.2rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.7rem", color: "#fb923c", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fb923c" }}></span> Khởi tạo: {stats.initCount}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "#fb7185", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fb7185" }}></span> Đang thực hiện: {stats.lockedCount}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "#34d399", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }}></span> Hoàn thành: {stats.completedCount}
                  </span>
                </div>
              </div>
            </div>
            <span style={{ fontSize: "0.7rem", background: "rgba(99, 102, 241, 0.12)", color: "#818cf8", padding: "0.15rem 0.5rem", borderRadius: "6px", fontWeight: 700 }}>
              Tổng: {stats.totalProposals} hồ sơ
            </span>
          </div>

          <div style={{ height: "140px", width: "100%", position: "relative" }}>
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                  <Pie
                    data={chartStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={58}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={true}
                    animationBegin={100}
                    animationDuration={1200}
                    animationEasing="ease-out"
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
            )}

            {/* Center Summary Label */}
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              textAlign: "center", pointerEvents: "none"
            }}>
              <div style={{ fontSize: "1.15rem", fontWeight: 900, color: "#ffffff", lineHeight: 1 }}>
                {stats.totalProposals}
              </div>
              <div style={{ fontSize: "0.62rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, marginTop: "0.15rem" }}>
                Hồ sơ
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHART 2: BIỂU ĐỒ TỔNG QUAN VÀ CÂN ĐỐI NGÂN SÁCH HỆ THỐNG */}
      <div className="sale-table-card" style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BarChart3 size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: "0.9rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                  Biểu đồ Cân đối Ngân sách Tổng hợp
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.2rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.7rem", color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }}></span> Ngân sách cấp
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "#38bdf8", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#38bdf8" }}></span> Thiết bị
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "#a855f7", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7" }}></span> Đầu tư khác
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "#f59e0b", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }}></span> Thi công
                  </span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600 }}>Tỷ lệ sử dụng</div>
              <div style={{ fontSize: "0.9rem", fontWeight: 800, color: utilizationRate <= 100 ? "#34d399" : "#fb7185" }}>
                {utilizationRate}%
              </div>
            </div>
          </div>

          {/* Recharts Stacked Horizontal Bar Chart visualizer */}
          <div style={{ height: "140px", width: "100%" }}>
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={(() => {
                    const itemV = stats.totalItemCost || 0;
                    const otherV = stats.totalOtherCost || 0;
                    const constrV = stats.totalConstrCost || 0;
                    const realInvested = stats.totalInvested || (itemV + otherV + constrV);

                    let itemCost = itemV;
                    let otherCost = otherV;
                    let constrCost = constrV;

                    if (realInvested > 0) {
                      const minPct = 0.06; // 6% visual width for 0-value items inside the bar
                      let zeroCount = 0;
                      if (itemV === 0) zeroCount++;
                      if (otherV === 0) zeroCount++;
                      if (constrV === 0) zeroCount++;

                      if (zeroCount > 0 && zeroCount < 3) {
                        const reservedForZero = realInvested * minPct * zeroCount;
                        const posSum = (itemV > 0 ? itemV : 0) + (otherV > 0 ? otherV : 0) + (constrV > 0 ? constrV : 0);
                        
                        itemCost = itemV > 0 ? (itemV / posSum) * (realInvested - reservedForZero) : realInvested * minPct;
                        otherCost = otherV > 0 ? (otherV / posSum) * (realInvested - reservedForZero) : realInvested * minPct;
                        constrCost = constrV > 0 ? (constrV / posSum) * (realInvested - reservedForZero) : realInvested * minPct;
                      }
                    }

                    return [
                      {
                        name: "Ngân sách cấp",
                        allocated: stats.totalAllocated,
                        itemCost: 0,
                        otherCost: 0,
                        constrCost: 0,
                        realAllocated: stats.totalAllocated,
                      },
                      {
                        name: "Đã đầu tư",
                        allocated: 0,
                        itemCost,
                        otherCost,
                        constrCost,
                        realItemCost: itemV,
                        realOtherCost: otherV,
                        realConstrCost: constrV,
                      }
                    ];
                  })()}
                  margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                  barCategoryGap="15%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" horizontal={false} />
                  <XAxis 
                    type="number" 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickFormatter={(v) => v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : `${v}`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    fontWeight={700}
                    width={95}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;

                      const data = payload[0]?.payload;
                      const isAllocated = label === "Ngân sách cấp";

                      if (isAllocated) {
                        return (
                          <div style={{
                            background: "#0f172a",
                            border: "1px solid #334155",
                            borderRadius: "10px",
                            padding: "0.65rem 0.9rem",
                            color: "#ffffff",
                            fontSize: "0.825rem",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                          }}>
                            <div style={{ fontWeight: 800, color: "#34d399", marginBottom: "0.25rem" }}>
                              Ngân sách cấp
                            </div>
                            <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#ffffff" }}>
                              {data.realAllocated?.toLocaleString()} VNĐ
                            </div>
                            {stats.totalNewStudents !== undefined && stats.totalNewStudents > 0 && (
                              <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: "0.35rem", paddingTop: "0.35rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                                • Tổng số học sinh mới: <strong style={{ color: "#38bdf8" }}>{stats.totalNewStudents.toLocaleString()} học sinh</strong>
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div style={{
                          background: "#0f172a",
                          border: "1px solid #334155",
                          borderRadius: "10px",
                          padding: "0.65rem 0.9rem",
                          color: "#ffffff",
                          fontSize: "0.825rem",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                        }}>
                          <div style={{ fontWeight: 800, color: "#fbbf24", marginBottom: "0.35rem" }}>
                            Đã đầu tư: {stats.totalInvested?.toLocaleString()} VNĐ
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.78rem" }}>
                            <div style={{ color: "#38bdf8" }}>
                              • Thiết bị: <strong>{(data.realItemCost || 0).toLocaleString()} VNĐ</strong>
                            </div>
                            <div style={{ color: "#a855f7" }}>
                              • Đầu tư khác: <strong>{(data.realOtherCost || 0).toLocaleString()} VNĐ</strong>
                            </div>
                            <div style={{ color: "#f59e0b" }}>
                              • Thi công: <strong>{(data.realConstrCost || 0).toLocaleString()} VNĐ</strong>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar 
                    dataKey="allocated" 
                    name="Ngân sách cấp" 
                    fill="#10b981" 
                    radius={[0, 6, 6, 0]} 
                    barSize={28} 
                    isAnimationActive={true}
                    animationDuration={1400}
                    animationEasing="ease-out"
                    animationBegin={100}
                  />
                  <Bar 
                    dataKey="itemCost" 
                    stackId="invested" 
                    name="• Thiết bị" 
                    fill="#38bdf8" 
                    barSize={28} 
                    isAnimationActive={true}
                    animationDuration={1400}
                    animationEasing="ease-out"
                    animationBegin={250}
                  />
                  <Bar 
                    dataKey="otherCost" 
                    stackId="invested" 
                    name="• Đầu tư khác" 
                    fill="#a855f7" 
                    barSize={28} 
                    isAnimationActive={true}
                    animationDuration={1400}
                    animationEasing="ease-out"
                    animationBegin={350}
                  />
                  <Bar 
                    dataKey="constrCost" 
                    stackId="invested" 
                    name="• Thi công" 
                    fill="#f59e0b" 
                    radius={[0, 6, 6, 0]} 
                    barSize={28} 
                    isAnimationActive={true}
                    animationDuration={1400}
                    animationEasing="ease-out"
                    animationBegin={450}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
