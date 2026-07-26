"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

type ToastListener = (toast: ToastMessage) => void;
const listeners: Set<ToastListener> = new Set();

export const toast = {
  success: (msg: string) => {
    listeners.forEach((l) => l({ id: Math.random().toString(), message: msg, type: "success" }));
  },
  error: (msg: string) => {
    listeners.forEach((l) => l({ id: Math.random().toString(), message: msg, type: "error" }));
  },
  info: (msg: string) => {
    listeners.forEach((l) => l({ id: Math.random().toString(), message: msg, type: "info" }));
  },
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleAdd = (newToast: ToastMessage) => {
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 3500);
    };

    listeners.add(handleAdd);
    return () => {
      listeners.delete(handleAdd);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "1.25rem",
        right: "1.25rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        maxWidth: "380px",
        width: "100%",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => {
        let borderColor = "#10b981";
        let bgColor = "rgba(16, 185, 129, 0.15)";
        let textColor = "#34d399";
        let Icon = CheckCircle2;

        if (t.type === "error") {
          borderColor = "#f43f5e";
          bgColor = "rgba(244, 63, 94, 0.15)";
          textColor = "#fb7185";
          Icon = AlertCircle;
        } else if (t.type === "info") {
          borderColor = "#38bdf8";
          bgColor = "rgba(56, 189, 248, 0.15)";
          textColor = "#38bdf8";
          Icon = Info;
        }

        return (
          <div
            key={t.id}
            style={{
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.85rem 1.1rem",
              backgroundColor: "#0d1424",
              border: `1.5px solid ${borderColor}`,
              borderRadius: "0.75rem",
              boxShadow: `0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px ${bgColor}`,
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 700,
              animation: "toastSlideIn 0.3s ease-out forwards",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Icon size={20} style={{ color: textColor, flexShrink: 0 }} />
            <span style={{ flex: 1, color: "#ffffff", lineHeight: "1.4" }}>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: "none",
                border: "none",
                color: "#cbd5e1",
                cursor: "pointer",
                padding: "0.2rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
