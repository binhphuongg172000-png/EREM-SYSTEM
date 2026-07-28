import React from "react";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import EditConstructionForm from "./form";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function EditConstructionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("userRole")?.value;
  if (userRole !== "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }

  const resolvedParams = await params;
  const construction = await prisma.otherInvestment.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!construction) {
    notFound();
  }

  return <EditConstructionForm construction={construction} />;
}
