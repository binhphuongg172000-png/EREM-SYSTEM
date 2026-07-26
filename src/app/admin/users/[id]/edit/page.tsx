import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditUserForm from "./form";

export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    notFound();
  }

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <EditUserForm user={user} />
    </div>
  );
}
