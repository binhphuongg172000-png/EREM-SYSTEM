import React from "react";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SaleHandoversClient from "./SaleHandoversClient";

export const dynamic = "force-dynamic";

export default async function SaleHandoversPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  const rawHandovers = await prisma.handover.findMany({
    where: { senderId: userId },
    include: { school: true, receiver: true },
    orderBy: { createdAt: "desc" },
  });

  const handovers = rawHandovers.map((h) => ({
    id: h.id,
    schoolId: h.schoolId,
    senderId: h.senderId,
    receiverId: h.receiverId,
    status: h.status,
    createdAt: h.createdAt.toISOString(),
    school: h.school,
    receiver: h.receiver,
  }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ffffff" }}>Biên bản Bàn giao của bạn</h1>
      </div>

      <SaleHandoversClient handovers={handovers} />
    </div>
  );
}
