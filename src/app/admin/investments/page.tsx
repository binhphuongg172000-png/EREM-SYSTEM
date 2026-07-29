import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import SearchInput from "../SearchInput";

import DeleteInvestmentButton from "./DeleteInvestmentButton";
import InvestmentHeaderActions from "./InvestmentHeaderActions";

import { getCachedData } from "@/lib/cache";

import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";

import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function InvestmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("userRole")?.value;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";

  const cacheKey = `admin_investments_${search}`;
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
      <div className="page-title-bar">
        <h1>Danh mục Đầu tư khác</h1>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "1rem", flexWrap: "wrap" }}>
        <SearchInput placeholder="Tìm theo tên hạng mục..." />
        <Link href="/admin/investments/new" className="btn btn-primary">+ Thêm Hạng mục</Link>
      </div>

      <div className="card table-container" style={{ padding: 0 }}>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Tên Hạng mục</th>
              <th>Mô tả chi tiết</th>
              <th>ĐVT</th>
              <th>Đơn giá chuẩn (VNĐ)</th>
              <th style={{ textAlign: "right" }}>Thao tác</th>
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
              investments.map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600 }}>{inv.name}</td>
                  <td style={{ fontSize: "0.85rem", color: "#64748b" }}>{inv.description}</td>
                  <td>{inv.unit}</td>
                  <td style={{ fontWeight: 600 }}>{Number(inv.standardPrice).toLocaleString()} đ</td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", alignItems: "center" }}>
                      <Link href={`/admin/investments/${inv.id}/edit`} className="btn btn-secondary" style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}>
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

