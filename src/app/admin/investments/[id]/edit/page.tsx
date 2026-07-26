import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditInvestmentForm from "./form";

export const dynamic = "force-dynamic";

export default async function EditInvestmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const investment = await prisma.otherInvestment.findUnique({
    where: { id },
  });

  if (!investment) {
    notFound();
  }

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <EditInvestmentForm investment={investment} />
    </div>
  );
}
