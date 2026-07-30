"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global app error:", error);
  }, [error]);

  // Re-throw Next.js internal redirect errors so redirect() works seamlessly
  if (
    error?.message?.includes("NEXT_REDIRECT") ||
    error?.digest?.startsWith("NEXT_REDIRECT") ||
    (error as any)?.isRedirect
  ) {
    throw error;
  }

  return (
    <div style={{
      minHeight: "80vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      textAlign: "center",
      color: "#ffffff"
    }}>
      <div style={{
        background: "rgba(15, 23, 42, 0.8)",
        border: "1px solid rgba(244, 63, 94, 0.3)",
        borderRadius: "20px",
        padding: "2.5rem",
        maxWidth: "480px",
        width: "100%",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(12px)"
      }}>
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: "rgba(244, 63, 94, 0.15)",
          border: "1px solid rgba(244, 63, 94, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.25rem auto"
        }}>
          <AlertTriangle size={28} color="#f43f5e" />
        </div>

        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 0.5rem 0", color: "#ffffff" }}>
          Đã xảy ra lỗi kết nối hệ thống
        </h2>
        <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "0 0 1.75rem 0", lineHeight: 1.5 }}>
          Hệ thống đang tải dữ liệu hoặc phản hồi tạm thời gián đoạn. Vui lòng bấm thử lại bên dưới.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "0.65rem 1.25rem",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "0.85rem",
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)"
            }}
          >
            <RefreshCw size={15} /> Thử lại
          </button>
          <Link
            href="/admin/dashboard"
            style={{
              padding: "0.65rem 1.25rem",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.08)",
              color: "#cbd5e1",
              fontWeight: 700,
              fontSize: "0.85rem",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}
          >
            <Home size={15} /> Về Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
