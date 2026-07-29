"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, logoutAction } from "@/app/actions/auth";
import { Home, LayoutDashboard, FileText, ClipboardCheck, LogOut, Laptop, Coins, Wrench, Sparkles } from "lucide-react";
import ToastContainer from "@/components/Toast";
import BrandLogo from "@/components/BrandLogo";
import NotificationBell from "@/components/NotificationBell";
import { getSmartGreeting, GreetingInfo } from "@/lib/greetings";
import "./sale.css";

export default function SaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [userName, setUserName] = useState("Nhân viên Sale");
  const [greetingInfo, setGreetingInfo] = useState<GreetingInfo>({
    greeting: "Xin chào,",
    humorTag: "Chào mừng đến với hệ thống EREM!",
    icon: "👋",
  });

  useEffect(() => {
    const cachedName = localStorage.getItem("userName");
    if (cachedName) {
      setUserName(cachedName);
      setGreetingInfo(getSmartGreeting(cachedName));
    } else {
      getCurrentUser().then((user) => {
        if (user) {
          setUserName(user.name);
          localStorage.setItem("userName", user.name);
          setGreetingInfo(getSmartGreeting(user.name));
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
          <BrandLogo badge="SALE PLATFORM" />
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
          {/* Tạm thời ẩn Kho Biên bản theo yêu cầu */}
          {/* <Link
            href="/sale/handovers"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/sale/handovers")}
            className={`nav-item ${pathname?.startsWith("/sale/handovers") ? "active" : ""}`}
          >
            <ClipboardCheck className="nav-item-icon" style={{ color: "#2dd4bf" }} size={18} />
            <span>Kho Biên bản</span>
          </Link> */}

          <div className="nav-group-label">DANH MỤC THAM KHẢO</div>
          <Link
            href="/sale/items"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/sale/items")}
            className={`nav-item ${pathname?.startsWith("/sale/items") ? "active" : ""}`}
          >
            <Laptop className="nav-item-icon" style={{ color: "#38bdf8" }} size={18} />
            <span>Danh mục Thiết bị</span>
          </Link>
          <Link
            href="/sale/investments"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/sale/investments")}
            className={`nav-item ${pathname?.startsWith("/sale/investments") ? "active" : ""}`}
          >
            <Coins className="nav-item-icon" style={{ color: "#fbbf24" }} size={18} />
            <span>Danh mục Đầu tư khác</span>
          </Link>
          <Link
            href="/sale/constructions"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/sale/constructions")}
            className={`nav-item ${pathname?.startsWith("/sale/constructions") ? "active" : ""}`}
          >
            <Wrench className="nav-item-icon" style={{ color: "#38bdf8" }} size={18} />
            <span>Danh mục Thi công</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="sale-main">
        <header className="sale-header">
          {/* Left/Middle Space: Dynamic Time-of-Day Greeting & Weather Status Pill */}
          <div className="header-left-space">
            <div className="header-greeting-pill">
              <Sparkles size={15} style={{ color: "#38bdf8", flexShrink: 0 }} />
              <span className="greeting-main-text">
                {greetingInfo.greeting}
              </span>
              <span className="greeting-separator">•</span>
              <span className="greeting-humor-tag">
                {greetingInfo.humorTag}
              </span>
            </div>
          </div>

          {/* Right Space: Standard SaaS User Control (Notification Bell -> Profile Capsule -> Logout Button) */}
          <div className="header-right-space">
            {/* Realtime Notification Bell */}
            <NotificationBell />

            {/* User Profile Capsule */}
            <div className="user-profile-capsule">
              <div style={{
                width: "34px", height: "34px", borderRadius: "9px",
                background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, color: "#ffffff", fontSize: "0.9rem",
                boxShadow: "0 0 12px rgba(6, 182, 212, 0.3)", flexShrink: 0
              }}>
                <span>{userName ? userName.charAt(0).toUpperCase() : "S"}</span>
              </div>
              <div className="user-info-stack" style={{ display: "flex", flexDirection: "column", gap: "2px", justifyContent: "center" }}>
                <strong style={{ color: "#ffffff", fontSize: "0.825rem", lineHeight: 1.2, whiteSpace: "nowrap" }}>{userName}</strong>
                <span style={{ color: "#38bdf8", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>SALE MEMBER</span>
              </div>
            </div>

            {/* Logout Button on Far Right */}
            <button
              onClick={handleLogout}
              className="btn-logout-saas"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut size={15} />
              <span className="logout-text">Đăng xuất</span>
            </button>
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
      </nav>
    </div>
  );
}
