import React from "react";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import HandoverForm from "./HandoverForm";

export const dynamic = "force-dynamic";

export default async function NewHandoverPage({
  searchParams,
}: {
  searchParams?: Promise<{ proposalId?: string }>;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  const resolvedParams = await searchParams;
  const proposalId = resolvedParams?.proposalId;

  if (!proposalId) {
    redirect("/sale/proposals");
  }

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { school: true }
  });

  if (!proposal) {
    redirect("/sale/proposals");
  }

  // Get potential receivers (Admin / IT / etc)
  const receivers = await prisma.user.findMany({
    where: { role: { not: "SALE" } },
    select: { id: true, name: true, role: true }
  });

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href={`/sale/proposals/${proposalId}`} style={{ color: "#38bdf8", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
          &larr; Quay lại chi tiết dự trù
        </Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ffffff", marginTop: "0.5rem" }}>
          Xuất Biên Bản Bàn Giao
        </h1>
      </div>

      <div className="card" style={{ maxWidth: "600px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", color: "#ffffff" }}>Thông tin Bàn giao</h2>
        
        <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "rgba(56, 189, 248, 0.1)", borderRadius: "8px", border: "1px solid rgba(56, 189, 248, 0.2)" }}>
          <p style={{ marginBottom: "0.5rem" }}><strong>Trường học:</strong> <span style={{ color: "#ffffff" }}>{proposal.school.name}</span></p>
          <p style={{ marginBottom: "0.5rem" }}><strong>Ngân sách đầu tư:</strong> <span style={{ color: "#ffffff", fontWeight: 700 }}>{Number(proposal.investedBudget).toLocaleString()} VNĐ</span></p>
          <p style={{ margin: 0 }}><strong>Số lượng thiết bị:</strong> <span style={{ color: "#ffffff" }}>Tham chiếu theo dự trù hiện tại</span></p>
        </div>

        <HandoverForm 
          proposalId={proposalId}
          schoolId={proposal.schoolId}
          senderId={userId}
          receivers={receivers}
        />
      </div>
    </div>
  );
}
