"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteSchool } from "@/app/actions/school";
import { toast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";

export default function SchoolRowActions({ school }: { school: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    const res = await deleteSchool(school.id);
    if (!res.success) {
      toast.error(res.message);
    } else {
      toast.success(`Đã xóa trường "${school.name}" thành công!`);
      router.refresh();
    }
    setIsLoading(false);
    setConfirmDelete(false);
  };

  return (
    <>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", alignItems: "center" }}>
        <Link
          href={`/admin/schools/${school.id}/edit`}
          className="btn btn-secondary"
          style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
        >
          Sửa
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
        title="Xác nhận xóa trường học"
        message={`Bạn có chắc chắn muốn xóa trường "${school.name}" vĩnh viễn không?`}
        confirmText="Xóa vĩnh viễn"
        variant="danger"
        isLoading={isLoading}
      />
    </>
  );
}
