"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

type SaleUser = {
  id: string;
  name: string;
};

export default function SaleFilterSelect({ sales }: { sales: SaleUser[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSaleId = searchParams.get("saleId") || "";

  const handleSaleChange = (saleId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (saleId) {
      params.set("saleId", saleId);
    } else {
      params.delete("saleId");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div style={{ position: "relative", minWidth: "220px", maxWidth: "300px", flex: "1 1 auto" }}>
      <Filter
        style={{
          position: "absolute",
          left: "0.85rem",
          top: "50%",
          transform: "translateY(-50%)",
          color: "#38bdf8",
          pointerEvents: "none"
        }}
        size={16}
      />
      <select
        value={currentSaleId}
        onChange={(e) => handleSaleChange(e.target.value)}
        className="form-input"
        style={{
          paddingLeft: "2.35rem",
          width: "100%",
          fontSize: "0.875rem",
          opacity: isPending ? 0.7 : 1,
          transition: "all 0.2s ease",
          cursor: "pointer",
          appearance: "none"
        }}
      >
        <option value="">Tất cả nhân viên Sale</option>
        {sales.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </div>
  );
}
