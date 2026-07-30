import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SaleSchoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";

  let schools: any[] = [];
  try {
    schools = await prisma.school.findMany({
      where: {
        saleId: userId,
        ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {})
      },
      include: { sale: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("SaleSchoolsPage findMany error:", err);
  }

  return (
    <div>
      <div className="page-title-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
        <h1>Danh sách Trường học Phụ trách</h1>
        <Link href="/sale/proposals/new" className="btn btn-primary">+ Tạo Dự trù Mới</Link>
      </div>

      <div className="card table-container" style={{ padding: 0 }}>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Tên Trường học</th>
              <th>Địa chỉ / Tỉnh thành</th>
              <th>Sale phụ trách</th>
              <th style={{ textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {schools.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "#cbd5e1" }}>Chưa có trường học nào được phân công.</td></tr>
            ) : (
              schools.map(school => (
                <tr key={school.id}>
                  <td style={{ fontWeight: 700, color: "#ffffff" }}>{school.name}</td>
                  <td style={{ color: "#cbd5e1" }}>{school.address}</td>
                  <td>
                    <span className="badge badge-info" style={{ fontSize: "0.78rem" }}>
                      {school.sale?.name || "Chưa gán"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link
                      href={`/sale/proposals/new?schoolId=${school.id}`}
                      className="btn btn-secondary"
                      style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
                    >
                      Lập dự trù
                    </Link>
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
