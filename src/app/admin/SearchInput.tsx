"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export default function SearchInput({ placeholder = "Tìm kiếm..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") || "";
  const [val, setVal] = useState(currentSearch);

  useEffect(() => {
    setVal(currentSearch);
  }, [currentSearch]);

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setVal("");
    handleSearch("");
  };

  return (
    <div style={{ position: "relative", width: "100%", minWidth: "280px", maxWidth: "440px" }}>
      <Search 
        style={{ 
          position: "absolute", 
          left: "0.85rem", 
          top: "50%", 
          transform: "translateY(-50%)", 
          color: "#38bdf8" 
        }} 
        size={16} 
      />
      <input
        type="text"
        value={val}
        placeholder={placeholder}
        onChange={(e) => {
          setVal(e.target.value);
          handleSearch(e.target.value);
        }}
        className="form-input"
        style={{ 
          paddingLeft: "2.35rem", 
          paddingRight: val ? "2.2rem" : "0.875rem",
          width: "100%", 
          fontSize: "0.875rem",
          opacity: isPending ? 0.7 : 1,
          transition: "all 0.2s ease"
        }}
      />
      {currentSearch && (
        <button
          onClick={handleClear}
          type="button"
          style={{
            position: "absolute",
            right: "0.65rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            padding: "0.25rem",
            display: "flex",
            alignItems: "center",
          }}
          title="Xóa tìm kiếm"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
