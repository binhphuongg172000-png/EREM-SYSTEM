"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileSpreadsheet, Plus } from "lucide-react";
import ExcelImportModal from "@/components/ExcelImportModal";

export default function ItemHeaderActions() {
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
        <Link href="/admin/items/new" className="btn btn-primary" style={{ fontSize: "0.85rem" }}>
          <Plus size={16} /> Thêm Thiết bị
        </Link>
      </div>

      <ExcelImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        type="items"
        title="Import Danh sách Thiết bị từ Excel"
      />
    </>
  );
}
