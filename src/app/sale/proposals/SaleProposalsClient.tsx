"use client";

import React, { useState, useMemo } from "react";
import { vietnameseIncludes } from "@/lib/vietnamese";
import SaleProposalRowActions from "./SaleProposalRowActions";
import { 
  Search, SlidersHorizontal, Building2, Calendar, 
  TrendingUp, TrendingDown, Filter, X, FileText, Clock, Lock, CheckCircle2, Coins 
} from "lucide-react";

export default function SaleProposalsClient({ 
  proposals, 
  counts 
}: { 
  proposals: any[];
  counts?: { totalProposals: number; initCount: number; lockedCount: number; completedCount: number };
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [budgetFilter, setBudgetFilter] = useState<"ALL" | "POSITIVE" | "NEGATIVE">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "INIT" | "LOCKED" | "COMPLETED">("ALL");

  // Calculate counts if not passed from server
  const computedCounts = useMemo(() => {
    if (counts) return counts;
    const totalProposals = proposals.length;
    const completedCount = proposals.filter(p => p.status === "COMPLETED").length;
    const lockedCount = proposals.filter(p => !["COMPLETED"].includes(p.status) && (p.school?.isLocked || p.status === "APPROVED")).length;
    const initCount = totalProposals - completedCount - lockedCount;
    return { totalProposals, initCount, lockedCount, completedCount };
  }, [proposals, counts]);

  const filtered = useMemo(() => proposals.filter((p) => {
    // 1. Search Query (Tìm kiếm theo Tên trường không phân biệt dấu)
    const matchesSearch = !searchQuery.trim() || vietnameseIncludes(p.school?.name, searchQuery);

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

  // Dynamic status icon for dropdown filter
  const renderStatusFilterIcon = () => {
    if (statusFilter === "INIT") return <Clock size={14} color="#fb923c" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />;
    if (statusFilter === "LOCKED") return <Lock size={14} color="#fb7185" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />;
    if (statusFilter === "COMPLETED") return <CheckCircle2 size={14} color="#34d399" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />;
    return <Filter size={14} color="#64748b" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />;
  };

  return (
    <>
      <style>{`
        .stat-pill-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.55rem 1.1rem; border-radius: 12px;
          font-size: 0.825rem; font-weight: 700; cursor: pointer;
          border: 1.5px solid transparent; transition: all 0.2s ease;
          user-select: none; background: rgba(15, 23, 42, 0.75);
        }
        .stat-pill-btn:hover {
          transform: translateY(-2px);
        }
        
        /* Stat Pill Variants */
        .pill-all { border-color: rgba(30, 41, 59, 0.8); color: #94a3b8; }
        .pill-all.active { border-color: #06b6d4; background: rgba(6, 182, 212, 0.15); color: #ffffff; box-shadow: 0 0 15px rgba(6, 182, 212, 0.3); }
        
        .pill-init { border-color: rgba(251, 146, 60, 0.3); color: #fb923c; background: rgba(251, 146, 60, 0.08); }
        .pill-init.active { border-color: #fb923c; background: rgba(251, 146, 60, 0.25); color: #ffffff; box-shadow: 0 0 15px rgba(251, 146, 60, 0.35); }
        
        .pill-locked { border-color: rgba(244, 63, 94, 0.3); color: #fb7185; background: rgba(244, 63, 94, 0.08); }
        .pill-locked.active { border-color: #f43f5e; background: rgba(244, 63, 94, 0.25); color: #ffffff; box-shadow: 0 0 15px rgba(244, 63, 94, 0.35); }
        
        .pill-completed { border-color: rgba(16, 185, 129, 0.3); color: #34d399; background: rgba(16, 185, 129, 0.08); }
        .pill-completed.active { border-color: #10b981; background: rgba(16, 185, 129, 0.25); color: #ffffff; box-shadow: 0 0 15px rgba(16, 185, 129, 0.35); }

        .filter-bar {
          display: flex; gap: 0.75rem; margin-bottom: 1.25rem;
          flex-wrap: wrap; align-items: center;
        }
        .search-wrap {
          position: relative; flex: 1 1 300px; max-width: 420px;
        }
        .search-wrap input {
          width: 100%; padding: 0.65rem 0.75rem 0.65rem 2.6rem;
          border-radius: 12px; border: 1px solid var(--sale-card-border);
          background: rgba(15, 23, 42, 0.75); color: #f8fafc;
          font-size: 0.85rem; transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .search-wrap input:focus {
          outline: none; border-color: #06b6d4;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
        }
        .search-wrap input::placeholder { color: #64748b; }
        
        .filter-select {
          padding: 0.65rem 2rem 0.65rem 2.25rem;
          border-radius: 12px; border: 1px solid var(--sale-card-border);
          background: #0f172a; color: #f8fafc;
          font-size: 0.85rem; cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .filter-select:focus {
          outline: none; border-color: #06b6d4;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
        }
        .filter-select option {
          background: #0f172a; color: #f8fafc;
          padding: 0.5rem;
        }
        
        .school-name {
          font-weight: 700; color: #ffffff; display: flex;
          align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;
          fontSize: 0.9rem;
        }
        .school-address {
          font-size: 0.78rem; color: #64748b; padding-left: 1.4rem;
        }
        
        .delta-chip {
          display: inline-flex; align-items: center; gap: 0.3rem;
          padding: 0.25rem 0.65rem; border-radius: 8px;
          font-size: 0.8rem; font-weight: 800;
        }
        .delta-positive { background: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25); }
        .delta-negative { background: rgba(244, 63, 94, 0.12); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.25); }
        
        .status-pill {
          display: inline-flex; align-items: center; gap: 0.35rem;
          padding: 0.3rem 0.75rem; border-radius: 999px;
          font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;
        }
        .status-init { background: rgba(251, 146, 60, 0.12); color: #fb923c; border: 1px solid rgba(251, 146, 60, 0.3); }
        .status-locked { background: rgba(244, 63, 94, 0.12); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3); }
        .status-completed { background: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
      `}</style>

      {/* Interactive Clickable Stat Filter Pills */}
      <div style={{ display: "flex", gap: "0.85rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button 
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={`stat-pill-btn pill-all ${statusFilter === "ALL" ? "active" : ""}`}
        >
          <FileText size={15} color={statusFilter === "ALL" ? "#38bdf8" : "#06b6d4"} />
          <span>Tất cả:</span>
          <strong style={{ fontSize: "0.9rem" }}>{computedCounts.totalProposals}</strong>
        </button>

        <button 
          type="button"
          onClick={() => setStatusFilter("INIT")}
          className={`stat-pill-btn pill-init ${statusFilter === "INIT" ? "active" : ""}`}
        >
          <Clock size={15} color="#fb923c" />
          <span>Khởi tạo:</span>
          <strong style={{ fontSize: "0.9rem" }}>{computedCounts.initCount}</strong>
        </button>

        <button 
          type="button"
          onClick={() => setStatusFilter("LOCKED")}
          className={`stat-pill-btn pill-locked ${statusFilter === "LOCKED" ? "active" : ""}`}
        >
          <Lock size={15} color="#fb7185" />
          <span>Đang thực hiện:</span>
          <strong style={{ fontSize: "0.9rem" }}>{computedCounts.lockedCount}</strong>
        </button>

        <button 
          type="button"
          onClick={() => setStatusFilter("COMPLETED")}
          className={`stat-pill-btn pill-completed ${statusFilter === "COMPLETED" ? "active" : ""}`}
        >
          <CheckCircle2 size={15} color="#34d399" />
          <span>Hoàn thành:</span>
          <strong style={{ fontSize: "0.9rem" }}>{computedCounts.completedCount}</strong>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="filter-bar">
        {/* Search Input */}
        <div className="search-wrap">
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên trường..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Budget Filter */}
        <div style={{ position: "relative" }}>
          <Coins size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#10b981", pointerEvents: "none" }} />
          <select 
            className="filter-select"
            value={budgetFilter}
            onChange={e => setBudgetFilter(e.target.value as any)}
          >
            <option value="ALL">Tất cả ngân sách</option>
            <option value="POSITIVE">Ngân sách dư (+VNĐ)</option>
            <option value="NEGATIVE">Vượt ngân sách (-VNĐ)</option>
          </select>
        </div>

        {/* Status Filter Dropdown (Synchronized with Icons) */}
        <div style={{ position: "relative" }}>
          {renderStatusFilterIcon()}
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

        {/* Reset Filter Button */}
        {(searchQuery || budgetFilter !== "ALL" || statusFilter !== "ALL") && (
          <button 
            type="button"
            onClick={() => { setSearchQuery(""); setBudgetFilter("ALL"); setStatusFilter("ALL"); }}
            style={{ 
              padding: "0.45rem 0.85rem", borderRadius: "10px", border: "1px solid rgba(244, 63, 94, 0.3)",
              background: "rgba(244, 63, 94, 0.08)", color: "#f43f5e", fontSize: "0.8rem", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "0.35rem", fontWeight: 700,
              transition: "all 0.2s"
            }}
          >
            <X size={14} /> Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Results Count Bar */}
      <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.85rem", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Hiển thị <strong style={{ color: "#ffffff" }}>{filtered.length}</strong> / {proposals.length} hồ sơ dự trù</span>
      </div>

      {/* Table Container */}
      <div className="sale-table-card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Building2 size={26} color="#06b6d4" />
            </div>
            <p style={{ color: "#ffffff", fontSize: "1rem", fontWeight: 700, margin: "0 0 0.35rem" }}>
              {(searchQuery || budgetFilter !== "ALL" || statusFilter !== "ALL") 
                ? "Không tìm thấy hồ sơ dự trù phù hợp" 
                : "Chưa có dự trù nào được khởi tạo"}
            </p>
            <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>
              {(searchQuery || budgetFilter !== "ALL" || statusFilter !== "ALL")
                ? "Thử thay đổi từ khóa tìm kiếm hoặc chọn nút trạng thái khác."
                : "Bấm nút \"+ Bắt đầu lập dự trù mới\" ở Dashboard để bắt đầu."}
            </p>
          </div>
        ) : (
          <table className="sale-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: "1.5rem" }}>Trường học</th>
                <th>Ngày lập</th>
                <th>Ngân sách cấp</th>
                <th>Tổng đầu tư</th>
                <th>Chênh lệch</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: "right", paddingRight: "1.5rem" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                let statusStyleClass = "status-init";
                let statusLabel = "Khởi tạo";
                let StatusIcon = Clock;
                
                if (p.status === "COMPLETED") { 
                  statusStyleClass = "status-completed"; 
                  statusLabel = "Hoàn thành"; 
                  StatusIcon = CheckCircle2;
                } else if (p.school?.isLocked || p.status === "APPROVED") { 
                  statusStyleClass = "status-locked"; 
                  statusLabel = "Đang thực hiện"; 
                  StatusIcon = Lock;
                }
                
                const delta = p.allocatedBudget - p.investedBudget;

                return (
                  <tr key={p.id}>
                    <td style={{ paddingLeft: "1.5rem" }}>
                      <div className="school-name">
                        <Building2 size={15} color="#06b6d4" />
                        {p.school?.name}
                      </div>
                      <div className="school-address">{p.school?.address}</div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#94a3b8", fontSize: "0.825rem" }}>
                        <Calendar size={13} color="#64748b" />
                        {new Date(p.createdAt).toLocaleString("vi-VN", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#f8fafc" }}>
                        {p.allocatedBudget.toLocaleString()} đ
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#cbd5e1" }}>
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
                      <span className={`status-pill ${statusStyleClass}`}>
                        <StatusIcon size={12} />
                        {statusLabel}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", paddingRight: "1.5rem" }}>
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
