"use client";

import React from "react";
import { Printer, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

export default function PrintButton({ fileName = "DuTruKinhPhi.xlsx" }: { fileName?: string }) {
  const updatePrintDate = () => {
    const dateEls = document.querySelectorAll('.print-date-text');
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const formattedDate = `TP.HCM, ngày ${day} tháng ${month} năm ${year}`;
    dateEls.forEach(el => {
      el.textContent = formattedDate;
    });
  };

  const handlePrint = () => {
    updatePrintDate();
    window.print();
  };

  const exportToExcel = () => {
    updatePrintDate();
    const printElement = document.querySelector('.print-only');
    if (!printElement) return;

    const tables = printElement.querySelectorAll('table');
    const dateEl = printElement.querySelector('.print-date-text');
    const dateStr = dateEl?.textContent?.trim() || "";

    const combinedRows: any[][] = [
      ["Công ty cổ phần Giáo dục iSmart"],
      ["Lầu 3, Tòa nhà Quỳnh Lan, 60 Hai Bà Trưng, Phường Sài Gòn, TP Hồ Chí Minh, VN"],
      [],
      ["BẢNG DỰ TRÙ KINH PHÍ"],
      []
    ];

    if (tables.length >= 1) {
      const ws0 = XLSX.utils.table_to_sheet(tables[0]);
      const data0 = XLSX.utils.sheet_to_json<any[]>(ws0, { header: 1 });
      combinedRows.push(...data0);
      combinedRows.push([]);
    }

    if (tables.length >= 2) {
      const ws1 = XLSX.utils.table_to_sheet(tables[1]);
      const data1 = XLSX.utils.sheet_to_json<any[]>(ws1, { header: 1 });
      combinedRows.push(...data1);
      combinedRows.push([]);
    }

    if (dateStr) {
      combinedRows.push(["", "", "", "", "", dateStr]);
      combinedRows.push([]);
    }

    if (tables.length >= 3) {
      const ws2 = XLSX.utils.table_to_sheet(tables[2]);
      const data2 = XLSX.utils.sheet_to_json<any[]>(ws2, { header: 1 });
      combinedRows.push(...data2);
    }

    const ws = XLSX.utils.aoa_to_sheet(combinedRows);
    ws['!cols'] = [
      { wch: 8 },  // STT
      { wch: 45 }, // Diễn giải các hạng mục / Trường
      { wch: 15 }, // Đơn vị tính
      { wch: 18 }, // Đơn giá
      { wch: 12 }, // Số lượng
      { wch: 22 }, // Thành tiền
      { wch: 18 }  // Ghi chú
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dự trù kinh phí");

    const excelName = fileName.replace(/\.(doc|docx|xls|xlsx)$/i, "") + ".xlsx";
    XLSX.writeFile(wb, excelName);
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <button onClick={exportToExcel} type="button" style={{ background: "#10b981", color: "white", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>
        <FileSpreadsheet size={16} /> Xuất Excel (.xlsx)
      </button>
      <button className="print-btn" onClick={handlePrint} type="button">
        <Printer size={16} /> In phiếu
      </button>
    </div>
  );
}
