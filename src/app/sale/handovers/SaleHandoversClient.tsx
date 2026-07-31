"use client";

import React, { useState, useMemo } from "react";
import SaleHandoverRowActions from "./SaleHandoverRowActions";
import { Search, ClipboardCheck, Building2, Calendar, UserCheck } from "lucide-react";
import PaginationControls from "@/components/PaginationControls";
import { vietnameseIncludes } from "@/lib/vietnamese";

export default function SaleHandoversClient({ handovers }: { handovers: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const filtered = useMemo(() => handovers.filter((h) => {
    if (!searchQuery.trim()) return true;
    return vietnameseIncludes(h.school?.name, searchQuery) || 
           vietnameseIncludes(h.school?.address, searchQuery) || 
           vietnameseIncludes(h.receiver?.name, searchQuery);
  }), [handovers, searchQuery]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const displayHandovers = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <style>{`
        .handover-search-wrap {
          position: relative; margin-bottom: 1.25rem; max-width: 420px;
        }
        .handover-search-wrap input {
          width: 100%; padding: 0.65rem 0.75rem 0.65rem 2.6rem;
          border-radius: 12px; border: 1px solid var(--sale-card-border);
          background: rgba(15, 23, 42, 0.75); color: #f8fafc;
          font-size: 0.85rem; transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .handover-search-wrap input:focus {
          outline: none; border-color: #06b6d4;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
        }
        .handover-search-wrap input::placeholder { color: #64748b; }
        
        .handover-status-badge {
          display: inline-flex; align-items: center; gap: 0.35rem;
          padding: 0.3rem 0.75rem; border-radius: 999px;
          font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;
        }
        .status-confirmed { background: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
        .status-superseded { background: rgba(100, 116, 139, 0.15); color: #94a3b8; border: 1px solid rgba(100, 116, 139, 0.3); }
        .status-pending { background: rgba(251, 146, 60, 0.12); color: #fb923c; border: 1px solid rgba(251, 146, 60, 0.3); }
      `}</style>

      {/* Search Input */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", gap: "1rem", flexWrap: "wrap" }}>
        <div className="handover-search-wrap" style={{ margin: 0, flex: 1 }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên trường, địa chỉ, người nhận..." 
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>
          Tổng cộng: {filtered.length} biên bản
        </span>
      </div>

      {/* Table Card Container */}
      <div className="sale-table-card" style={{ padding: 0 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "3.5rem 2rem", textAlign: "center" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "18px", background: "rgba(6, 182, 212, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
              <ClipboardCheck size={26} color="#06b6d4" />
            </div>
            <p style={{ color: "#ffffff", fontSize: "1rem", fontWeight: 700, margin: "0 0 0.35rem" }}>
              {searchQuery ? "Không tìm thấy biên bản nào phù hợp" : "Chưa xuất Biên bản bàn giao nào"}
            </p>
            <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>
              {searchQuery ? "Thử tìm kiếm với từ khóa khác." : "Khi dự trù được duyệt, bạn có thể xuất biên bản bàn giao."}
            </p>
          </div>
        ) : (
          <>
            <table className="sale-table" style={{ margin: 0, width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ width: "50px", textAlign: "center", paddingLeft: "0.75rem" }}>STT</th>
                  <th>Trường học</th>
                  <th>Người Nhận</th>
                  <th>Ngày Lập</th>
                  <th>Trạng Thái</th>
                  <th style={{ textAlign: "right", paddingRight: "1.5rem" }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {displayHandovers.map((h, idx) => (
                  <tr key={h.id}>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "#94a3b8", paddingLeft: "0.75rem" }}>
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", marginBottom: "0.2rem" }}>
                        <Building2 size={15} color="#06b6d4" />
                        {h.school?.name}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#64748b", paddingLeft: "1.4rem" }}>{h.school?.address}</div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#e2e8f0", fontSize: "0.875rem", fontWeight: 600 }}>
                        <UserCheck size={14} color="#818cf8" />
                        {h.receiver?.name || "Bàn giao theo HĐ"}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#94a3b8", fontSize: "0.825rem" }}>
                        <Calendar size={13} color="#64748b" />
                        {new Date(h.createdAt).toLocaleString("vi-VN", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                    </td>
                    <td>
                      {h.status === "CONFIRMED" ? (
                        <span className="handover-status-badge status-confirmed">Đã ký nhận</span>
                      ) : h.status === "SUPERSEDED" ? (
                        <span className="handover-status-badge status-superseded">Đã có bản mới</span>
                      ) : (
                        <span className="handover-status-badge status-pending">Khởi tạo</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right", paddingRight: "1.5rem" }}>
                      <SaleHandoverRowActions handover={h} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </>
  );
}
