"use client";

import React, { useState } from "react";
import { approveProposal, rejectProposal } from "@/app/actions/proposal-admin";
import { useRouter } from "next/navigation";

export default function ProposalActionButtons({ proposalId, currentStatus }: { proposalId: string, currentStatus: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (currentStatus !== "PENDING") {
    let statusColor = "var(--warning)";
    let statusText = "Chờ duyệt";
    if (currentStatus === "APPROVED") {
      statusColor = "var(--success)";
      statusText = "Đã duyệt";
    } else if (currentStatus === "REJECTED") {
      statusColor = "var(--error)";
      statusText = "Đã từ chối";
    }

    return (
      <div style={{ padding: "1rem", backgroundColor: "rgba(16, 185, 129, 0.05)", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontWeight: 600, margin: 0, color: "#cbd5e1" }}>
          Trạng thái hiện tại: <span style={{ color: statusColor, fontWeight: 800 }}>{statusText}</span>
        </p>
      </div>
    );
  }

  const handleApprove = async () => {
    if (!confirm("Bạn có chắc chắn muốn phê duyệt dự trù này? Sale sẽ không thể chỉnh sửa nữa.")) return;
    setIsLoading(true);
    const res = await approveProposal(proposalId);
    if (res.success) {
      alert("Đã phê duyệt thành công!");
      router.refresh();
    } else {
      alert("Lỗi: " + res.message);
    }
    setIsLoading(false);
  };

  const handleReject = async () => {
    const reason = prompt("Vui lòng nhập lý do từ chối:");
    if (reason === null) return;
    setIsLoading(true);
    const res = await rejectProposal(proposalId, reason || "Không có lý do");
    if (res.success) {
      alert("Đã từ chối dự trù!");
      router.refresh();
    } else {
      alert("Lỗi: " + res.message);
    }
    setIsLoading(false);
  };

  return (
    <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
      <button 
        className="btn btn-primary" 
        onClick={handleApprove}
        disabled={isLoading}
      >
        {isLoading ? "Đang xử lý..." : "Phê duyệt (Khóa dự trù)"}
      </button>
      <button 
        className="btn text-error" 
        style={{ border: "1px solid var(--error)", backgroundColor: "white" }}
        onClick={handleReject}
        disabled={isLoading}
      >
        {isLoading ? "Đang xử lý..." : "Từ chối"}
      </button>
    </div>
  );
}
