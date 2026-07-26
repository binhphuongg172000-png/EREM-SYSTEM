import React from "react";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import HandoverForm from "@/app/sale/handovers/new/HandoverForm";

export const dynamic = "force-dynamic";

export default async function AdminHandoverCreatePage({ searchParams }: { searchParams: Promise<{ proposalId?: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  const resolvedSearchParams = await searchParams;
  const proposalId = resolvedSearchParams.proposalId;
  
  if (!proposalId) {
    redirect("/admin/proposals");
  }

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { school: true }
  });

  if (!proposal) {
    redirect("/admin/proposals");
  }

  // Get receivers (SALE role for example, or ADMIN themselves)
  const receivers = await prisma.user.findMany({
    where: { role: { in: ["SALE", "ADMIN"] }, status: "ACTIVE" },
    select: { id: true, name: true, role: true }
  });

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <Link href="/admin/proposals" style={{ color: "#38bdf8", textDecoration: "none", marginBottom: "1rem", display: "inline-block", fontSize: "0.85rem", fontWeight: 600 }}>
        &larr; Quay lại danh sách Dự trù
      </Link>
      
      <div className="card">
        <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff", marginBottom: "0.5rem" }}>
          Xuất Biên Bản Bàn Giao
        </h1>
        <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
          Xuất biên bản bàn giao thiết bị cho trường <strong>{proposal.school.name}</strong>.
        </p>

        <HandoverForm 
          proposalId={proposal.id} 
          schoolId={proposal.schoolId} 
          senderId={userId}
          receivers={receivers}
          basePath="/admin"
        />
      </div>
    </div>
  );
}
