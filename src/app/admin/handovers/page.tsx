import React from "react";
import prisma from "@/lib/prisma";
import SearchInput from "../SearchInput";
import HandoverRowActions from "./HandoverRowActions";

import { getCachedData } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function AdminHandoversPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";

  const whereClause: any = {};
  if (search) {
    whereClause.OR = [
      { school: { name: { contains: search, mode: "insensitive" } } },
      { school: { address: { contains: search, mode: "insensitive" } } },
      { sender: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const cacheKey = `admin_handovers_${search}`;
  const handovers = await getCachedData(cacheKey, async () => {
    return prisma.handover.findMany({
      where: whereClause,
      include: {
        school: true,
        sender: true,
        receiver: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }, 15);

  return (
    <div>
      <div className="page-title-bar">
        <h1>Kho Biên bản Bàn giao Toàn Hệ thống</h1>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "1rem", flexWrap: "wrap" }}>
        <SearchInput placeholder="Tìm tên trường, người nhận..." />
      </div>

      <div className="card table-container" style={{ padding: 0 }}>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Trường học / Địa chỉ</th>
              <th>Người Bàn giao (Sale)</th>
              <th>Người Nhận</th>
              <th>Ngày lập</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {handovers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#cbd5e1" }}>
                  Chưa có Biên bản bàn giao nào.
                </td>
              </tr>
            ) : (
              handovers.map((h) => (
                <tr key={h.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#ffffff", display: "block" }}>{h.school?.name}</span>
                    <span style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>{h.school?.address}</span>
                  </td>
                  <td style={{ color: "#38bdf8", fontWeight: 600 }}>{h.sender?.name}</td>
                  <td style={{ color: "#ffffff" }}>{h.receiver?.name || "Bàn giao theo HĐ"}</td>
                  <td>{new Date(h.createdAt).toLocaleString("vi-VN")}</td>
                  <td>
                    {h.status === "CONFIRMED" ? (
                      <span className="badge badge-success">Đã ký nhận</span>
                    ) : h.status === "SUPERSEDED" ? (
                      <span className="badge" style={{ backgroundColor: "#475569", color: "#e2e8f0" }}>Đã có bản mới hơn</span>
                    ) : (
                      <span className="badge badge-warning">Khởi tạo</span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <HandoverRowActions handover={h} />
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
