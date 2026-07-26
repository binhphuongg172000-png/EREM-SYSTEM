"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, logoutAction } from "@/app/actions/auth";
import { LayoutDashboard, FileText, ClipboardCheck, LogOut } from "lucide-react";
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
    getCurrentUser().then((user) => {
      if (user) setUserName(user.name);
      else router.push("/login");
    });
  }, [router]);

  const handleLogout = async () => {
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
            className={`nav-item ${pathname === "/sale/dashboard" ? "active" : ""}`}
          >
            <LayoutDashboard className="nav-item-icon" style={{ color: "#38bdf8" }} size={18} />
            <span>Dashboard</span>
          </Link>

          <div className="nav-group-label">HỒ SƠ & GIAO DỊCH</div>
          <Link
            href="/sale/proposals"
            className={`nav-item ${pathname?.startsWith("/sale/proposals") ? "active" : ""}`}
          >
            <FileText className="nav-item-icon" style={{ color: "#818cf8" }} size={18} />
            <span>Kho Dự trù</span>
          </Link>
          <Link
            href="/sale/handovers"
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
          <div className="header-brand-mobile">
            <h2>EREM OS — SALE</h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginLeft: "auto" }}>
            <button
              onClick={handleLogout}
              className="btn"
              style={{
                padding: "0.4rem 0.85rem",
                borderRadius: "8px",
                border: "1px solid #f43f5e",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                cursor: "pointer",
                background: "rgba(244, 63, 94, 0.15)",
                color: "#ff3355",
                fontSize: "0.8rem",
                fontWeight: 700,
              }}
              title="Đăng xuất"
            >
              <LogOut size={15} style={{ color: "#f43f5e" }} />
              Đăng xuất
            </button>

            <div className="header-user">
              <div className="header-user-info">
                <span style={{ color: "#cbd5e1" }}>Xin chào,</span>
                <strong style={{ color: "#ffffff", fontSize: "0.9rem" }}>{userName}</strong>
              </div>
              <div className="header-user-avatar">
                {userName ? userName.charAt(0).toUpperCase() : "S"}
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
