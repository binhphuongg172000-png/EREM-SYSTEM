"use client";

import React from "react";
import { Lock, Trash2, CheckCircle2, Info, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  variant = "warning",
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  // Theme Configs for Icons & Colors
  const theme = {
    danger: {
      color: "#f43f5e",
      bgBadge: "rgba(244, 63, 94, 0.15)",
      borderBadge: "rgba(244, 63, 94, 0.35)",
      btnBg: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
      btnShadow: "0 4px 16px rgba(244, 63, 94, 0.4)",
      icon: <Trash2 size={24} color="#f43f5e" />,
    },
    warning: {
      color: "#f59e0b",
      bgBadge: "rgba(245, 158, 11, 0.15)",
      borderBadge: "rgba(245, 158, 11, 0.35)",
      btnBg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      btnShadow: "0 4px 16px rgba(245, 158, 11, 0.4)",
      icon: <Lock size={24} color="#fbbf24" />,
    },
    success: {
      color: "#10b981",
      bgBadge: "rgba(16, 185, 129, 0.15)",
      borderBadge: "rgba(16, 185, 129, 0.35)",
      btnBg: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      btnShadow: "0 4px 16px rgba(16, 185, 129, 0.4)",
      icon: <CheckCircle2 size={24} color="#10b981" />,
    },
    info: {
      color: "#38bdf8",
      bgBadge: "rgba(56, 189, 248, 0.15)",
      borderBadge: "rgba(56, 189, 248, 0.35)",
      btnBg: "linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)",
      btnShadow: "0 4px 16px rgba(56, 189, 248, 0.4)",
      icon: <Info size={24} color="#38bdf8" />,
    },
  }[variant] || {
    color: "#f59e0b",
    bgBadge: "rgba(245, 158, 11, 0.15)",
    borderBadge: "rgba(245, 158, 11, 0.35)",
    btnBg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    btnShadow: "0 4px 16px rgba(245, 158, 11, 0.4)",
    icon: <Lock size={24} color="#fbbf24" />,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(3, 7, 18, 0.8)",
        backdropFilter: "blur(12px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.25rem",
        animation: "fadeIn 0.2s ease"
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "#0d1527",
          border: `1.5px solid ${theme.borderBadge}`,
          borderRadius: "18px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.95)",
          padding: "1.75rem 1.5rem 1.5rem",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "1rem",
          animation: "scaleUp 0.2s ease"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          style={{
            position: "absolute",
            top: "0.85rem",
            right: "0.85rem",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#94a3b8",
            cursor: "pointer",
            padding: "0.35rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)"; }}
          onMouseOut={(e) => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"; }}
        >
          <X size={15} />
        </button>

        {/* Centered Glowing Icon Badge */}
        <div style={{
          width: "52px", height: "52px", borderRadius: "14px",
          background: theme.bgBadge,
          border: `1px solid ${theme.borderBadge}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 20px ${theme.bgBadge}`
        }}>
          {theme.icon}
        </div>

        {/* Title & Message */}
        <div style={{ width: "100%" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#f8fafc", margin: "0 0 0.4rem 0", letterSpacing: "-0.01em" }}>
            {title}
          </h3>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0, lineHeight: 1.55 }}>
            {message}
          </p>
        </div>

        {/* Symmetrical Equal Action Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", width: "100%", marginTop: "0.5rem" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: "0.6rem 1rem", borderRadius: "10px", fontSize: "0.85rem", fontWeight: 600,
              background: "rgba(30, 41, 59, 0.6)", border: "1px solid #334155", color: "#cbd5e1",
              cursor: "pointer", transition: "all 0.2s", width: "100%"
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = "rgba(51, 65, 85, 0.8)"; e.currentTarget.style.color = "#ffffff"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "rgba(30, 41, 59, 0.6)"; e.currentTarget.style.color = "#cbd5e1"; }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: "0.6rem 1rem", borderRadius: "10px", fontSize: "0.85rem", fontWeight: 800,
              background: theme.btnBg,
              boxShadow: theme.btnShadow,
              border: "none", color: "#ffffff",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease", width: "100%"
            }}
            onMouseOver={(e) => { if (!isLoading) e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseOut={(e) => { if (!isLoading) e.currentTarget.style.transform = "none"; }}
          >
            {isLoading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
