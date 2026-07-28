import React from "react";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SaleHandoversClient from "./SaleHandoversClient";
import { getCachedData } from "@/lib/cache";
import { ClipboardCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SaleHandoversPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  const cacheKey = `sale_handovers_${userId}`;
  const rawHandovers = await getCachedData(cacheKey, async () => {
    return prisma.handover.findMany({
      where: { senderId: userId },
      include: { school: true, receiver: true },
      orderBy: { createdAt: "desc" },
    });
  }, 15);

  const handovers = rawHandovers.map((h) => ({
    id: h.id,
    schoolId: h.schoolId,
    senderId: h.senderId,
    receiverId: h.receiverId,
    status: h.status,
    createdAt: h.createdAt instanceof Date ? h.createdAt.toISOString() : String(h.createdAt),
    school: h.school,
    receiver: h.receiver,
  }));

  return (
    <div style={{ animation: "fadeIn 0.25s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>
            Kho Biên bản Bàn giao
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "0.25rem 0 0 0" }}>
            Quản lý và xuất bản in Biên bản bàn giao thiết bị & kinh phí đầu tư
          </p>
        </div>
      </div>

      <SaleHandoversClient handovers={handovers} />
    </div>
  );
}
