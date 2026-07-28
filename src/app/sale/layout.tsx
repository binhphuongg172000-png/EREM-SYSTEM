"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, logoutAction } from "@/app/actions/auth";
import { LayoutDashboard, FileText, ClipboardCheck, LogOut, Plus, Sparkles } from "lucide-react";
import ToastContainer from "@/components/Toast";
import "./sale.css";

export default function SaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [userName, setUserName] = useState("Nhân viên Sale");

  useEffect(() => {
    const cachedName = localStorage.getItem("userName");
    if (cachedName) {
      setUserName(cachedName);
    } else {
      getCurrentUser().then((user) => {
        if (user) {
          setUserName(user.name);
          localStorage.setItem("userName", user.name);
        } else {
          router.push("/login");
        }
      });
    }
  }, [router]);

  const handleLogout = async () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    await logoutAction();
    router.push("/login");
  };

  return (
    <div className="sale-layout">
      <ToastContainer />
      {/* Sidebar for Desktop */}
      <aside className="sale-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-row">
            <div className="sidebar-brand-icon">E</div>
            <div>
              <h2>EREM OS</h2>
              <span className="badge-sale">SALE WORKSPACE</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-label">HỆ THỐNG</div>
          <Link
            href="/sale/dashboard"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/sale/dashboard")}
            className={`nav-item ${pathname === "/sale/dashboard" ? "active" : ""}`}
          >
            <LayoutDashboard className="nav-item-icon" style={{ color: "#38bdf8" }} size={18} />
            <span>Dashboard</span>
          </Link>

          <div className="nav-group-label">HỒ SƠ & GIAO DỊCH</div>
          <Link
            href="/sale/proposals"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/sale/proposals")}
            className={`nav-item ${pathname?.startsWith("/sale/proposals") ? "active" : ""}`}
          >
            <FileText className="nav-item-icon" style={{ color: "#818cf8" }} size={18} />
            <span>Kho Dự trù</span>
          </Link>
          <Link
            href="/sale/handovers"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/sale/handovers")}
            className={`nav-item ${pathname?.startsWith("/sale/handovers") ? "active" : ""}`}
          >
            <ClipboardCheck className="nav-item-icon" style={{ color: "#2dd4bf" }} size={18} />
            <span>Kho Biên bản</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="sale-main">
        <header className="sale-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.825rem", color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Sparkles size={14} color="#06b6d4" /> Workspace Kinh doanh
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "auto" }}>
            <button
              onClick={handleLogout}
              className="btn"
              style={{
                padding: "0.45rem 0.85rem",
                borderRadius: "10px",
                border: "1px solid rgba(244, 63, 94, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                cursor: "pointer",
                background: "rgba(244, 63, 94, 0.08)",
                color: "#f43f5e",
                fontSize: "0.8rem",
                fontWeight: 700,
                transition: "all 0.2s"
              }}
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut size={14} />
              Đăng xuất
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", paddingLeft: "0.5rem", borderLeft: "1px solid rgba(30, 41, 59, 0.8)" }}>
              <div style={{ display: "flex", flexDirection: "column", textAlign: "right" }}>
                <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>Xin chào,</span>
                <strong style={{ color: "#ffffff", fontSize: "0.85rem" }}>{userName}</strong>
              </div>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, color: "#ffffff", fontSize: "0.9rem",
                boxShadow: "0 0 12px rgba(6, 182, 212, 0.3)"
              }}>
                <span style={{ margin: "auto" }}>{userName ? userName.charAt(0).toUpperCase() : "S"}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="sale-content">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-bottom-nav">
        <Link href="/sale/dashboard" className={`mobile-nav-item ${pathname === "/sale/dashboard" ? "active" : ""}`}>
          <LayoutDashboard size={20} />
          <span>Tổng quan</span>
        </Link>
        <Link href="/sale/proposals" className={`mobile-nav-item ${pathname?.startsWith("/sale/proposals") ? "active" : ""}`}>
          <FileText size={20} />
          <span>Dự trù</span>
        </Link>
        <Link href="/sale/handovers" className={`mobile-nav-item ${pathname?.startsWith("/sale/handovers") ? "active" : ""}`}>
          <ClipboardCheck size={20} />
          <span>Biên bản</span>
        </Link>
      </nav>
    </div>
  );
}
