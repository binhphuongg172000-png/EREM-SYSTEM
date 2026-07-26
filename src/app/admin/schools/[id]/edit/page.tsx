import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditSchoolForm from "./form";

export const dynamic = "force-dynamic";

export default async function EditSchoolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const school = await prisma.school.findUnique({
    where: { id },
  });

  if (!school) {
    notFound();
  }

  const sales = await prisma.user.findMany({
    where: { role: "SALE" },
    orderBy: { name: "asc" },
  });

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <EditSchoolForm school={school} sales={sales} />
    </div>
  );
}
