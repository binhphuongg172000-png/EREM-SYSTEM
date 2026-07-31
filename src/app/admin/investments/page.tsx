import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import SearchInput from "../SearchInput";
import DeleteInvestmentButton from "./DeleteInvestmentButton";
import PaginationControls from "@/components/PaginationControls";

export const dynamic = "force-dynamic";

export default async function InvestmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";
  const page = Math.max(1, Number(resolvedParams?.page || 1));
  const pageSize = 20;

  let investments: any[] = [];
  try {
    const res = await prisma.otherInvestment.findMany({
      where: {
        category: "INVESTMENT",
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {})
      },
      orderBy: { name: "asc" }
    });
    investments = res.sort((a, b) => (a.name || "").localeCompare(b.name || "", "vi", { sensitivity: "base" }));
  } catch (err) {
    console.error("InvestmentsPage findMany error:", err);
  }

  const totalPages = Math.ceil(investments.length / pageSize);
  const displayInvestments = investments.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="page-title-bar">
        <h1>Danh mục Đầu tư khác</h1>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", flex: 1 }}>
          <SearchInput placeholder="Tìm theo tên hạng mục..." />
          <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>
            Tổng cộng: {investments.length} hạng mục
          </span>
        </div>
        <Link href="/admin/investments/new" className="btn btn-primary">+ Thêm Hạng mục</Link>
      </div>

      <div className="card table-container" style={{ padding: 0 }}>
        <table className="table table-hover">
          <thead>
            <tr>
              <th style={{ width: "50px", textAlign: "center" }}>STT</th>
              <th>Tên Hạng mục</th>
              <th>Mô tả chi tiết</th>
              <th>ĐVT</th>
              <th>Đơn giá chuẩn (VNĐ)</th>
              <th style={{ textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {displayInvestments.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#cbd5e1" }}>Chưa có hạng mục đầu tư nào.</td></tr>
            ) : (
              displayInvestments.map((item, idx) => (
                <tr key={item.id}>
                  <td style={{ textAlign: "center", fontWeight: 700, color: "#94a3b8" }}>
                    {(page - 1) * pageSize + idx + 1}
                  </td>
                  <td style={{ fontWeight: 700, color: "#ffffff" }}>{item.name}</td>
                  <td style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{item.description}</td>
                  <td>{item.unit || "Gói"}</td>
                  <td style={{ fontWeight: 700, color: "#ffffff" }}>{Number(item.standardPrice).toLocaleString()} đ</td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", alignItems: "center" }}>
                      <Link href={`/admin/investments/${item.id}/edit`} className="btn btn-secondary" style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}>
                        Sửa
                      </Link>
                      <DeleteInvestmentButton id={item.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          totalItems={investments.length}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
}
