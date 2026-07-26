"use client";

import React from "react";
import { AlertCircle, Lock, Trash2, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "warning",
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  let accentColor = "#f59e0b";
  let btnClass = "btn btn-secondary";
  let btnStyle: React.CSSProperties = {
    borderColor: "#f59e0b",
    color: "#fbbf24",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
  };

  if (variant === "danger") {
    accentColor = "#f43f5e";
    btnClass = "btn btn-danger";
    btnStyle = {};
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(3, 7, 18, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          backgroundColor: "#0d1424",
          border: "1px solid #1e293b",
          borderRadius: "0.75rem",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
          padding: "1.25rem",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isLoading}
          style={{
            position: "absolute",
            top: "0.85rem",
            right: "0.85rem",
            background: "none",
            border: "none",
            color: "#64748b",
            cursor: "pointer",
            padding: "0.2rem",
            display: "flex",
            alignItems: "center",
          }}
        >
          <X size={15} />
        </button>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
          {variant === "danger" ? (
            <Trash2 size={18} style={{ color: "#f43f5e", marginTop: "0.15rem", flexShrink: 0 }} />
          ) : (
            <Lock size={18} style={{ color: "#f59e0b", marginTop: "0.15rem", flexShrink: 0 }} />
          )}

          <div style={{ flex: 1, paddingRight: "1.2rem" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.25rem" }}>
              {title}
            </h4>
            <p style={{ fontSize: "0.825rem", color: "#cbd5e1", lineHeight: "1.45" }}>
              {message}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.25rem" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isLoading}
            style={{ fontSize: "0.8rem", padding: "0.35rem 0.85rem", height: "auto" }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={btnClass}
            onClick={onConfirm}
            disabled={isLoading}
            style={{ fontSize: "0.8rem", padding: "0.35rem 0.85rem", height: "auto", ...btnStyle }}
          >
            {isLoading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
