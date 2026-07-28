import React from "react";
import prisma from "@/lib/prisma";
import { getCachedData } from "@/lib/cache";
import SearchInput from "@/app/admin/SearchInput";
import { Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SaleConstructionsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";

  const cacheKey = `sale_constructions_${search}`;
  const constructions = await getCachedData(cacheKey, async () => {
    const res = await prisma.otherInvestment.findMany({
      where: {
        category: "CONSTRUCTION",
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {})
      },
      orderBy: { name: "asc" }
    });
    return res.sort((a, b) => a.name.localeCompare(b.name, "vi", { sensitivity: "base" }));
  }, 15);

  return (
    <div>
      <div className="page-title-bar" style={{ marginBottom: "1.25rem" }}>
        <h1 className="flex items-center gap-2 text-xl font-black text-white">
          <Wrench className="text-sky-400" size={24} />
          Danh mục Thi công Tham khảo
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Bảng báo giá định mức các gói thi công, tháo gỡ, di dời &amp; lắp đặt hệ thống cho trường học
        </p>
      </div>

      <div style={{ marginBottom: "1.25rem" }}>
        <SearchInput placeholder="Tìm theo tên gói thi công..." />
      </div>

      <div className="card table-container" style={{ padding: 0 }}>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên Hạng mục Thi công</th>
              <th>Mô tả chi tiết</th>
              <th>ĐVT</th>
              <th style={{ textAlign: "right" }}>Đơn giá định mức (VNĐ)</th>
            </tr>
          </thead>
          <tbody>
            {constructions.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                  Chưa có gói thi công nào.
                </td>
              </tr>
            ) : (
              constructions.map((inv, idx) => (
                <tr key={inv.id}>
                  <td style={{ color: "#64748b", fontWeight: 700 }}>{idx + 1}</td>
                  <td style={{ fontWeight: 700, color: "#ffffff" }}>{inv.name}</td>
                  <td style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{inv.description}</td>
                  <td><span className="badge badge-secondary">{inv.unit}</span></td>
                  <td style={{ textAlign: "right", fontWeight: 800, color: "#38bdf8" }}>
                    {Number(inv.standardPrice).toLocaleString("vi-VN")} đ
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
