"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, X, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Unlock } from "lucide-react";
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/app/actions/notification";
import { useRouter } from "next/navigation";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  proposalId?: string | null;
  schoolName?: string | null;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    try {
      const res = await getNotifications(10);
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    setLoading(true);
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    setLoading(false);
  };

  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      await markNotificationAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setIsOpen(false);

    if (notif.proposalId) {
      router.push(`/sale/proposals`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "APPROVED":
        return <CheckCircle2 size={16} color="#34d399" />;
      case "REJECTED":
        return <AlertCircle size={16} color="#f43f5e" />;
      case "COMPLETED":
        return <ShieldCheck size={16} color="#38bdf8" />;
      case "UNLOCKED":
        return <Unlock size={16} color="#fbbf24" />;
      default:
        return <Bell size={16} color="#38bdf8" />;
    }
  };

  return (
    <div style={{ position: "relative" }} ref={popoverRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifs();
        }}
        style={{
          position: "relative",
          width: "38px",
          height: "38px",
          borderRadius: "10px",
          border: "1px solid rgba(56, 189, 248, 0.25)",
          background: "rgba(15, 23, 42, 0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#ffffff",
          transition: "all 0.2s ease",
          boxShadow: isOpen ? "0 0 15px rgba(56, 189, 248, 0.4)" : "none",
        }}
        title="Thông báo thay đổi trạng thái dự trù"
      >
        <Bell size={18} style={{ color: unreadCount > 0 ? "#38bdf8" : "#94a3b8" }} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
              color: "#ffffff",
              fontSize: "0.68rem",
              fontWeight: 800,
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 10px rgba(244, 63, 94, 0.7)",
              border: "1.5px solid #0f172a",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "48px",
            right: "0",
            width: "360px",
            maxHeight: "440px",
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(3, 7, 18, 0.98) 100%)",
            border: "1.5px solid rgba(56, 189, 248, 0.35)",
            borderRadius: "16px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(6, 182, 212, 0.2)",
            backdropFilter: "blur(20px)",
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "fadeInPopover 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "0.8rem 1rem",
              borderBottom: "1px solid rgba(30, 41, 59, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(15, 23, 42, 0.8)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Bell size={16} style={{ color: "#38bdf8" }} />
              <strong style={{ fontSize: "0.88rem", color: "#ffffff" }}>Thông Báo Trạng Thái</strong>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: "rgba(56, 189, 248, 0.18)",
                    color: "#38bdf8",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "0.1rem 0.45rem",
                    borderRadius: "6px",
                  }}
                >
                  {unreadCount} mới
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                style={{
                  background: "none",
                  border: "none",
                  color: "#38bdf8",
                  fontSize: "0.74rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.2rem",
                }}
              >
                <CheckCheck size={14} /> Đã đọc hết
              </button>
            )}
          </div>

          {/* List Content */}
          <div
            style={{
              overflowY: "auto",
              padding: "0.4rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
              maxHeight: "360px",
            }}
          >
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: "2rem 1rem",
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: "0.82rem",
                }}
              >
                🔔 Không có thông báo mới nào
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  style={{
                    padding: "0.7rem 0.85rem",
                    borderRadius: "10px",
                    background: n.read ? "rgba(15, 23, 42, 0.4)" : "rgba(30, 41, 59, 0.75)",
                    border: n.read ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(56, 189, 248, 0.3)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    gap: "0.65rem",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ marginTop: "2px", flexShrink: 0 }}>{getNotificationIcon(n.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.15rem" }}>
                      <strong style={{ fontSize: "0.82rem", color: n.read ? "#cbd5e1" : "#ffffff", fontWeight: 700 }}>
                        {n.title.replace("Dự trù đã Phê duyệt & Đóng băng", "Dự trù chuyển sang Đang thực hiện")}
                      </strong>
                      <span style={{ fontSize: "0.68rem", color: "#64748b" }}>
                        {new Date(n.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.76rem", color: "#94a3b8", margin: 0, lineHeight: 1.35 }}>
                      {n.message
                        .replace(/Super Admin Super Admin/g, "Super Admin")
                        .replace(/đã phê duyệt và khóa dự trù/g, "đã chuyển dự trù sang trạng thái Đang thực hiện (bạn không được phép chỉnh sửa)")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
