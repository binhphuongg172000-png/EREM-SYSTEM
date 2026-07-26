import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import SearchInput from "../SearchInput";

import DeleteInvestmentButton from "./DeleteInvestmentButton";
import InvestmentHeaderActions from "./InvestmentHeaderActions";

export const dynamic = "force-dynamic";

export default async function InvestmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";

  const investments = await prisma.otherInvestment.findMany({
    where: {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <div className="page-title-bar">
        <h1>Danh mục Đầu tư khác</h1>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "1rem", flexWrap: "wrap" }}>
        <SearchInput placeholder="Tìm tên hạng mục, mô tả..." />
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

