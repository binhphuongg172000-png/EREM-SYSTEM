"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Sparkles, Users, Layers, Filter } from "lucide-react";

interface ProposalFiltersProps {
  sales: Array<{ id: string; name: string; username: string }>;
  currentSaleId: string;
  currentLatest: string;
  currentBudget: string;
  currentLock: string;
}

export default function ProposalFilters({ sales, currentSaleId, currentLatest, currentBudget, currentLock }: ProposalFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const isLatestOnly = currentLatest === "true";

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const toggleLatest = () => {
    updateParams("latest", isLatestOnly ? "false" : "");
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
      {/* Toggle latest proposal per school */}
      <button
        type="button"
        onClick={toggleLatest}
        className={`btn ${isLatestOnly ? "btn-primary" : "btn-secondary"}`}
        style={{
          fontSize: "0.78rem",
          padding: "0.4rem 0.75rem",
          borderColor: isLatestOnly ? "#38bdf8" : "#475569",
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
          opacity: isPending ? 0.7 : 1,
        }}
        title="Lọc chỉ hiển thị bản dự trù tạo gần đây nhất của từng trường học"
      >
        {isLatestOnly ? <Sparkles size={14} style={{ color: "#030712" }} /> : <Layers size={14} style={{ color: "#38bdf8" }} />}
        <span>{isLatestOnly ? "Chỉ bản mới nhất" : "Tất cả phiên bản"}</span>
      </button>

      {/* Budget filter */}
      <select
        value={currentBudget}
        onChange={(e) => updateParams("budget", e.target.value)}
        className="form-input filter-select-admin"
        style={{
          fontSize: "0.78rem",
          padding: "0.4rem 0.6rem",
          width: "auto",
          minWidth: "140px",
          opacity: isPending ? 0.7 : 1,
        }}
      >
        <option value="">Tất cả ngân sách</option>
        <option value="positive">Ngân sách dư (+)</option>
        <option value="negative">Vượt ngân sách (-)</option>
      </select>

      {/* Status filter */}
      <select
        value={currentLock}
        onChange={(e) => updateParams("status", e.target.value)}
        className="form-input filter-select-admin"
        style={{
          fontSize: "0.78rem",
          padding: "0.4rem 0.6rem",
          width: "auto",
          minWidth: "150px",
          opacity: isPending ? 0.7 : 1,
        }}
      >
        <option value="">Tất cả trạng thái</option>
        <option value="init">🟠 Khởi tạo</option>
        <option value="locked">🔴 Đang thực hiện</option>
        <option value="completed">🟢 Hoàn thành</option>
        <option value="closed">⚪ Đã đóng (Bản cũ/Lịch sử)</option>
        <option value="overdue">⚠️ Quá 5 ngày chưa thực hiện</option>
      </select>

      {/* Sale filter select */}
      <select
        value={currentSaleId}
        onChange={(e) => updateParams("saleId", e.target.value)}
        className="form-input filter-select-admin"
        style={{
          fontSize: "0.78rem",
          padding: "0.4rem 0.6rem",
          width: "auto",
          minWidth: "160px",
          opacity: isPending ? 0.7 : 1,
        }}
      >
        <option value="">Tất cả Sale</option>
        {sales.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      
      <style>{`
        .filter-select-admin option {
          background: #0f172a;
          color: #e2e8f0;
          padding: 0.5rem;
        }
      `}</style>
    </div>
  );
}
