"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileSpreadsheet, Plus } from "lucide-react";
import ExcelImportModal from "@/components/ExcelImportModal";

export default function InvestmentHeaderActions() {
  const [isImportOpen, setIsImportOpen] = useState(false);

  return (
    <>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <button
          onClick={() => setIsImportOpen(true)}
          className="btn btn-secondary"
          style={{ fontSize: "0.85rem", borderColor: "#38bdf8", color: "#38bdf8", fontWeight: 700 }}
        >
          <FileSpreadsheet size={16} /> Import Excel
        </button>
        <Link href="/admin/investments/new" className="btn btn-primary" style={{ fontSize: "0.85rem" }}>
          <Plus size={16} /> Thêm Hạng mục
        </Link>
      </div>

      <ExcelImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        type="investments"
        title="Import Danh sách Hạng mục Đầu tư khác từ Excel"
      />
    </>
  );
}
