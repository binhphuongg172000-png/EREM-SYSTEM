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

  if (user.username === "admin") {
    return (
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", alignItems: "center" }}>
        <span style={{ fontSize: "0.75rem", color: "#38bdf8", fontWeight: 700 }}>Hệ thống Quản trị</span>
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
          className="btn btn-secondary"
          style={{
            fontSize: "0.8rem",
            padding: "0.35rem 0.75rem",
            borderColor: user.status === "ACTIVE" ? "#f59e0b" : "#10b981",
            color: user.status === "ACTIVE" ? "#f59e0b" : "#34d399",
            backgroundColor: user.status === "ACTIVE" ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)",
          }}
          onClick={() => setConfirmToggle(true)}
          disabled={isLoading}
        >
          {user.status === "ACTIVE" ? "Khóa" : "Mở"}
        </button>
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
        isOpen={confirmToggle}
        onClose={() => setConfirmToggle(false)}
        onConfirm={handleToggle}
        title={`Xác nhận ${actionText} người dùng`}
        message={`Bạn có chắc chắn muốn ${actionText} tài khoản "${user.username}" không?`}
        confirmText={user.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"}
        variant="warning"
        isLoading={isLoading}
      />

      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa người dùng"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${user.username}" vĩnh viễn không?`}
        confirmText="Xóa vĩnh viễn"
        variant="danger"
        isLoading={isLoading}
      />
    </>
  );
}
