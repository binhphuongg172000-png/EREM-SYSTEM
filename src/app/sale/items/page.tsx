import React from "react";
import prisma from "@/lib/prisma";
import { getCachedData } from "@/lib/cache";
import SearchInput from "@/app/admin/SearchInput";
import { Laptop } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SaleItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; project?: string }>;
}) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";
  const projectFilter = resolvedParams?.project || "ALL";

  const resItems = await prisma.item.findMany({
    where: search ? { name: { contains: search, mode: "insensitive" } } : {},
    orderBy: { name: "asc" }
  });
  const rawItems = resItems.sort((a, b) => a.name.localeCompare(b.name, "vi", { sensitivity: "base" }));

  const items = rawItems.filter(item => {
    if (projectFilter === "ALL") return true;
    const pStr = item.projectName || "IPRO";
    return pStr.includes(projectFilter);
  });

  const getProjectBadges = (pStr?: string | null) => {
    const projects = (pStr || "IPRO").split(",").map(p => p.trim()).filter(Boolean);
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
        {projects.map(p => {
          let bg = "rgba(56, 189, 248, 0.15)";
          let color = "#38bdf8";
          let border = "1px solid rgba(56, 189, 248, 0.3)";
          if (p === "ICLASS") {
            bg = "rgba(168, 85, 247, 0.15)";
            color = "#c084fc";
            border = "1px solid rgba(168, 85, 247, 0.3)";
          } else if (p === "IGEN") {
            bg = "rgba(245, 158, 11, 0.15)";
            color = "#fbbf24";
            border = "1px solid rgba(245, 158, 11, 0.3)";
          } else if (p === "ILINK") {
            bg = "rgba(16, 185, 129, 0.15)";
            color = "#34d399";
            border = "1px solid rgba(16, 185, 129, 0.3)";
          }
          return (
            <span
              key={p}
              style={{
                fontSize: "0.7rem",
                fontWeight: 800,
                padding: "0.15rem 0.5rem",
                borderRadius: "6px",
                background: bg,
                color,
                border
              }}
            >
              {p}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div className="page-title-bar" style={{ marginBottom: "1.25rem" }}>
        <h1 className="flex items-center gap-2 text-xl font-black text-white">
          <Laptop className="text-purple-400" size={24} />
          Danh mục Thiết bị Tham khảo
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Bảng giá chuẩn định mức và quy cách kỹ thuật thiết bị trường học
        </p>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "240px" }}>
          <SearchInput placeholder="Tìm theo tên hoặc mã thiết bị..." />
        </div>

        {/* Project Filter Tabs */}
        <div style={{ display: "flex", gap: "0.3rem", background: "rgba(15, 23, 42, 0.6)", padding: "0.25rem", borderRadius: "10px", border: "1px solid #1e293b" }}>
          {[
            { key: "ALL", label: "Tất cả Dự án" },
            { key: "IPRO", label: "IPRO" },
            { key: "ICLASS", label: "ICLASS" },
            { key: "IGEN", label: "IGEN" },
            { key: "ILINK", label: "ILINK" },
          ].map(tab => (
            <Link
              key={tab.key}
              href={`/sale/items?${new URLSearchParams({ ...(search ? { search } : {}), ...(tab.key !== "ALL" ? { project: tab.key } : {}) }).toString()}`}
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                padding: "0.35rem 0.75rem",
                borderRadius: "7px",
                textDecoration: "none",
                background: projectFilter === tab.key ? "#818cf8" : "transparent",
                color: projectFilter === tab.key ? "#ffffff" : "#94a3b8",
                transition: "all 0.15s ease"
              }}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="card table-container" style={{ padding: 0 }}>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên Thiết bị</th>
              <th>Dự án áp dụng</th>
              <th>Quy cách kỹ thuật</th>
              <th>Linh phụ kiện</th>
              <th>ĐVT</th>
              <th style={{ textAlign: "right" }}>Đơn giá chuẩn (VNĐ)</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                  Chưa có thiết bị nào trong danh mục phù hợp.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={item.id}>
                  <td style={{ color: "#64748b", fontWeight: 700 }}>{idx + 1}</td>
                  <td style={{ fontWeight: 700, color: "#ffffff" }}>{item.name}</td>
                  <td>{getProjectBadges(item.projectName)}</td>
                  <td style={{ fontSize: "0.825rem", color: "#94a3b8", maxWidth: "300px" }}>{item.specifications}</td>
                  <td style={{ fontSize: "0.825rem", color: "#64748b" }}>{item.accessories || "—"}</td>
                  <td><span className="badge badge-secondary">{item.unit}</span></td>
                  <td style={{ textAlign: "right", fontWeight: 800, color: "#34d399" }}>
                    {Number(item.standardPrice).toLocaleString("vi-VN")} đ
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
