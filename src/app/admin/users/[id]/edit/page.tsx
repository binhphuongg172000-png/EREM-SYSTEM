import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditUserForm from "./form";

import { getCachedData } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const cacheKey = `edit_user_${id}`;
  const user = await getCachedData(cacheKey, async () => {
    return prisma.user.findUnique({
      where: { id },
    });
  }, 30);

  if (!user) {
    notFound();
  }

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <EditUserForm user={user} />
    </div>
  );
}
