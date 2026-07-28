"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, logoutAction } from "@/app/actions/auth";
import { 
  LayoutDashboard, Users, School as SchoolIcon, 
  Laptop, Coins, FileText, 
  ClipboardCheck, LogOut 
} from "lucide-react";
import ToastContainer from "@/components/Toast";
import "./admin.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("Super Admin");
  const [userRole, setUserRole] = useState("ADMIN");

  useEffect(() => {
    // Ensure clean dark mode at all times
    document.body.classList.remove("light");
    localStorage.removeItem("theme");

    const cachedName = localStorage.getItem("userName");
    const cachedRole = localStorage.getItem("userRole");
    if (cachedRole === "ADMIN") setUserName("Admin");
    else if (cachedName && cachedName !== "System Administrator") setUserName(cachedName);
    else setUserName("Super Admin");
    if (cachedRole) setUserRole(cachedRole);

    getCurrentUser().then((user) => {
      if (user) {
        let displayName = user.name;
        if (user.role === "ADMIN") {
          displayName = "Admin";
        } else if (user.role === "SUPER_ADMIN" || user.name === "System Administrator") {
          displayName = "Super Admin";
        }
        setUserName(displayName);
        setUserRole(user.role);
        localStorage.setItem("userName", displayName);
        localStorage.setItem("userRole", user.role);
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
          <div className="sidebar-brand-row">
            <div className="sidebar-brand-icon">E</div>
            <div>
              <h2>EREM OS</h2>
              <span className="badge-admin">ADMIN SYSTEM</span>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-group-label">HỆ THỐNG</div>
          <Link
            href="/admin/dashboard"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/admin/dashboard")}
            className={`nav-item ${pathname === "/admin/dashboard" ? "active" : ""}`}
          >
            <LayoutDashboard className="nav-item-icon" style={{ color: "#38bdf8" }} size={18} />
            <span>Dashboard</span>
          </Link>
          {userRole === "SUPER_ADMIN" && (
            <Link
              href="/admin/users"
              prefetch={true}
              onMouseEnter={() => router.prefetch("/admin/users")}
              className={`nav-item ${pathname?.startsWith("/admin/users") ? "active" : ""}`}
            >
              <Users className="nav-item-icon" style={{ color: "#34d399" }} size={18} />
              <span>Quản lý Người dùng</span>
            </Link>
          )}

          <div className="nav-group-label">DANH MỤC</div>
          <Link
            href="/admin/schools"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/admin/schools")}
            className={`nav-item ${pathname?.startsWith("/admin/schools") ? "active" : ""}`}
          >
            <SchoolIcon className="nav-item-icon" style={{ color: "#fbbf24" }} size={18} />
            <span>Danh mục Trường học</span>
          </Link>
          {userRole === "SUPER_ADMIN" && (
            <>
              <Link
                href="/admin/items"
                prefetch={true}
                onMouseEnter={() => router.prefetch("/admin/items")}
                className={`nav-item ${pathname?.startsWith("/admin/items") ? "active" : ""}`}
              >
                <Laptop className="nav-item-icon" style={{ color: "#c084fc" }} size={18} />
                <span>Danh mục Thiết bị</span>
              </Link>
              <Link
                href="/admin/investments"
                prefetch={true}
                onMouseEnter={() => router.prefetch("/admin/investments")}
                className={`nav-item ${pathname?.startsWith("/admin/investments") ? "active" : ""}`}
              >
                <Coins className="nav-item-icon" style={{ color: "#f472b6" }} size={18} />
                <span>Danh mục Đầu tư khác</span>
              </Link>
            </>
          )}

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
          <Link
            href="/admin/handovers"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/admin/handovers")}
            className={`nav-item ${pathname?.startsWith("/admin/handovers") ? "active" : ""}`}
          >
            <ClipboardCheck className="nav-item-icon" style={{ color: "#2dd4bf" }} size={18} />
            <span>Kho Biên bản</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <span className="status-dot"></span>
            <span style={{ fontSize: "0.775rem", color: "#34d399", letterSpacing: "0.05em", fontWeight: 700 }}>
              SYSTEM ONLINE • 256-BIT SECURE
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
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
                fontWeight: 700
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
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
