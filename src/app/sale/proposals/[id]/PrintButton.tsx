"use client";

import React from "react";
import { Printer, Download } from "lucide-react";

export default function PrintButton({ fileName = "DuTruKinhPhi.doc" }: { fileName?: string }) {
  const exportToWord = () => {
    const printElement = document.querySelector('.print-only');
    if (!printElement) return;

    // Build HTML for MS Word
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <title>Export</title>
      <style>
        @page WordSection1 {
          size: 841.9pt 595.3pt; /* A4 Landscape */
          mso-page-orientation: landscape;
          margin: 0.5in 0.5in 0.5in 0.5in;
        }
        div.WordSection1 { page: WordSection1; }
        .print-bg-orange th, .print-bg-orange td { background-color: #fce4d6 !important; }
        .print-bg-lightorange td { background-color: #fef0e5 !important; }
        table { border-collapse: collapse; }
        table td, table th { padding: 6px 4px !important; line-height: 1.3 !important; }
      </style>
    </head>
    <body>
      <div class="WordSection1">`;
      
    const footer = `</div></body></html>`;
    const sourceHTML = header + printElement.innerHTML + footer;
    
    // Encode non-ASCII characters to prevent MS Word from losing diacritics
    const encodedHTML = sourceHTML.replace(/[\u0080-\uFFFF]/g, i => '&#' + i.charCodeAt(0) + ';');
    
    // Create Blob
    const blob = new Blob(['\ufeff', encodedHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    
    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <button onClick={exportToWord} type="button" style={{ background: "#3b82f6", color: "white", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>
        <Download size={16} /> Xuất Word
      </button>
      <button className="print-btn" onClick={() => window.print()} type="button">
        <Printer size={16} /> In phiếu
      </button>
    </div>
  );
}
