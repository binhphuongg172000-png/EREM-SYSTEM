import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import SearchInput from "../SearchInput";
import SaleFilterSelect from "./SaleFilterSelect";
import SchoolRowActions from "./SchoolRowActions";

import { getCachedData } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function SchoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; saleId?: string }>;
}) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";
  const saleId = resolvedParams?.saleId || undefined;

  const cacheKey = `admin_schools_${search}_${saleId || "all"}`;
  const { sales, schools } = await getCachedData(cacheKey, async () => {
    const [sales, schools] = await Promise.all([
      prisma.user.findMany({
        where: { role: "SALE" },
        select: { id: true, name: true },
        orderBy: { name: "asc" }
      }),
      prisma.school.findMany({
        where: {
          AND: [
            ...(search ? [{ name: { contains: search, mode: "insensitive" as const } }] : []),
            ...(saleId ? [{ saleId }] : [])
          ]
        },
        include: { sale: true },
        orderBy: { createdAt: "desc" },
      })
    ]);
    return { sales, schools };
  }, 15);

  return (
    <div>
      <div className="page-title-bar">
        <h1>Danh mục Trường học</h1>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "1rem", flex: "1 1 auto", flexWrap: "wrap" }}>
          <SearchInput placeholder="Tìm theo tên trường học..." />
          <SaleFilterSelect sales={sales} />
        </div>
        <Link href="/admin/schools/new" className="btn btn-primary whitespace-nowrap">+ Thêm Trường học</Link>
      </div>

      <div className="card table-container" style={{ padding: 0 }}>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Tên Trường</th>
              <th>Địa chỉ</th>
              <th>Nhân viên Sale</th>
              <th style={{ textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {schools.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#cbd5e1" }}>
                  Chưa có trường học nào.
                </td>
              </tr>
            ) : (
              schools.map((school) => (
                <tr key={school.id}>
                  <td style={{ fontWeight: 700, color: "#ffffff" }}>{school.name}</td>
                  <td>{school.address}</td>
                  <td>{school.sale?.name || "Chưa gán"}</td>
                  <td style={{ textAlign: "right" }}>
                    <SchoolRowActions school={school} />
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
