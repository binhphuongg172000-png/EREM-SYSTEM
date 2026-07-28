"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { deleteProposalAdmin } from "@/app/actions/proposal-admin";
import { toast } from "@/components/Toast";

export default function DeleteProposalDetailButton({ proposalId, schoolName }: { proposalId: string; schoolName: string }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteProposalAdmin(proposalId);
      if (res.success) {
        toast.success("Đã xóa dự trù thành công");
        router.push("/admin/proposals");
      } else {
        toast.error(res.message || "Không thể xóa dự trù");
        setIsDeleting(false);
      }
    } catch {
      toast.error("Lỗi khi kết nối hệ thống");
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setShowConfirm(!showConfirm)}
        disabled={isDeleting}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.45rem 0.85rem",
          borderRadius: "8px",
          background: "rgba(244, 63, 94, 0.12)",
          border: "1px solid rgba(244, 63, 94, 0.4)",
          color: "#f43f5e",
          fontSize: "0.8rem",
          fontWeight: 700,
          cursor: "pointer",
          transition: "all 0.2s"
        }}
      >
        <Trash2 size={15} /> Xóa dự trù
      </button>

      {showConfirm && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          background: "#0f172a",
          border: "1.5px solid rgba(244, 63, 94, 0.5)",
          borderRadius: "14px",
          padding: "1.1rem",
          zIndex: 200,
          width: "280px",
          boxShadow: "0 20px 45px rgba(0, 0, 0, 0.9)",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          textAlign: "left"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#f43f5e", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <AlertTriangle size={16} /> Xóa vĩnh viễn
            </span>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: "0.15rem" }}
            >
              <X size={15} />
            </button>
          </div>

          <p style={{ fontSize: "0.8rem", color: "#cbd5e1", margin: 0, lineHeight: 1.5 }}>
            Xác nhận xóa bản dự trù trường <strong style={{ color: "#ffffff" }}>"{schoolName}"</strong>? Thao tác không thể phục hồi.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.25rem" }}>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              style={{
                padding: "0.45rem 0.65rem", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 600,
                background: "rgba(255, 255, 255, 0.06)", border: "1px solid #334155", color: "#cbd5e1",
                cursor: "pointer"
              }}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              style={{
                padding: "0.45rem 0.65rem", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 800,
                background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)", border: "none", color: "#ffffff",
                cursor: isDeleting ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(244, 63, 94, 0.35)"
              }}
            >
              {isDeleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
