import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import SearchInput from "../SearchInput";

import DeleteInvestmentButton from "../investments/DeleteInvestmentButton";
import { getCachedData } from "@/lib/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ConstructionsPage({
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

  const cacheKey = `admin_constructions_${search}`;
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
      <div className="page-title-bar">
        <h1 className="flex items-center gap-2">
          <Wrench className="text-sky-400" size={24} />
          Danh mục Thi công
        </h1>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "1rem", flexWrap: "wrap" }}>
        <SearchInput placeholder="Tìm theo tên gói thi công..." />
        <Link href="/admin/constructions/new" className="btn btn-primary">+ Thêm Hạng mục Thi công</Link>
      </div>

      <div className="card table-container" style={{ padding: 0 }}>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Tên Hạng mục Thi công</th>
              <th>Mô tả chi tiết</th>
              <th>ĐVT</th>
              <th>Đơn giá chuẩn (VNĐ)</th>
              <th style={{ textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {constructions.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                  Chưa có hạng mục thi công nào.
                </td>
              </tr>
            ) : (
              constructions.map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600 }}>{inv.name}</td>
                  <td style={{ fontSize: "0.85rem", color: "#64748b" }}>{inv.description}</td>
                  <td>{inv.unit}</td>
                  <td style={{ fontWeight: 600 }}>{Number(inv.standardPrice).toLocaleString()} đ</td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", alignItems: "center" }}>
                      <Link href={`/admin/constructions/${inv.id}/edit`} className="btn btn-secondary" style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}>
                        Sửa
                      </Link>
                      <DeleteInvestmentButton id={inv.id} />
                    </div>
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
