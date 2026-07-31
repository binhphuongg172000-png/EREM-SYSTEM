"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 20,
  onPageChange,
}: PaginationControlsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1 && totalItems <= pageSize) {
    return null;
  }

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers array (e.g. 1 2 3 ...)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.85rem 1.25rem",
      background: "rgba(15, 23, 42, 0.75)",
      borderTop: "1px solid rgba(255, 255, 255, 0.08)",
      borderBottomLeftRadius: "12px",
      borderBottomRightRadius: "12px",
      flexWrap: "wrap",
      gap: "0.75rem",
      fontSize: "0.825rem",
      color: "#94a3b8",
    }}>
      <div>
        Hiển thị <strong style={{ color: "#ffffff" }}>{startItem}-{endItem}</strong> trong tổng số <strong style={{ color: "#ffffff" }}>{totalItems}</strong> mục
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
        {/* Previous Button */}
        {onPageChange ? (
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.2rem",
              padding: "0.35rem 0.65rem",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              background: currentPage <= 1 ? "rgba(30, 41, 59, 0.3)" : "rgba(30, 41, 59, 0.8)",
              color: currentPage <= 1 ? "#475569" : "#cbd5e1",
              cursor: currentPage <= 1 ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            <ChevronLeft size={15} /> Trang trước
          </button>
        ) : currentPage <= 1 ? (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.2rem",
            padding: "0.35rem 0.65rem",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            background: "rgba(30, 41, 59, 0.3)",
            color: "#475569",
            fontWeight: 600,
            cursor: "not-allowed"
          }}>
            <ChevronLeft size={15} /> Trang trước
          </span>
        ) : (
          <Link
            href={createPageUrl(currentPage - 1)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.2rem",
              padding: "0.35rem 0.65rem",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              background: "rgba(30, 41, 59, 0.8)",
              color: "#cbd5e1",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            <ChevronLeft size={15} /> Trang trước
          </Link>
        )}

        {/* Page Numbers */}
        {getPageNumbers().map((p, idx) => {
          if (p === "...") {
            return <span key={`ellipsis-${idx}`} style={{ padding: "0 0.25rem", color: "#64748b" }}>...</span>;
          }
          const pageNum = p as number;
          const isActive = pageNum === currentPage;

          if (onPageChange) {
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                style={{
                  minWidth: "32px",
                  height: "32px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  border: isActive ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.1)",
                  background: isActive ? "rgba(56, 189, 248, 0.2)" : "rgba(30, 41, 59, 0.6)",
                  color: isActive ? "#38bdf8" : "#cbd5e1",
                  fontWeight: isActive ? 800 : 600,
                  cursor: "pointer",
                }}
              >
                {pageNum}
              </button>
            );
          }

          return (
            <Link
              key={pageNum}
              href={createPageUrl(pageNum)}
              style={{
                minWidth: "32px",
                height: "32px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                border: isActive ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.1)",
                background: isActive ? "rgba(56, 189, 248, 0.2)" : "rgba(30, 41, 59, 0.6)",
                color: isActive ? "#38bdf8" : "#cbd5e1",
                textDecoration: "none",
                fontWeight: isActive ? 800 : 600,
              }}
            >
              {pageNum}
            </Link>
          );
        })}

        {/* Next Button */}
        {onPageChange ? (
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.2rem",
              padding: "0.35rem 0.65rem",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              background: currentPage >= totalPages ? "rgba(30, 41, 59, 0.3)" : "rgba(30, 41, 59, 0.8)",
              color: currentPage >= totalPages ? "#475569" : "#cbd5e1",
              cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            Trang sau <ChevronRight size={15} />
          </button>
        ) : currentPage >= totalPages ? (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.2rem",
            padding: "0.35rem 0.65rem",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            background: "rgba(30, 41, 59, 0.3)",
            color: "#475569",
            fontWeight: 600,
            cursor: "not-allowed"
          }}>
            Trang sau <ChevronRight size={15} />
          </span>
        ) : (
          <Link
            href={createPageUrl(currentPage + 1)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.2rem",
              padding: "0.35rem 0.65rem",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              background: "rgba(30, 41, 59, 0.8)",
              color: "#cbd5e1",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Trang sau <ChevronRight size={15} />
          </Link>
        )}
      </div>
    </div>
  );
}
