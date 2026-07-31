import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PaginationControls from "@/components/PaginationControls";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SaleSchoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";
  const page = Math.max(1, Number(resolvedParams?.page || 1));
  const pageSize = 20;

  const whereCondition = {
    saleId: userId,
    ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {})
  };

  let schools: any[] = [];
  let totalSchools = 0;

  try {
    const [countRes, schoolsRes] = await Promise.all([
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
    totalSchools = countRes;
    schools = schoolsRes;
  } catch (err) {
    console.error("SaleSchoolsPage findMany error:", err);
  }

  const totalPages = Math.ceil(totalSchools / pageSize);

  return (
    <div>
      <div className="page-title-bar" style={{ marginBottom: "1.2rem" }}>
        <div>
          <h1>Danh sách Trường học Phụ trách</h1>
          <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>
            Tổng cộng: {totalSchools} trường học được phân công
          </span>
        </div>
      </div>

      <div className="card table-container" style={{ padding: 0 }}>
        <table className="table table-hover">
          <thead>
            <tr>
              <th style={{ width: "60px", textAlign: "center" }}>STT</th>
              <th>Tên Trường học</th>
              <th>Địa chỉ / Tỉnh thành</th>
              <th>Sale phụ trách</th>
            </tr>
          </thead>
          <tbody>
            {schools.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "#cbd5e1" }}>Chưa có trường học nào được phân công.</td></tr>
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
