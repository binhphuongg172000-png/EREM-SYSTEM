"use client";

import React, { useState, useMemo } from "react";
import SaleProposalRowActions from "./SaleProposalRowActions";
import { Search, SlidersHorizontal, Building2, Calendar, TrendingUp, TrendingDown } from "lucide-react";

export default function SaleProposalsClient({ proposals }: { proposals: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [budgetFilter, setBudgetFilter] = useState<"ALL" | "POSITIVE" | "NEGATIVE">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "INIT" | "LOCKED" | "COMPLETED">("ALL");

  const filtered = useMemo(() => proposals.filter((p) => {
    // 1. Search Query
    const query = searchQuery.toLowerCase();
    const schoolName = p.school?.name?.toLowerCase() || "";
    const address = p.school?.address?.toLowerCase() || "";
    const matchesSearch = !query || schoolName.includes(query) || address.includes(query);

    // 2. Budget Filter
    const delta = p.allocatedBudget - p.investedBudget;
    let matchesBudget = true;
    if (budgetFilter === "POSITIVE") matchesBudget = delta >= 0;
    if (budgetFilter === "NEGATIVE") matchesBudget = delta < 0;

    // 3. Status Filter
    let matchesStatus = true;
    const isCompleted = p.status === "COMPLETED";
    const isLocked = !isCompleted && (p.school?.isLocked || p.status === "APPROVED");
    const isInit = !isCompleted && !isLocked;

    if (statusFilter === "INIT") matchesStatus = isInit;
    if (statusFilter === "LOCKED") matchesStatus = isLocked;
    if (statusFilter === "COMPLETED") matchesStatus = isCompleted;

    return matchesSearch && matchesBudget && matchesStatus;
  }), [proposals, searchQuery, budgetFilter, statusFilter]);

  return (
    <>
      <style>{`
        .filter-bar {
          display: flex; gap: 0.75rem; margin-bottom: 1rem;
          flex-wrap: wrap; align-items: center;
        }
        .search-wrap {
          position: relative; flex: 1 1 320px; max-width: 420px;
        }
        .search-wrap input {
          width: 100%; padding: 0.6rem 0.75rem 0.6rem 2.5rem;
          border-radius: 10px; border: 1px solid #1e293b;
          background: rgba(255,255,255,0.03); color: #e2e8f0;
          font-size: 0.85rem; transition: all 0.2s;
        }
        .search-wrap input:focus {
          outline: none; border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56,189,248,0.1);
        }
        .search-wrap input::placeholder { color: #475569; }
        .filter-select {
          padding: 0.6rem 2rem 0.6rem 2.25rem;
          border-radius: 10px; border: 1px solid #1e293b;
          background: #0f172a; color: #e2e8f0;
          font-size: 0.85rem; cursor: pointer;
          transition: all 0.2s;
        }
        .filter-select:focus {
          outline: none; border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56,189,248,0.1);
        }
        .filter-select option {
          background: #0f172a; color: #e2e8f0;
          padding: 0.5rem;
        }
        .proposal-row {
          transition: background 0.15s ease;
        }
        .proposal-row:hover {
          background: rgba(56, 189, 248, 0.04) !important;
        }
        .school-name {
          font-weight: 700; color: #ffffff; display: flex;
          align-items: center; gap: 0.5rem; margin-bottom: 0.15rem;
        }
        .school-address {
          font-size: 0.78rem; color: #64748b; padding-left: 1.5rem;
        }
        .delta-chip {
          display: inline-flex; align-items: center; gap: 0.25rem;
          padding: 0.2rem 0.6rem; border-radius: 6px;
          font-size: 0.8rem; font-weight: 700;
        }
        .delta-positive { background: rgba(52,211,153,0.1); color: #34d399; }
        .delta-negative { background: rgba(244,63,94,0.1); color: #fb7185; }
        .empty-state {
          padding: 3rem 2rem; text-align: center;
        }
        .empty-state-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: rgba(56,189,248,0.08); display: flex;
          align-items: center; justify-content: center;
          margin: 0 auto 1rem;
        }
      `}</style>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
          <input 
            type="text" 
            placeholder="Tìm kiếm trường học hoặc địa chỉ..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ position: "relative" }}>
          <SlidersHorizontal size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#475569", pointerEvents: "none" }} />
          <select 
            className="filter-select"
            value={budgetFilter}
            onChange={e => setBudgetFilter(e.target.value as any)}
          >
            <option value="ALL">Tất cả ngân sách</option>
            <option value="POSITIVE">Ngân sách dư</option>
            <option value="NEGATIVE">Vượt ngân sách</option>
          </select>
        </div>

        <div style={{ position: "relative" }}>
          <SlidersHorizontal size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#475569", pointerEvents: "none" }} />
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="INIT">Khởi tạo</option>
            <option value="LOCKED">Đang thực hiện</option>
            <option value="COMPLETED">Hoàn thành</option>
          </select>
        </div>

        {(searchQuery || budgetFilter !== "ALL" || statusFilter !== "ALL") && (
          <button 
            onClick={() => { setSearchQuery(""); setBudgetFilter("ALL"); setStatusFilter("ALL"); }}
            style={{ 
              padding: "0.4rem 0.75rem", borderRadius: "8px", border: "1px solid #334155",
              background: "transparent", color: "#94a3b8", fontSize: "0.78rem", cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            ✕ Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Results count */}
      <div style={{ fontSize: "0.78rem", color: "#475569", marginBottom: "0.75rem", paddingLeft: "0.25rem" }}>
        Hiển thị {filtered.length} / {proposals.length} hồ sơ
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, borderRadius: "12px", overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Building2 size={24} color="#38bdf8" />
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: 500, margin: "0 0 0.25rem" }}>
              {(searchQuery || budgetFilter !== "ALL" || statusFilter !== "ALL") 
                ? "Không tìm thấy dự trù nào phù hợp" 
                : "Bạn chưa lập dự trù nào"}
            </p>
            <p style={{ color: "#475569", fontSize: "0.8rem", margin: 0 }}>
              {(searchQuery || budgetFilter !== "ALL" || statusFilter !== "ALL")
                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                : "Bấm nút \"Lập dự trù mới\" ở trên để bắt đầu"}
            </p>
          </div>
        ) : (
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: "1.25rem" }}>Trường học</th>
                <th>Ngày lập</th>
                <th>Ngân sách cấp</th>
                <th>Tổng đầu tư</th>
                <th>Chênh lệch</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: "right", paddingRight: "1.25rem" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                let badgeClass = "badge-warning";
                let statusLabel = "Khởi tạo";
                if (p.status === "COMPLETED") { badgeClass = "badge-success"; statusLabel = "Hoàn thành"; }
                else if (p.school?.isLocked || p.status === "APPROVED") { badgeClass = "badge-error"; statusLabel = "Đang thực hiện"; }
                
                const delta = p.allocatedBudget - p.investedBudget;

                return (
                  <tr key={p.id} className="proposal-row">
                    <td style={{ paddingLeft: "1.25rem" }}>
                      <div className="school-name">
                        <Building2 size={14} color="#64748b" />
                        {p.school?.name}
                      </div>
                      <div className="school-address">{p.school?.address}</div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#94a3b8", fontSize: "0.85rem" }}>
                        <Calendar size={13} color="#475569" />
                        {new Date(p.createdAt).toLocaleString("vi-VN", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e2e8f0" }}>
                        {p.allocatedBudget.toLocaleString()} đ
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1" }}>
                        {p.investedBudget.toLocaleString()} đ
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span className={`delta-chip ${delta >= 0 ? "delta-positive" : "delta-negative"}`}>
                        {delta >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        {delta >= 0 ? "+" : ""}{delta.toLocaleString()} đ
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${badgeClass}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", paddingRight: "1.25rem" }}>
                      <SaleProposalRowActions proposal={p} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
