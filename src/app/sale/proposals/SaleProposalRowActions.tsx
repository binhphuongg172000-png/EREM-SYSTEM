"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteProposalSale } from "@/app/actions/proposal-sale";
import { toast } from "@/components/Toast";

import { Eye, Pencil } from "lucide-react";

const btnBase: React.CSSProperties = {
  fontSize: "0.78rem",
  padding: "0.35rem 0.65rem",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.3rem",
  borderRadius: "6px",
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
  lineHeight: 1.4,
  textDecoration: "none",
  border: "1px solid",
  transition: "all 0.15s ease",
  width: "100%",
  boxSizing: "border-box"
};

export default function SaleProposalRowActions({ proposal }: { proposal: any }) {
  const router = useRouter();

  const isLocked = proposal.status === "APPROVED" || proposal.status === "COMPLETED" || proposal.school?.isLocked;

  return (
    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", alignItems: "center" }}>
      {/* SLOT 1: Nút Xem (Cố định 100%) */}
      <div style={{ width: "66px", flexShrink: 0 }}>
        <Link
          href={`/sale/proposals/${proposal.id}`}
          prefetch={true}
          onMouseEnter={() => router.prefetch(`/sale/proposals/${proposal.id}`)}
          style={{
            ...btnBase,
            background: "rgba(56, 189, 248, 0.08)",
            borderColor: "rgba(56, 189, 248, 0.4)",
            color: "#38bdf8",
          }}
        >
          <Eye size={13} />
          Xem
        </Link>
      </div>

      {/* SLOT 2: Nút Sửa (Cố định 100%) */}
      <div style={{ width: "64px", flexShrink: 0 }}>
        {!isLocked ? (
          <Link
            href={`/sale/proposals/new?schoolId=${proposal.schoolId}`}
            prefetch={true}
            onMouseEnter={() => router.prefetch(`/sale/proposals/new?schoolId=${proposal.schoolId}`)}
            style={{
              ...btnBase,
              background: "rgba(251, 191, 36, 0.08)",
              borderColor: "rgba(251, 191, 36, 0.4)",
              color: "#fbbf24",
            }}
          >
            <Pencil size={13} />
            Sửa
          </Link>
        ) : (
          <div style={{ width: "64px", height: "28px" }} />
        )}
      </div>
    </div>
  );
}
