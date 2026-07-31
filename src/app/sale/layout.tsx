"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, logoutAction } from "@/app/actions/auth";
import { Home, LayoutDashboard, School as SchoolIcon, FileText, ClipboardCheck, LogOut, Laptop, Coins, Wrench, Sparkles } from "lucide-react";
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
          <div className="nav-group-label">TỔNG QUAN</div>
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

          <div className="nav-group-label">DANH MỤC DỮ LIỆU</div>
          <Link
            href="/sale/schools"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/sale/schools")}
            className={`nav-item ${pathname?.startsWith("/sale/schools") ? "active" : ""}`}
          >
            <SchoolIcon className="nav-item-icon" style={{ color: "#34d399" }} size={18} />
            <span>Danh sách Trường học</span>
          </Link>
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

          <div className="user-profile" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <NotificationBell />
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, color: "#030712", fontSize: "0.85rem",
                boxShadow: "0 0 10px rgba(56, 189, 248, 0.3)", flexShrink: 0
              }}>
                {userName ? userName.charAt(0).toUpperCase() : "S"}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff" }}>
                  {userName}
                </span>
                <span style={{ fontSize: "0.7rem", color: "#38bdf8", fontWeight: 600 }}>
                  SALE MEMBER
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem", display: "flex", alignItems: "center", gap: "0.35rem" }}
            >
              <LogOut size={14} />
              Đăng xuất
            </button>
          </div>
        </header>

        <div className="sale-content">
          {children}
        </div>
      </main>
    </div>
  );
}
