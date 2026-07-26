"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteHandoverAdmin } from "@/app/actions/handover";
import { toast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";

export default function HandoverRowActions({ handover }: { handover: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    const res = await deleteHandoverAdmin(handover.id);
    if (!res.success) {
      toast.error(res.message);
    } else {
      toast.success(`Đã xóa biên bản bàn giao trường "${handover.school?.name}"!`);
      router.refresh();
    }
    setIsLoading(false);
    setConfirmDelete(false);
  };

  return (
    <>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", alignItems: "center" }}>
        <Link
          href={`/admin/handovers/${handover.id}`}
          className="btn btn-secondary"
          style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
        >
          Xem chi tiết
        </Link>
        <button
          className="btn btn-danger"
          style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
          onClick={() => setConfirmDelete(true)}
          disabled={isLoading}
        >
          Xóa
        </button>
      </div>

      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa Biên Bản"
        message={`Bạn có chắc chắn muốn xóa biên bản bàn giao trường "${handover.school?.name}" vĩnh viễn không?`}
        confirmText="Xóa vĩnh viễn"
        variant="danger"
        isLoading={isLoading}
      />
    </>
  );
}
