import React from "react";
import prisma from "@/lib/prisma";
import { getCachedData } from "@/lib/cache";
import SearchInput from "@/app/admin/SearchInput";
import { Coins } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SaleInvestmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";

  const cacheKey = `sale_investments_${search}`;
  const investments = await getCachedData(cacheKey, async () => {
    const res = await prisma.otherInvestment.findMany({
      where: {
        category: "INVESTMENT",
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
          <Coins className="text-pink-400" size={24} />
          Danh mục Đầu tư khác Tham khảo
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Bảng báo giá các hạng mục đầu tư khác (điều hòa, dịch vụ, trang trí phòng học...)
        </p>
      </div>

      <div style={{ marginBottom: "1.25rem" }}>
        <SearchInput placeholder="Tìm theo tên hạng mục..." />
      </div>

      <div className="card table-container" style={{ padding: 0 }}>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên Hạng mục</th>
              <th>Mô tả chi tiết</th>
              <th>ĐVT</th>
              <th style={{ textAlign: "right" }}>Đơn giá chuẩn (VNĐ)</th>
            </tr>
          </thead>
          <tbody>
            {investments.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                  Chưa có hạng mục nào.
                </td>
              </tr>
            ) : (
              investments.map((inv, idx) => (
                <tr key={inv.id}>
                  <td style={{ color: "#64748b", fontWeight: 700 }}>{idx + 1}</td>
                  <td style={{ fontWeight: 700, color: "#ffffff" }}>{inv.name}</td>
                  <td style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{inv.description}</td>
                  <td><span className="badge badge-secondary">{inv.unit}</span></td>
                  <td style={{ textAlign: "right", fontWeight: 800, color: "#fbbf24" }}>
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
