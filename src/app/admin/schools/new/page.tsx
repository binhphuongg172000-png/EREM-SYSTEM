import React from "react";
import prisma from "@/lib/prisma";
import NewSchoolForm from "./form";

export const dynamic = "force-dynamic";

export default async function NewSchoolPage() {
  const sales = await prisma.user.findMany({
    where: { role: "SALE", status: "ACTIVE" },
    select: { id: true, name: true, username: true }
  });

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <NewSchoolForm sales={sales} />
    </div>
  );
}
