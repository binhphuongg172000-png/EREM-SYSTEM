import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditItemForm from "./form";

import { getCachedData } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const cacheKey = `edit_item_${id}`;
  const item = await getCachedData(cacheKey, async () => {
    return prisma.item.findUnique({
      where: { id },
    });
  }, 30);

  if (!item) {
    notFound();
  }

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <EditItemForm item={item} />
    </div>
  );
}
