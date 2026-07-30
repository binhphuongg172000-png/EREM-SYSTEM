"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toggleUserStatus, deleteUser } from "@/app/actions/user";
import { toast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";

export default function UserRowActions({ user }: { user: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const actionText = user.status === "ACTIVE" ? "khóa" : "mở khóa";

  const handleToggle = async () => {
    setIsLoading(true);
    const res = await toggleUserStatus(user.id);
    if (!res.success) {
      toast.error(res.message);
    } else {
      toast.success(`Đã ${actionText} tài khoản "${user.username}" thành công!`);
      router.refresh();
    }
    setIsLoading(false);
    setConfirmToggle(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    const res = await deleteUser(user.id);
    if (!res.success) {
      toast.error(res.message);
    } else {
      toast.success(`Đã xóa tài khoản "${user.username}" thành công!`);
      router.refresh();
    }
    setIsLoading(false);
    setConfirmDelete(false);
  };

  // Protect SUPER_ADMIN (sadmin) account from deletion or locking
  if (user.username === "sadmin" || user.role === "SUPER_ADMIN") {
    return (
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", alignItems: "center" }}>
        <span style={{
          fontSize: "0.75rem",
          color: "#f43f5e",
          fontWeight: 800,
          background: "rgba(244, 63, 94, 0.12)",
          border: "1px solid rgba(244, 63, 94, 0.3)",
          padding: "0.2rem 0.6rem",
          borderRadius: "6px"
        }}>
          Hệ thống Quản trị
        </span>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", alignItems: "center" }}>
        <Link
          href={`/admin/users/${user.id}/edit`}
          className="btn btn-secondary"
          style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
        >
          Sửa
        </Link>
        <button
          type="button"
          onClick={() => setConfirmToggle(true)}
          disabled={isLoading}
          className="btn btn-warning"
          style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
        >
          {user.status === "ACTIVE" ? "Khóa" : "Mở khóa"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          disabled={isLoading}
          className="btn btn-danger"
          style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
        >
          Xóa
        </button>
      </div>

      <ConfirmModal
        isOpen={confirmToggle}
        title={`Xác nhận ${actionText} tài khoản`}
        message={`Bạn có chắc chắn muốn ${actionText} tài khoản "${user.username}" (${user.name})?`}
        onConfirm={handleToggle}
        onClose={() => setConfirmToggle(false)}
        confirmText={user.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
        variant={user.status === "ACTIVE" ? "warning" : "info"}
      />

      <ConfirmModal
        isOpen={confirmDelete}
        title="Xác nhận xóa tài khoản"
        message={`Bạn có chắc chắn muốn XÓA tài khoản "${user.username}" (${user.name})? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
        confirmText="Xóa tài khoản"
        variant="danger"
      />
    </>
  );
}
