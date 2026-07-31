"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, logoutAction } from "@/app/actions/auth";
import { 
  Home, LayoutDashboard, Users, School as SchoolIcon, 
  Laptop, Coins, Wrench, FileText, 
  ClipboardCheck, LogOut, Sparkles 
} from "lucide-react";
import ToastContainer from "@/components/Toast";
import BrandLogo from "@/components/BrandLogo";
import NotificationBell from "@/components/NotificationBell";
import { getSmartGreeting, GreetingInfo } from "@/lib/greetings";
import "./admin.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("Quản trị viên");
  const [userRole, setUserRole] = useState<string>("ADMIN");
  const [greetingInfo, setGreetingInfo] = useState<GreetingInfo>({
    greeting: "Xin chào,",
    humorTag: "Chào mừng đến trung tâm quản trị EREM!",
    icon: "👋",
  });

  useEffect(() => {
    // Ensure clean dark mode at all times
    document.body.classList.remove("light");
    localStorage.removeItem("theme");

    const cachedName = localStorage.getItem("userName");
    const cachedRole = localStorage.getItem("userRole");
    
    if (cachedName) {
      setUserName(cachedName);
      setGreetingInfo(getSmartGreeting(cachedName));
    }
    if (cachedRole) setUserRole(cachedRole);

    getCurrentUser().then((user) => {
      if (user) {
        setUserName(user.name);
        setUserRole(user.role);
        localStorage.setItem("userName", user.name);
        localStorage.setItem("userRole", user.role);
        setGreetingInfo(getSmartGreeting(user.name));
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  const handleLogout = async () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    await logoutAction();
    router.push("/login");
  };

  return (
    <div className="admin-layout">
      <ToastContainer />
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <BrandLogo badge="ADMIN CONTROL" href="/admin/dashboard" />
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-group-label">TỔNG QUAN</div>
          <Link
            href="/admin/dashboard"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/admin/dashboard")}
            className={`nav-item ${pathname === "/admin/dashboard" ? "active" : ""}`}
          >
            <LayoutDashboard className="nav-item-icon" style={{ color: "#38bdf8" }} size={18} />
            <span>Dashboard</span>
          </Link>

          <div className="nav-group-label">HỒ SƠ & GIAO DỊCH</div>
          <Link
            href="/admin/proposals"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/admin/proposals")}
            className={`nav-item ${pathname?.startsWith("/admin/proposals") ? "active" : ""}`}
          >
            <FileText className="nav-item-icon" style={{ color: "#818cf8" }} size={18} />
            <span>Kho Dự trù</span>
          </Link>

          {userRole === "SUPER_ADMIN" && (
            <>
              <div className="nav-group-label">QUẢN TRỊ HỆ THỐNG</div>
              <Link
                href="/admin/users"
                prefetch={true}
                onMouseEnter={() => router.prefetch("/admin/users")}
                className={`nav-item ${pathname?.startsWith("/admin/users") ? "active" : ""}`}
              >
                <Users className="nav-item-icon" style={{ color: "#fbbf24" }} size={18} />
                <span>Tài khoản Hệ thống</span>
              </Link>
            </>
          )}

          <div className="nav-group-label">DANH MỤC DỮ LIỆU</div>
          <Link
            href="/admin/schools"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/admin/schools")}
            className={`nav-item ${pathname?.startsWith("/admin/schools") ? "active" : ""}`}
          >
            <SchoolIcon className="nav-item-icon" style={{ color: "#34d399" }} size={18} />
            <span>Danh sách Trường học</span>
          </Link>
          <Link
            href="/admin/items"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/admin/items")}
            className={`nav-item ${pathname?.startsWith("/admin/items") ? "active" : ""}`}
          >
            <Laptop className="nav-item-icon" style={{ color: "#38bdf8" }} size={18} />
            <span>Danh mục Thiết bị</span>
          </Link>
          <Link
            href="/admin/investments"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/admin/investments")}
            className={`nav-item ${pathname?.startsWith("/admin/investments") ? "active" : ""}`}
          >
            <Coins className="nav-item-icon" style={{ color: "#fbbf24" }} size={18} />
            <span>Danh mục Đầu tư khác</span>
          </Link>
          <Link
            href="/admin/constructions"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/admin/constructions")}
            className={`nav-item ${pathname?.startsWith("/admin/constructions") ? "active" : ""}`}
          >
            <Wrench className="nav-item-icon" style={{ color: "#38bdf8" }} size={18} />
            <span>Danh mục Thi công</span>
          </Link>
          {/* Tạm thời ẩn Kho Biên bản theo yêu cầu */}
          {/* <Link
            href="/admin/handovers"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/admin/handovers")}
            className={`nav-item ${pathname?.startsWith("/admin/handovers") ? "active" : ""}`}
          >
            <ClipboardCheck className="nav-item-icon" style={{ color: "#2dd4bf" }} size={18} />
            <span>Kho Biên bản</span>
          </Link> */}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          {/* Left/Middle Space: Time-of-Day Greeting & Weather Status Pill */}
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
                <span>{userName ? userName.charAt(0).toUpperCase() : "A"}</span>
              </div>
              <div className="user-info-stack" style={{ display: "flex", flexDirection: "column", gap: "2px", justifyContent: "center" }}>
                <strong style={{ color: "#ffffff", fontSize: "0.825rem", lineHeight: 1.2, whiteSpace: "nowrap" }}>{userName}</strong>
                <span style={{ color: "#34d399", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{userRole}</span>
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
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
