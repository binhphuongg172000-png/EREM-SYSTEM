import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import SearchInput from "../SearchInput";
import DeleteItemButton from "./DeleteItemButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; project?: string }>;
}) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";
  const projectFilter = resolvedParams?.project || "ALL";

  let resItems: any[] = [];
  try {
    resItems = await prisma.item.findMany({
      where: search ? { name: { contains: search, mode: "insensitive" } } : {},
      orderBy: { name: "asc" },
    });
  } catch (err) {
    console.error("ItemsPage findMany error:", err);
  }

  const rawItems = (resItems || []).sort((a, b) => 
    (a.name || "").localeCompare(b.name || "", "vi", { sensitivity: "base" })
  );

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
      <div className="page-title-bar">
        <h1>Danh mục Thiết bị</h1>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap", flex: 1 }}>
          <SearchInput placeholder="Tìm theo tên thiết bị..." />

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
                href={`/admin/items?${new URLSearchParams({ ...(search ? { search } : {}), ...(tab.key !== "ALL" ? { project: tab.key } : {}) }).toString()}`}
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  padding: "0.35rem 0.75rem",
                  borderRadius: "7px",
                  textDecoration: "none",
                  background: projectFilter === tab.key ? "#3b82f6" : "transparent",
                  color: projectFilter === tab.key ? "#ffffff" : "#94a3b8",
                  transition: "all 0.15s ease"
                }}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        <Link href="/admin/items/new" className="btn btn-primary">+ Thêm Thiết bị</Link>
      </div>

      <div className="card table-container" style={{ padding: 0 }}>
        <div className="table-container" style={{ marginTop: 0 }}>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Tên Thiết bị</th>
                <th>Dự án áp dụng</th>
                <th>Cấu hình chi tiết</th>
                <th>Linh kiện kèm theo</th>
                <th>ĐVT</th>
                <th>Đơn giá chuẩn (VNĐ)</th>
                <th style={{ textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#cbd5e1" }}>Chưa có thiết bị nào phù hợp.</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700, color: "#ffffff" }}>{item.name}</td>
                    <td>{getProjectBadges(item.projectName)}</td>
                    <td style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{item.specifications}</td>
                    <td style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{item.accessories || "-"}</td>
                    <td>{item.unit || "Bộ"}</td>
                    <td style={{ fontWeight: 700, color: "#ffffff" }}>{Number(item.standardPrice).toLocaleString()} đ</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", alignItems: "center" }}>
                        <Link href={`/admin/items/${item.id}/edit`} className="btn btn-secondary" style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}>
                          Sửa
                        </Link>
                        <DeleteItemButton id={item.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
