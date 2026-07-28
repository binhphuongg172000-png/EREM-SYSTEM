import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditInvestmentForm from "./form";

import { getCachedData } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function EditInvestmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const cacheKey = `edit_investment_${id}`;
  const investment = await getCachedData(cacheKey, async () => {
    return prisma.otherInvestment.findUnique({
      where: { id },
    });
  }, 30);

  if (!investment) {
    notFound();
  }

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <EditInvestmentForm investment={investment} />
    </div>
  );
}
