import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import SearchInput from "../SearchInput";
import UserRowActions from "./UserRowActions";
import PaginationControls from "@/components/PaginationControls";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";
  const page = Math.max(1, Number(resolvedParams?.page || 1));
  const pageSize = 20;

  let users: any[] = [];
  try {
    const raw = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
        ]
      },
      orderBy: { createdAt: "desc" },
    });
    users = JSON.parse(JSON.stringify(raw));
  } catch (err) {
    console.error("UsersPage findMany error:", err);
  }

  const totalPages = Math.ceil(users.length / pageSize);
  const displayUsers = users.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="page-title-bar">
        <h1>Quản lý Người dùng System</h1>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", flex: 1 }}>
          <SearchInput placeholder="Tìm tên đăng nhập, họ tên..." />
          <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>
            Tổng cộng: {users.length} tài khoản
          </span>
        </div>
        <Link href="/admin/users/new" className="btn btn-primary">+ Tạo Tài khoản Mới</Link>
      </div>

      <div className="card table-container" style={{ padding: 0 }}>
        <table className="table table-hover">
          <thead>
            <tr>
              <th style={{ width: "50px", textAlign: "center" }}>STT</th>
              <th>Họ và Tên</th>
              <th>Tên đăng nhập</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {displayUsers.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#cbd5e1" }}>Chưa có tài khoản nào.</td></tr>
            ) : (
              displayUsers.map((u, idx) => (
                <tr key={u.id}>
                  <td style={{ textAlign: "center", fontWeight: 700, color: "#94a3b8" }}>
                    {(page - 1) * pageSize + idx + 1}
                  </td>
                  <td style={{ fontWeight: 700, color: "#ffffff" }}>{u.name}</td>
                  <td style={{ color: "#38bdf8", fontWeight: 600 }}>{u.username}</td>
                  <td>{u.email || "-"}</td>
                  <td>
                    <span className={`badge ${u.role === "SUPER_ADMIN" ? "badge-danger" : u.role === "ADMIN" ? "badge-warning" : "badge-info"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.status === "ACTIVE" ? "badge-success" : "badge-danger"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <UserRowActions user={u} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          totalItems={users.length}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
}
