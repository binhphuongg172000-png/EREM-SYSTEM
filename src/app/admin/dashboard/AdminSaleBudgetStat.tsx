"use client";

import React, { useState } from "react";
import { Users } from "lucide-react";

type SaleStat = {
  id: string;
  name: string;
  totalAllocated: number;
  totalInvested: number;
  budgetVariance: number;
};

export default function AdminSaleBudgetStat({ sales }: { sales: SaleStat[] }) {
  const [selectedSaleId, setSelectedSaleId] = useState<string>(sales[0]?.id || "");

  const selectedSale = sales.find(s => s.id === selectedSaleId);

  return (
    <div className="stat-card" style={{ "--card-accent": "#a855f7", padding: "0.85rem 1.1rem" } as React.CSSProperties}>
      <div className="stat-title" style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-start" }}>
        <span>NGÂN SÁCH THEO SALE</span>
        <Users size={18} style={{ color: "#a855f7" }} />
      </div>
      
      <div style={{ marginTop: "0.25rem", marginBottom: "0.25rem" }}>
        <select 
          value={selectedSaleId}
          onChange={(e) => setSelectedSaleId(e.target.value)}
          style={{ 
            width: "100%", 
            background: "#0f172a", 
            border: "1px solid #1e293b", 
            color: "#e2e8f0", 
            padding: "0.25rem 0.5rem", 
            borderRadius: "4px",
            fontSize: "0.8rem",
            fontWeight: 600,
            outline: "none"
          }}
        >
          {sales.length === 0 && <option value="">Không có dữ liệu</option>}
          {sales.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="stat-value" style={{ color: "#c084fc", fontSize: "1.2rem", whiteSpace: "nowrap" }}>
        {selectedSale ? `${selectedSale.totalInvested.toLocaleString()} đ` : "0 đ"}
      </div>
      <div style={{ fontSize: "0.75rem", color: "#cbd5e1", fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
        <span>Cấp: {selectedSale ? (selectedSale.totalAllocated/1000000).toFixed(1) : 0}M</span>
        <span style={{ color: selectedSale && selectedSale.budgetVariance >= 0 ? "#10b981" : "#f43f5e" }}>
          {selectedSale && selectedSale.budgetVariance >= 0 ? "+" : ""}{selectedSale ? (selectedSale.budgetVariance/1000000).toFixed(1) : 0}M
        </span>
      </div>
    </div>
  );
}
