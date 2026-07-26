import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import SearchInput from "../SearchInput";

import UserRowActions from "./UserRowActions";
import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }

  const search = resolvedParams?.search || "";

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ]
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="page-title-bar">
        <h1>Quản lý Người dùng</h1>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "1rem", flexWrap: "wrap" }}>
        <SearchInput placeholder="Tìm tên đăng nhập, họ tên..." />
        <Link href="/admin/users/new" className="btn btn-primary" style={{ marginLeft: "0.5rem" }}>+ Thêm Người dùng</Link>
      </div>

      <div className="card table-container" style={{ padding: 0 }}>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Tên đăng nhập</th>
              <th>Họ và tên</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#cbd5e1" }}>
                  Chưa có người dùng nào.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 700, color: "#38bdf8" }}>{user.username}</td>
                  <td style={{ color: "#ffffff" }}>{user.name}</td>
                  <td>
                    <span className={`badge ${user.role === "SUPER_ADMIN" ? "badge-error" : user.role === "ADMIN" ? "badge-purple" : "badge-info"}`}>
                      {user.role === "SUPER_ADMIN" ? "🔥 SUPER ADMIN" : user.role === "ADMIN" ? "👑 ADMIN" : "💼 SALE"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.status === "ACTIVE" ? "badge-success" : "badge-error"}`}>
                      {user.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <UserRowActions user={user} />
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
