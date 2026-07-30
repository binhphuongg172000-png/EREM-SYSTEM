import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import SearchInput from "../SearchInput";
import UserRowActions from "./UserRowActions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";

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

  return (
    <div>
      <div className="page-title-bar">
        <h1>Quản lý Người dùng System</h1>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "1rem", flexWrap: "wrap" }}>
        <SearchInput placeholder="Tìm tên đăng nhập, họ tên..." />
        <Link href="/admin/users/new" className="btn btn-primary">+ Tạo Tài khoản Mới</Link>
      </div>

      <div className="card table-container" style={{ padding: 0 }}>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Họ và Tên</th>
              <th>Tên đăng nhập</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#cbd5e1" }}>Chưa có tài khoản nào.</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id}>
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
      </div>
    </div>
  );
}
