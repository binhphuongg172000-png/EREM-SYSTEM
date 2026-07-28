import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditSchoolForm from "./form";

import { getCachedData } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function EditSchoolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const cacheKey = `edit_school_${id}`;
  const { school, sales } = await getCachedData(cacheKey, async () => {
    const [school, sales] = await Promise.all([
      prisma.school.findUnique({
        where: { id },
      }),
      prisma.user.findMany({
        where: { role: "SALE" },
        orderBy: { name: "asc" },
      })
    ]);
    return { school, sales };
  }, 30);

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <EditSchoolForm school={school} sales={sales} />
    </div>
  );
}
