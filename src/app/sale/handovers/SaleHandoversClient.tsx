"use client";

import React, { useState, useMemo } from "react";
import SaleHandoverRowActions from "./SaleHandoverRowActions";
import { Search } from "lucide-react";

export default function SaleHandoversClient({ handovers }: { handovers: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => handovers.filter((h) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const schoolName = h.school?.name?.toLowerCase() || "";
    const address = h.school?.address?.toLowerCase() || "";
    const receiverName = h.receiver?.name?.toLowerCase() || "";
    return schoolName.includes(query) || address.includes(query) || receiverName.includes(query);
  }), [handovers, searchQuery]);

  return (
    <>
      <div style={{ position: "relative", marginBottom: "1.5rem", maxWidth: "400px" }}>
        <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
        <input 
          type="text" 
          className="form-input" 
          placeholder="Tìm kiếm theo trường học, địa chỉ, người nhận..." 
          style={{ paddingLeft: "38px" }}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="card table-container" style={{ padding: 0 }}>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Trường học</th>
              <th>Người Nhận</th>
              <th>Ngày lập</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#cbd5e1" }}>
                  {searchQuery ? "Không tìm thấy biên bản nào phù hợp." : "Bạn chưa xuất Biên bản bàn giao nào."}
                </td>
              </tr>
            ) : (
              filtered.map((h) => (
                <tr key={h.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#ffffff", display: "block" }}>{h.school?.name}</span>
                    <span style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>{h.school?.address}</span>
                  </td>
                  <td style={{ color: "#ffffff" }}>{h.receiver?.name || "Bàn giao theo HĐ"}</td>
                  <td>{new Date(h.createdAt).toLocaleString("vi-VN")}</td>
                  <td>
                    {h.status === "CONFIRMED" ? (
                      <span className="badge badge-success">Đã ký nhận</span>
                    ) : h.status === "SUPERSEDED" ? (
                      <span className="badge" style={{ backgroundColor: "#475569", color: "#e2e8f0" }}>Đã có bản mới hơn</span>
                    ) : (
                      <span className="badge badge-warning">Khởi tạo</span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <SaleHandoverRowActions handover={h} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
