import React from "react";
import NewItemForm from "../../items/new/form";

export default function NewInvestmentPage() {
  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <NewItemForm type="investments" />
    </div>
  );
}
