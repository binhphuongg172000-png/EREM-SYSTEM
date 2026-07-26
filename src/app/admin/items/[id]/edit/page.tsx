import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditItemForm from "./form";

export const dynamic = "force-dynamic";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const item = await prisma.item.findUnique({
    where: { id },
  });

  if (!item) {
    notFound();
  }

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <EditItemForm item={item} />
    </div>
  );
}
