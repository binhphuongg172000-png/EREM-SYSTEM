import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import SearchInput from "../SearchInput";

import DeleteItemButton from "./DeleteItemButton";
import ItemHeaderActions from "./ItemHeaderActions";

import { getCachedData } from "@/lib/cache";

import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";

import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("userRole")?.value;
  if (userRole !== "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }

  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";
  
  const cacheKey = `admin_items_${search}`;
  const items = await getCachedData(cacheKey, async () => {
    const res = await prisma.item.findMany({
      where: search ? { name: { contains: search, mode: "insensitive" } } : {},
      orderBy: { name: "asc" },
    });
    return res.sort((a, b) => a.name.localeCompare(b.name, "vi", { sensitivity: "base" }));
  }, 15);

  return (
    <div>
      <div className="page-title-bar">
        <h1>Danh mục Thiết bị</h1>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "1rem", flexWrap: "wrap" }}>
        <SearchInput placeholder="Tìm theo tên thiết bị..." />
        <Link href="/admin/items/new" className="btn btn-primary">+ Thêm Thiết bị</Link>
      </div>

      <div className="card table-container" style={{ padding: 0 }}>
        <div className="table-container" style={{ marginTop: 0 }}>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Tên Thiết bị</th>
                <th>Cấu hình chi tiết</th>
                <th>Linh kiện kèm theo</th>
                <th>ĐVT</th>
                <th>Đơn giá chuẩn (VNĐ)</th>
                <th style={{ textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#cbd5e1" }}>Chưa có thiết bị nào.</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700, color: "#ffffff" }}>{item.name}</td>
                    <td style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{item.specifications}</td>
                    <td style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{item.accessories || "-"}</td>
                    <td>{item.unit || "Bộ"}</td>
                    <td style={{ fontWeight: 700, color: "#ffffff" }}>{Number(item.standardPrice).toLocaleString()} đ</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", alignItems: "center" }}>
                        <Link href={`/admin/items/${item.id}/edit`} className="btn btn-secondary" style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}>
                          Sửa
                        </Link>
                        <DeleteItemButton id={item.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
