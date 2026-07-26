import React from "react";
import NewItemForm from "./form";

export default async function NewItemPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const resolvedParams = await searchParams;
  const type = resolvedParams.type === "investments" ? "investments" : "items";

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <NewItemForm type={type} />
    </div>
  );
}
