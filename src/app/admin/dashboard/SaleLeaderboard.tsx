"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink, X, School as SchoolIcon, Trophy } from "lucide-react";

export type OverBudgetSchool = {
  id: string;
  name: string;
  address: string;
  allocated: number;
  invested: number;
  deficit: number;
  proposalId?: string;
};

export type SaleStat = {
  id: string;
  name: string;
  username: string;
  schoolCount: number;
  proposalCount: number;
  totalAllocated: number;
  totalInvested: number;
  budgetVariance: number;
  negativeSchools: OverBudgetSchool[];
};

export default function SaleLeaderboard({ sales }: { sales: SaleStat[] }) {
  const [selectedSale, setSelectedSale] = useState<SaleStat | null>(null);

  return (
    <>
      <div className="table-container" style={{ flex: 1, overflowY: "auto", border: "1px solid #1e293b", borderRadius: "6px" }}>
        <table className="table table-hover" style={{ fontSize: "0.8rem" }}>
          <thead>
            <tr>
              <th style={{ padding: "0.55rem 0.75rem" }}>Nhân viên Sale</th>
              <th style={{ padding: "0.55rem 0.75rem", textAlign: "center" }}>Số Trường</th>
              <th style={{ padding: "0.55rem 0.75rem", textAlign: "center" }}>Số Dự Trù</th>
              <th style={{ padding: "0.55rem 0.75rem", textAlign: "right" }}>Chênh Lệch Ngân Sách</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "1.5rem", textAlign: "center", color: "#94a3b8" }}>
                  Chưa có nhân viên Sale nào.
                </td>
              </tr>
            ) : (
              sales.map((sale, idx) => {
                const isNegative = sale.budgetVariance < 0;
                const hasNegativeSchools = sale.negativeSchools.length > 0;

                return (
                  <tr
                    key={sale.id}
                    onClick={() => hasNegativeSchools && setSelectedSale(sale)}
                    style={{
                      cursor: hasNegativeSchools ? "pointer" : "default",
                      transition: "background 0.2s ease",
                    }}
                    title={hasNegativeSchools ? "Click để xem danh sách trường bị âm ngân sách" : undefined}
                  >
                    <td style={{ padding: "0.55rem 0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ width: "18px", height: "18px", borderRadius: "50%", backgroundColor: idx === 0 ? "#f59e0b" : idx === 1 ? "#94a3b8" : "#0f172a", color: idx <= 1 ? "#000000" : "#ffffff", fontSize: "0.65rem", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {idx + 1}
                        </span>
                        <div>
                          <strong style={{ color: "#ffffff", display: "block", lineHeight: "1.2" }}>{sale.name}</strong>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "0.55rem 0.75rem", textAlign: "center", color: "#38bdf8", fontWeight: 700 }}>
                      {sale.schoolCount}
                    </td>
                    <td style={{ padding: "0.55rem 0.75rem", textAlign: "center", color: "#c084fc", fontWeight: 700 }}>
                      {sale.proposalCount}
                    </td>
                    <td style={{ padding: "0.55rem 0.75rem", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.35rem" }}>
                        <span style={{ fontWeight: 800, color: isNegative ? "#fb7185" : "#34d399" }}>
                          {sale.budgetVariance > 0 ? "+" : ""}{sale.budgetVariance.toLocaleString()} đ
                        </span>
                        {hasNegativeSchools && (
                          <span
                            className="badge badge-error"
                            style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem", cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSale(sale);
                            }}
                          >
                            ⚠️ {sale.negativeSchools.length} trường Âm
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Details for Over-Budget Schools */}
      {selectedSale && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(3, 7, 18, 0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setSelectedSale(null)}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "580px",
              backgroundColor: "#0d1424",
              border: "1.5px solid #f43f5e",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 25px rgba(244, 63, 94, 0.2)",
              padding: "1.5rem",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedSale(null)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid #1e293b" }}>
              <AlertTriangle size={22} style={{ color: "#f43f5e" }} />
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff" }}>
                  Danh sách Trường bị Âm Ngân sách — Sale {selectedSale.name}
                </h3>
                <span style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>
                  Phát hiện {selectedSale.negativeSchools.length} trường học vượt hạn mức ngân sách được cấp
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "360px", overflowY: "auto" }}>
              {selectedSale.negativeSchools.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "0.875rem 1rem",
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(244, 63, 94, 0.3)",
                    borderRadius: "0.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: "#ffffff", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <SchoolIcon size={15} style={{ color: "#38bdf8" }} /> {item.name}
                    </div>
                    <div style={{ fontSize: "0.775rem", color: "#94a3b8", marginTop: "0.15rem" }}>
                      {item.address}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#cbd5e1", marginTop: "0.35rem", display: "flex", gap: "0.75rem" }}>
                      <span>Cấp: <strong style={{ color: "#38bdf8" }}>{item.allocated.toLocaleString()} đ</strong></span>
                      <span>Thực tế: <strong style={{ color: "#34d399" }}>{item.invested.toLocaleString()} đ</strong></span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.725rem", color: "#fb7185", fontWeight: 700 }}>Vượt ngân sách</div>
                    <div style={{ fontSize: "0.95rem", color: "#f43f5e", fontWeight: 900 }}>
                      -{item.deficit.toLocaleString()} đ
                    </div>
                    {item.proposalId && (
                      <Link
                        href={`/admin/proposals/${item.proposalId}`}
                        style={{
                          fontSize: "0.75rem",
                          color: "#38bdf8",
                          textDecoration: "none",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.2rem",
                          marginTop: "0.35rem",
                        }}
                      >
                        Xem dự trù <ExternalLink size={12} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "1.25rem", textAlign: "right" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedSale(null)}
                style={{ fontSize: "0.8rem", padding: "0.4rem 1rem" }}
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
