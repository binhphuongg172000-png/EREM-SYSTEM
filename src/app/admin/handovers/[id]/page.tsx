import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCachedData } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function HandoverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const cacheKey = `admin_handover_detail_${id}`;
  const handover = await getCachedData(cacheKey, async () => {
    return prisma.handover.findUnique({
      where: { id },
      include: {
        school: true,
        sender: true,
        receiver: true,
        proposal: {
          include: {
            items: true,
            investments: true,
          }
        }
      }
    });
  }, 30);

  if (!handover) {
    notFound();
  }

  return (
    <div>
      <div style={{ marginBottom: "1.25rem" }}>
        <Link href="/admin/handovers" style={{ color: "#38bdf8", textDecoration: "none", marginBottom: "0.5rem", display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.85rem", fontWeight: 600 }}>
          &larr; Quay lại Kho Biên bản
        </Link>
        <h1 style={{ fontSize: "1.35rem", fontWeight: 800, marginTop: "0.25rem", color: "#ffffff" }}>Biên bản Bàn giao Chi tiết</h1>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", borderBottom: "1px solid #1e293b", paddingBottom: "0.5rem", color: "#ffffff" }}>Thông tin Biên bản</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <p><strong>Đơn vị Nhận bàn giao:</strong> <span style={{ color: "#ffffff" }}>{handover.school?.name}</span></p>
            <p><strong>Địa chỉ:</strong> <span style={{ color: "#cbd5e1" }}>{handover.school?.address}</span></p>
            <p><strong>Đại diện Bên nhận:</strong> <span style={{ color: "#ffffff" }}>{handover.receiver?.name || "Bàn giao theo hợp đồng"}</span></p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <p><strong>Đại diện Bên giao (Sale):</strong> <span style={{ color: "#38bdf8" }}>{handover.sender?.name}</span></p>
            <p><strong>Ngày lập biên bản:</strong> <span style={{ color: "#ffffff" }}>{new Date(handover.createdAt).toLocaleString("vi-VN")}</span></p>
            <p>
              <strong>Trạng thái:</strong> 
              {handover.status === "CONFIRMED" ? (
                <span className="badge badge-success" style={{ marginLeft: "0.5rem" }}>Đã ký nhận</span>
              ) : handover.status === "SUPERSEDED" ? (
                <span className="badge" style={{ backgroundColor: "#475569", color: "#e2e8f0", marginLeft: "0.5rem" }}>Đã có bản mới hơn</span>
              ) : (
                <span className="badge badge-warning" style={{ marginLeft: "0.5rem" }}>Khởi tạo</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="card table-container" style={{ padding: 0 }}>
        <div style={{ padding: "1.25rem 1.5rem 0.5rem 1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff" }}>Danh mục Thiết bị & Hạng mục Bàn giao</h2>
        </div>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Tên thiết bị / Hạng mục</th>
              <th>Cấu hình / Ghi chú</th>
              <th style={{ textAlign: "center" }}>Số lượng</th>
              <th style={{ textAlign: "right" }}>Đơn giá (đ)</th>
            </tr>
          </thead>
          <tbody>
            {(!handover.proposal?.items || handover.proposal.items.length === 0) && (!handover.proposal?.investments || handover.proposal.investments.length === 0) ? (
              <tr><td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "#cbd5e1" }}>Chưa có danh mục thiết bị bàn giao</td></tr>
            ) : (
              <>
                {handover.proposal?.items.map((item: any) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700, color: "#ffffff" }}>{item.name}</td>
                    <td style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{item.specifications || "-"}</td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "#ffffff" }}>{Number(item.quantity)}</td>
                    <td style={{ textAlign: "right" }}>{Number(item.price).toLocaleString()}</td>
                  </tr>
                ))}
                {handover.proposal?.investments.map((inv: any) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 700, color: "#ffffff" }}>{inv.name}</td>
                    <td style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{inv.description || "-"}</td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "#ffffff" }}>{Number(inv.quantity)}</td>
                    <td style={{ textAlign: "right" }}>{Number(inv.price).toLocaleString()}</td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
