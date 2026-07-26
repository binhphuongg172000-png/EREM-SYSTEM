"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createHandover } from "@/app/actions/handover";
import { toast } from "@/components/Toast";

export default function HandoverForm({
  proposalId,
  schoolId,
  senderId,
  receivers,
  basePath
}: {
  proposalId: string;
  schoolId: string;
  senderId: string;
  receivers: { id: string; name: string; role: string }[];
  basePath?: string;
}) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const path = basePath || "/sale";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    const result = await createHandover({
      proposalId,
      schoolId,
      senderId,
      receiverId: senderId, // Fallback since it's required in schema
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success("Đã xuất Biên bản bàn giao thành công!");
      router.push(`${path}/handovers`);
    } else {
      toast.error(result.message || "Có lỗi xảy ra");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <p style={{ color: "#cbd5e1" }}>Nhấn Xác nhận để lưu trữ phiên bản BBBG vào Kho Biên bản và tiến hành in ấn.</p>
      
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
        <button 
          type="button" 
          className="btn btn-secondary"
          onClick={() => router.push(`${path}/proposals/${proposalId}`)}
          disabled={isSubmitting}
        >
          Hủy bỏ
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang xử lý..." : "Xác nhận & Xuất BBBG"}
        </button>
      </div>
    </form>
  );
}
