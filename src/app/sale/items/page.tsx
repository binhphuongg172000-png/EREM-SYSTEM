import React from "react";
import prisma from "@/lib/prisma";
import { getCachedData } from "@/lib/cache";
import SearchInput from "@/app/admin/SearchInput";
import { Laptop } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SaleItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";

  const cacheKey = `sale_items_${search}`;
  const items = await getCachedData(cacheKey, async () => {
    const res = await prisma.item.findMany({
      where: search ? { name: { contains: search, mode: "insensitive" } } : {},
      orderBy: { name: "asc" }
    });
    return res.sort((a, b) => a.name.localeCompare(b.name, "vi", { sensitivity: "base" }));
  }, 15);

  return (
    <div>
      <div className="page-title-bar" style={{ marginBottom: "1.25rem" }}>
        <h1 className="flex items-center gap-2 text-xl font-black text-white">
          <Laptop className="text-purple-400" size={24} />
          Danh mục Thiết bị Tham khảo
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Bảng giá chuẩn định mức và quy cách kỹ thuật thiết bị trường học
        </p>
      </div>

      <div style={{ marginBottom: "1.25rem" }}>
        <SearchInput placeholder="Tìm theo tên hoặc mã thiết bị..." />
      </div>

      <div className="card table-container" style={{ padding: 0 }}>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên Thiết bị</th>
              <th>Quy cách kỹ thuật</th>
              <th>Linh phụ kiện</th>
              <th>ĐVT</th>
              <th style={{ textAlign: "right" }}>Đơn giá chuẩn (VNĐ)</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                  Chưa có thiết bị nào trong danh mục.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={item.id}>
                  <td style={{ color: "#64748b", fontWeight: 700 }}>{idx + 1}</td>
                  <td style={{ fontWeight: 700, color: "#ffffff" }}>{item.name}</td>
                  <td style={{ fontSize: "0.825rem", color: "#94a3b8", maxWidth: "300px" }}>{item.specifications}</td>
                  <td style={{ fontSize: "0.825rem", color: "#64748b" }}>{item.accessories || "—"}</td>
                  <td><span className="badge badge-secondary">{item.unit}</span></td>
                  <td style={{ textAlign: "right", fontWeight: 800, color: "#34d399" }}>
                    {Number(item.standardPrice).toLocaleString("vi-VN")} đ
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
