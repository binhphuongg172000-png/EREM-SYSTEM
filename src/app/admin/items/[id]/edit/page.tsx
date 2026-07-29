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

  const itemData = await prisma.item.findUnique({
    where: { id },
  });

  if (!itemData) {
    notFound();
  }

  const item = JSON.parse(JSON.stringify(itemData));

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <EditItemForm item={item} />
    </div>
  );
}
