import React from "react";
import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export default async function InvestmentsLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }
  return <>{children}</>;
}
