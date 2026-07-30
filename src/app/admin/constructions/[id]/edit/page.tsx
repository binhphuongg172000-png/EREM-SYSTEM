import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditConstructionForm from "./form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditConstructionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  let construction = null;
  try {
    const raw = await prisma.otherInvestment.findUnique({
      where: { id: resolvedParams.id },
    });
    if (raw) {
      construction = JSON.parse(JSON.stringify(raw));
    }
  } catch (err) {
    console.error("EditConstructionPage findUnique error:", err);
  }

  if (!construction) {
    notFound();
  }

  return <EditConstructionForm construction={construction} />;
}
