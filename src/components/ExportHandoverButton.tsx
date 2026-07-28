"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FileDown, FileText } from "lucide-react";
import { createHandover } from "@/app/actions/handover";
import { toast } from "@/components/Toast";

export default function ExportHandoverButton({
  proposalId,
  schoolId,
  senderId,
  isDetailView = false,
  btnStyle,
  className
}: {
  proposalId: string;
  schoolId: string;
  senderId: string;
  isDetailView?: boolean;
  btnStyle?: React.CSSProperties;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const result = await createHandover({
      proposalId,
      schoolId,
      senderId,
      receiverId: senderId, // default receiver to self to satisfy schema
    });

    if (result.success && result.handoverId) {
      toast.success("Đã xuất Biên bản bàn giao! Đang chuyển hướng...");
      const targetPath = pathname.startsWith("/admin") 
        ? `/admin/handovers/${result.handoverId}`
        : `/sale/handovers/${result.handoverId}`;
      router.push(targetPath);
    } else {
      setIsLoading(false);
      toast.error(result.message || "Có lỗi xảy ra khi xuất BBBG");
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isLoading}
      className={className}
      style={{
        ...btnStyle,
        opacity: isLoading ? 0.7 : 1,
        cursor: isLoading ? "not-allowed" : "pointer"
      }}
    >
      {isDetailView ? <FileText size={16} /> : <FileDown size={13} />}
      {isLoading ? "Đang xử lý..." : "Xuất BBBG"}
    </button>
  );
}
