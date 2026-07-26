"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteItem } from "@/app/actions/item";
import { toast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";

export default function DeleteItemButton({ id, itemName = "Thiết bị" }: { id: string; itemName?: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteItem(id);
    if (!res.success) {
      toast.error(res.message);
    } else {
      toast.success(`Đã xóa thiết bị "${itemName}" thành công!`);
      router.refresh();
    }
    setIsDeleting(false);
    setConfirmOpen(false);
  };

  return (
    <>
      <button
        className="btn btn-danger"
        style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
        onClick={() => setConfirmOpen(true)}
        disabled={isDeleting}
      >
        Xóa
      </button>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa Thiết bị"
        message={`Bạn có chắc chắn muốn xóa "${itemName}" vĩnh viễn khỏi danh mục không?`}
        confirmText="Xóa vĩnh viễn"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
