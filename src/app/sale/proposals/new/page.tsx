import React from "react";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProposalForm from "./ProposalForm";

export const dynamic = "force-dynamic";

export default async function NewProposalPage({
  searchParams,
}: {
  searchParams?: Promise<{ schoolId?: string }>;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  const resolvedSearchParams = await searchParams;
  const initialSchoolId = resolvedSearchParams?.schoolId || "";

  // Fetch only schools assigned to this Sale, including their latest proposal
  const rawSchools = await prisma.school.findMany({
    where: { saleId: userId },
    include: {
      proposals: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: {
          items: true,
          investments: true,
        }
      }
    }
  });

  const serializedSchools = rawSchools.map(s => {
    const latestProposal = s.proposals[0];
    return {
      id: s.id,
      name: s.name,
      address: s.address,
      investedClassrooms: s.investedClassrooms,
      oldStudents: s.oldStudents,
      newStudents: s.newStudents,
      isLocked: s.isLocked,
      latestProposal: latestProposal ? {
        id: latestProposal.id,
        updatedAt: latestProposal.updatedAt.toISOString(),
        items: latestProposal.items.map(i => ({
          name: i.name,
          specifications: i.specifications,
          quantity: Number(i.quantity),
          price: Number(i.price),
        })),
        investments: latestProposal.investments.map(inv => ({
          name: inv.name,
          description: inv.description,
          quantity: Number(inv.quantity),
          price: Number(inv.price),
        }))
      } : null
    };
  });

  // Fetch catalog items
  const catalogItems = await prisma.item.findMany({
    select: { id: true, name: true, specifications: true, standardPrice: true, unit: true }
  });

  // Fetch catalog investments
  const catalogInvestments = await prisma.otherInvestment.findMany({
    select: { id: true, name: true, description: true, standardPrice: true, unit: true }
  });

  const serializedItems = catalogItems.map(item => ({
    id: item.id,
    name: item.name,
    specifications: item.specifications,
    standardPrice: Number(item.standardPrice),
    unit: item.unit
  }));

  const serializedInvestments = catalogInvestments.map(inv => ({
    id: inv.id,
    name: inv.name,
    description: inv.description,
    standardPrice: Number(inv.standardPrice),
    unit: inv.unit
  }));

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, background: "linear-gradient(135deg, #f1f5f9, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Tạo Dự trù Mới</h1>
        <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "0.25rem" }}>Tìm kiếm trường, nhập chỉ tiêu và chọn hạng mục đầu tư để tính toán ngân sách.</p>
      </div>

      <ProposalForm 
        schools={serializedSchools} 
        catalogItems={serializedItems} 
        catalogInvestments={serializedInvestments} 
        initialSchoolId={initialSchoolId}
      />
    </div>
  );
}
