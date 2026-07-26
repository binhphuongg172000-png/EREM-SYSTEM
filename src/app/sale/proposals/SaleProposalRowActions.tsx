"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteProposalSale } from "@/app/actions/proposal-sale";
import { toast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import { Eye, Pencil } from "lucide-react";

export default function SaleProposalRowActions({ proposal }: { proposal: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isLocked = proposal.status === "APPROVED" || proposal.school?.isLocked;

  const handleDelete = async () => {
    if (isLocked) {
      toast.error("Hồ sơ này đã bị đóng băng hoặc duyệt, không thể xóa!");
      setConfirmDelete(false);
      return;
    }
    setIsLoading(true);
    const res = await deleteProposalSale(proposal.id);
    if (!res.success) {
      toast.error(res.message);
    } else {
      toast.success(`Đã xóa bản dự trù trường "${proposal.school?.name}"!`);
      router.refresh();
    }
    setIsLoading(false);
    setConfirmDelete(false);
  };

  return (
    <>
      <div style={{ display: "flex", gap: "0.35rem", justifyContent: "flex-end", alignItems: "center" }}>
        <Link
          href={`/sale/proposals/${proposal.id}`}
          style={{ 
            display: "inline-flex", alignItems: "center", gap: "0.3rem",
            fontSize: "0.78rem", padding: "0.3rem 0.65rem", borderRadius: "6px",
            background: "rgba(56, 189, 248, 0.08)", color: "#38bdf8",
            border: "1px solid rgba(56, 189, 248, 0.15)",
            textDecoration: "none", fontWeight: 600, transition: "all 0.2s",
          }}
        >
          <Eye size={13} />
          Xem
        </Link>
        {!isLocked && (
          <Link
            href={`/sale/proposals/new?schoolId=${proposal.schoolId}`}
            style={{ 
              display: "inline-flex", alignItems: "center", gap: "0.3rem",
              fontSize: "0.78rem", padding: "0.3rem 0.65rem", borderRadius: "6px",
              background: "rgba(251, 191, 36, 0.08)", color: "#fbbf24",
              border: "1px solid rgba(251, 191, 36, 0.15)",
              textDecoration: "none", fontWeight: 600, transition: "all 0.2s",
            }}
          >
            <Pencil size={13} />
            Sửa
          </Link>
        )}
      </div>
    </>
  );
}
