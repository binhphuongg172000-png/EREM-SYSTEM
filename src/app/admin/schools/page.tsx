import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import SearchInput from "../SearchInput";
import SaleFilterSelect from "./SaleFilterSelect";
import SchoolRowActions from "./SchoolRowActions";
import PaginationControls from "@/components/PaginationControls";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SchoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; saleId?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";
  const saleId = resolvedParams?.saleId || undefined;
  const page = Math.max(1, Number(resolvedParams?.page || 1));
  const pageSize = 20;

  let sales: any[] = [];
  let schools: any[] = [];
  let totalSchools = 0;

  const whereCondition = {
    AND: [
      ...(search ? [{ name: { contains: search, mode: "insensitive" as const } }] : []),
      ...(saleId ? [{ saleId }] : [])
    ]
  };

  try {
    const [salesRes, countRes, schoolsRes] = await Promise.all([
      prisma.user.findMany({
        where: { OR: [{ role: "SALE" }, { role: "sale" }] },
        select: { id: true, name: true },
        orderBy: { name: "asc" }
      }),
      prisma.school.count({ where: whereCondition }),
      prisma.school.findMany({
        where: whereCondition,
        include: { 
          sale: true,
          proposals: { select: { projectName: true } }
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      })
    ]);
    sales = salesRes;
    totalSchools = countRes;
    schools = schoolsRes;
  } catch (err) {
    console.error("SchoolsPage findMany error:", err);
  }

  const totalPages = Math.ceil(totalSchools / pageSize);

  return (
    <div>
      <div className="page-title-bar">
        <h1>Danh mục Trường học</h1>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "1rem", flex: "1 1 auto", flexWrap: "wrap", alignItems: "center" }}>
          <SearchInput placeholder="Tìm theo tên trường học..." />
          <SaleFilterSelect sales={sales} />
          <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>
            Tổng cộng: {totalSchools} trường học
          </span>
        </div>
        <Link href="/admin/schools/new" className="btn btn-primary whitespace-nowrap">+ Thêm Trường học</Link>
      </div>

      <div className="card table-container" style={{ padding: 0 }}>
        <table className="table table-hover">
          <thead>
            <tr>
              <th style={{ width: "60px", textAlign: "center" }}>STT</th>
              <th>Tên Trường học</th>
              <th>Địa chỉ / Tỉnh thành</th>
              <th>Sale phụ trách</th>
              <th style={{ textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {schools.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#cbd5e1" }}>Chưa có trường học nào.</td></tr>
            ) : (
              schools.map((school, idx) => (
                <tr key={school.id}>
                  <td style={{ textAlign: "center", fontWeight: 700, color: "#94a3b8" }}>
                    {(page - 1) * pageSize + idx + 1}
                  </td>
                  <td style={{ fontWeight: 700, color: "#ffffff" }}>{school.name}</td>
                  <td style={{ color: "#cbd5e1" }}>{school.address}</td>
                  <td>
                    <span className="badge badge-info" style={{ fontSize: "0.78rem" }}>
                      {school.sale?.name || "Chưa gán"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", alignItems: "center" }}>
                      <Link href={`/admin/schools/${school.id}/edit`} className="btn btn-secondary" style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}>
                        Sửa
                      </Link>
                      <SchoolRowActions school={school} />
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
          totalItems={totalSchools}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
}
