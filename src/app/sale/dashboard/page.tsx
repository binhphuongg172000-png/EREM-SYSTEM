import React from "react";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SaleDashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  // Fetch stats for this Sale
  const schools = await prisma.school.findMany({
    where: { saleId: userId },
    include: {
      proposals: {
        orderBy: { updatedAt: "desc" },
        take: 1,
      }
    }
  });

  const proposals = schools
    .map(s => s.proposals[0] ? { ...s.proposals[0], school: s } : null)
    .filter(Boolean) as NonNullable<any>[];

  const totalSchools = schools.length;
  const totalProposals = proposals.length;
  
  let totalAllocated = 0;
  let totalInvested = 0;

  proposals.forEach(p => {
    totalAllocated += Number(p.allocatedBudget);
    totalInvested += Number(p.investedBudget);
  });

  const delta = totalAllocated - totalInvested;

  // Warning lists
  const negativeSchools = proposals.filter(p => Number(p.allocatedBudget) < Number(p.investedBudget));
  const positiveSchools = proposals.filter(p => Number(p.allocatedBudget) >= Number(p.investedBudget));

  return (
    <div>
      <h1 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "1.5rem" }}>
        Dashboard Cá nhân
      </h1>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#94a3b8", marginBottom: "1rem" }}>THÔNG TIN CHUNG</h2>
        <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          <div className="card stat-card">
            <span className="stat-title">Số Trường Quản lý</span>
            <span className="stat-value">{totalSchools}</span>
          </div>
          <div className="card stat-card">
            <span className="stat-title">Số Dự trù đã lập</span>
            <span className="stat-value" style={{ color: "var(--primary)" }}>{totalProposals}</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#94a3b8", marginBottom: "1rem" }}>TỔNG QUAN NGÂN SÁCH</h2>
        <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
          <div className="card stat-card">
            <span className="stat-title">Ngân sách Cấp (VNĐ)</span>
            <span className="stat-value" style={{ color: "var(--success)", fontSize: "1.5rem" }}>
              {totalAllocated.toLocaleString()}
            </span>
          </div>
          <div className="card stat-card">
            <span className="stat-title">Ngân sách Đầu tư (VNĐ)</span>
            <span className="stat-value" style={{ color: "var(--warning)", fontSize: "1.5rem" }}>
              {totalInvested.toLocaleString()}
            </span>
          </div>
          <div className="card stat-card">
            <span className="stat-title">Chênh lệch (VNĐ)</span>
            <span className="stat-value" style={{ color: delta >= 0 ? "var(--success)" : "var(--error)", fontSize: "1.5rem" }}>
              {delta >= 0 ? "+" : ""}{delta.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginTop: "2rem" }}>
        {/* Negative Warning */}
        <div className="card" style={{ borderTop: "4px solid var(--error)" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--error)", marginBottom: "1rem" }}>
            Cảnh báo: Ngân sách âm
          </h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {negativeSchools.length === 0 ? (
              <li style={{ color: "#64748b" }}>Không có trường nào vượt định mức.</li>
            ) : (
              negativeSchools.map(p => (
                <li key={p.id} style={{ padding: "0.75rem 0", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 500 }}>{p.school.name}</span>
                  <span style={{ color: "var(--error)", fontWeight: 600 }}>
                    {(Number(p.allocatedBudget) - Number(p.investedBudget)).toLocaleString()} VNĐ
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Positive Warning */}
        <div className="card" style={{ borderTop: "4px solid var(--success)" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--success)", marginBottom: "1rem" }}>
            Ngân sách dương
          </h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {positiveSchools.length === 0 ? (
              <li style={{ color: "#64748b" }}>Không có trường nào dư ngân sách.</li>
            ) : (
              positiveSchools.map(p => (
                <li key={p.id} style={{ padding: "0.75rem 0", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 500 }}>{p.school.name}</span>
                  <span style={{ color: "var(--success)", fontWeight: 600 }}>
                    +{(Number(p.allocatedBudget) - Number(p.investedBudget)).toLocaleString()} VNĐ
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
