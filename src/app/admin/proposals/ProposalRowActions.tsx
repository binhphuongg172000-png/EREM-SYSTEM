"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Trash2, X, AlertTriangle } from "lucide-react";
import ExportHandoverButton from "@/components/ExportHandoverButton";
import { deleteProposalAdmin } from "@/app/actions/proposal-admin";
import { toast } from "@/components/Toast";

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

export default function ProposalRowActions({ 
  proposal, 
  isSuperAdmin = false 
}: { 
  proposal: any; 
  isSuperAdmin?: boolean;
}) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isCompleted = proposal.status === "COMPLETED";

  // Close confirm popover on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowConfirm(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteProposalAdmin(proposal.id);
      if (res.success) {
        toast.success("Đã xóa dự trù thành công");
        setShowConfirm(false);
        router.refresh();
      } else {
        toast.error(res.message || "Không thể xóa dự trù");
      }
    } catch {
      toast.error("Lỗi khi kết nối hệ thống");
    } finally {
      setIsDeleting(false);
    }
  };

return (
    <div ref={popoverRef} style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", alignItems: "center", position: "relative" }}>
      {/* SLOT 1: Nút Xem (Cố định vị trí) */}
      <div style={{ flexShrink: 0 }}>
        <Link
          href={`/admin/proposals/${proposal.id}`}
          prefetch={true}
          onMouseEnter={() => router.prefetch(`/admin/proposals/${proposal.id}`)}
          style={{
            ...btnBase,
            width: "auto",
            background: "rgba(56, 189, 248, 0.08)",
            borderColor: "rgba(56, 189, 248, 0.4)",
            color: "#38bdf8",
          }}
        >
          <Eye size={13} /> Xem
        </Link>
      </div>



      {/* SLOT 3: Nút Xóa (Cố định vị trí) */}
      {isSuperAdmin && (
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            disabled={isDeleting}
            title="Xóa dự trù này"
            style={{
              ...btnBase,
              width: "auto",
              background: "rgba(244, 63, 94, 0.08)",
              borderColor: "rgba(244, 63, 94, 0.4)",
              color: "#f43f5e",
            }}
          >
            <Trash2 size={13} /> Xóa
          </button>

          {/* Popover Xóa Quay lên Trên */}
          {showConfirm && (
            <div style={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              right: 0,
              background: "#0f172a",
              border: "1.5px solid rgba(244, 63, 94, 0.5)",
              borderRadius: "14px",
              padding: "1rem 1.1rem",
              zIndex: 200,
              width: "270px",
              boxShadow: "0 20px 45px rgba(0, 0, 0, 0.9)",
              animation: "fadeInUp 0.15s ease-out",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              textAlign: "left"
            }}>
              <style>{`
                @keyframes fadeInUp {
                  from { opacity: 0; transform: translateY(6px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>

              <div style={{
                position: "absolute",
                bottom: "-7px",
                right: "18px",
                transform: "rotate(45deg)",
                width: "12px",
                height: "12px",
                background: "#0f172a",
                borderRight: "1.5px solid rgba(244, 63, 94, 0.5)",
                borderBottom: "1.5px solid rgba(244, 63, 94, 0.5)"
              }} />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 800, color: "#f43f5e", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <AlertTriangle size={15} /> Xóa vĩnh viễn dự trù
                </span>
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                  style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: "0.1rem" }}
                >
                  <X size={14} />
                </button>
              </div>

              <p style={{ fontSize: "0.8rem", color: "#cbd5e1", margin: 0, lineHeight: 1.5 }}>
                Xác nhận xóa dự trù trường <strong style={{ color: "#ffffff" }}>"{proposal.school?.name}"</strong>? Thao tác này không thể hoàn tác.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.2rem" }}>
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                  style={{
                    padding: "0.45rem 0.6rem", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600,
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
                    padding: "0.45rem 0.6rem", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 800,
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
      )}
    </div>
  );
}
