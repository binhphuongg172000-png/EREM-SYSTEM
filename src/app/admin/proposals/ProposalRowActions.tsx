"use client";

import React from "react";
import Link from "next/link";
import { Eye, FileDown } from "lucide-react";
import ExportHandoverButton from "@/components/ExportHandoverButton";

const btnBase: React.CSSProperties = {
  fontSize: "0.78rem",
  padding: "0.35rem 0.75rem",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.3rem",
  borderRadius: "6px",
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
  lineHeight: 1.4,
  textDecoration: "none",
  border: "1px solid",
  transition: "all 0.15s ease",
};

export default function ProposalRowActions({ proposal }: { proposal: any }) {
  const isCompleted = proposal.status === "COMPLETED";

  return (
    <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end", alignItems: "center" }}>
      {/* Xem - luôn hiện */}
      <Link
        href={`/admin/proposals/${proposal.id}`}
        style={{
          ...btnBase,
          background: "rgba(56, 189, 248, 0.08)",
          borderColor: "rgba(56, 189, 248, 0.4)",
          color: "#38bdf8",
        }}
      >
        <Eye size={13} /> Xem
      </Link>

      {/* Xuất BBBG - ẩn đi nếu chưa hoàn thành để giữ nguyên layout cho nút Xem */}
      {isCompleted ? (
        <ExportHandoverButton
          proposalId={proposal.id}
          schoolId={proposal.schoolId}
          senderId={proposal.saleId}
          btnStyle={{
            ...btnBase,
            background: "rgba(168, 85, 247, 0.1)",
            borderColor: "rgba(168, 85, 247, 0.5)",
            color: "#c084fc",
          }}
        />
      ) : (
        <div style={{ width: "93px", visibility: "hidden" }} /> // Placeholder for alignment
      )}
    </div>
  );
}
