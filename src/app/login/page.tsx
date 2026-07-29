"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { loginAction, warmupAction } from "@/app/actions/auth";
import { User, Lock, Eye, EyeOff, Sparkles, ShieldCheck, TrendingUp, Layers, ArrowRight, Loader2 } from "lucide-react";
import EremLogo from "@/components/EremLogo";
import "./login.css";

const loginSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  
  // Quantum 3D Warp Portal Transition State
  const [isWarping, setIsWarping] = useState(false);
  const [warpUser, setWarpUser] = useState<{ name: string; role: string } | null>(null);

  // 3D Tilt Mouse tracking state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    router.prefetch("/admin/dashboard");
    router.prefetch("/sale/dashboard");

    // Pre-warm the SAME serverless function that handles loginAction
    warmupAction().catch(() => {});

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 50; // -25deg to 25deg
      const y = (e.clientY / innerHeight - 0.5) * -50;
      setTilt({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await loginAction(data);
      if (res.success && res.user) {
        localStorage.setItem("userName", res.user.name);
        localStorage.setItem("userRole", res.user.role);
        const targetUrl = (res.user.role === "ADMIN" || res.user.role === "SUPER_ADMIN") 
          ? "/admin/dashboard" 
          : "/sale/dashboard";
        
        // Trigger 3D Quantum Warp Portal Effect
        setWarpUser({ name: res.user.name, role: res.user.role });
        setIsWarping(true);

        fetch("/api/prewarm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: res.user.role, userId: res.user.id }),
        }).catch(() => {});

        setTimeout(() => {
          window.location.href = targetUrl;
        }, 850);
      } else {
        setError(res.message || "Tên đăng nhập hoặc mật khẩu không đúng");
        setIsLoading(false);
      }
    } catch (err: any) {
      setError("Có lỗi hệ thống xảy ra: " + (err?.message || String(err)));
      setIsLoading(false);
    }
  };

  return (
    <div className="login-3d-page">
      {/* ⚡ Quantum 3D Warp Portal Transition on Success */}
      {isWarping && (
        <div className="quantum-warp-overlay">
          <div className="warp-tunnel-ring ring-wave-1" />
          <div className="warp-tunnel-ring ring-wave-2" />
          <div className="warp-laser-beam" />
          
          <div className="warp-content-card">
            <EremLogo
              variant="vertical"
              size={90}
              badge="ACCESS GRANTED"
              subtitle={`XIN CHÀO, ${warpUser?.name?.toUpperCase() || "USER"}`}
            />
            <div className="warp-progress-wrap">
              <div className="warp-progress-bar" />
            </div>
            <div className="warp-status-text">
              <span>⚡ 100% SECURE CONNECTION • ĐANG VÀO HỆ THỐNG</span>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Ambient 3D Glowing Orbs in Background */}
      <div className="bg-glow-orb orb-cyan" />
      <div className="bg-glow-orb orb-indigo" />
      <div className="bg-glow-orb orb-rose" />

      <div className="login-3d-container">
        
        {/* ===================================================
           LEFT 3D HERO PANEL (8D Hyper-Dimensional Showcase)
           =================================================== */}
        <div className="login-3d-hero">
          {/* 8D Isometric Floating Stage */}
          <div 
            className="hero-3d-stage stage-8d"
            style={{
              transform: `perspective(1200px) rotateX(${tilt.y * 0.8}deg) rotateY(${tilt.x * 0.8}deg)`
            }}
          >
            {/* 8D Hyper-Dimensional Quantum Atmosphere */}
            <div className="hologram-core-8d" />
            <div className="orbital-ring-8d ring-8d-alpha" />
            <div className="orbital-ring-8d ring-8d-beta" />
            <div className="orbital-ring-8d ring-8d-gamma" />
            <div className="laser-beam-8d beam-1" />
            <div className="laser-beam-8d beam-2" />

            {/* Floating 8D Quantum Energy Dust */}
            <div className="quantum-particle p1" />
            <div className="quantum-particle p2" />
            <div className="quantum-particle p3" />
            <div className="quantum-particle p4" />

            {/* Holographic 3D Rings */}
            <div className="ring-3d ring-1" />
            <div className="ring-3d ring-2" />

            {/* Main Brand Floating 3D Badge */}
            <div className="brand-3d-badge badge-8d">
              <EremLogo
                variant="vertical"
                size={72}
                badge="SYSTEM v2.5 • 8D CORE"
                subtitle="Quản Lý Dự Trù & Bàn Giao Thiết Bị"
              />
            </div>

            {/* 3D Floating Feature Cards with 8D Neon Light Traces */}
            <div className="features-3d-stack stack-8d">
              {/* Card 1 */}
              <div className="card-3d card-8d float-delay-1">
                <div className="card-8d-light-bar" />
                <div className="card-3d-icon icon-cyan">
                  <Layers size={20} />
                </div>
                <div>
                  <strong>Lập dự trù tự động AI</strong>
                  <span>Định mức kinh phí từng trường học</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="card-3d card-8d float-delay-2">
                <div className="card-8d-light-bar" />
                <div className="card-3d-icon icon-emerald">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <strong>Biên bản bàn giao số</strong>
                  <span>Ký điện tử & Lưu trữ an toàn</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="card-3d card-8d float-delay-3">
                <div className="card-8d-light-bar" />
                <div className="card-3d-icon icon-amber">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <strong>Theo dõi ngân sách Realtime</strong>
                  <span>Phân tích cân đối tài chính trực quan</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ===================================================
           RIGHT 3D FORM PANEL (Glassmorphism Login Box with Smooth Assembly)
           =================================================== */}
        <div className="login-3d-form-panel">
          <div className="form-3d-card">
            
            {/* Mobile 3D Brand Badge (Visible on Mobile & Tablets) */}
            <div className="mobile-brand-3d-header">
              <EremLogo variant="vertical" size={56} badge="v2.5 CORE" />
            </div>

            {/* Header Title */}
            <div className="form-header">
              <div className="version-pill">EREM SYSTEM v2.5</div>
              <h2>Đăng Nhập System 👋</h2>
              <p>Nhập thông tin tài khoản để truy cập hệ thống</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="alert-error-3d">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Username */}
              <div className="field-3d field-username">
                <label>Tên đăng nhập</label>
                <div className="input-wrap-3d">
                  <User size={18} className="input-icon-3d" />
                  <input
                    type="text"
                    className="input-3d"
                    placeholder="Nhập tên đăng nhập..."
                    autoComplete="username"
                    {...register("username")}
                  />
                </div>
                {errors.username && (
                  <p className="error-text-3d">⚠ {errors.username.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="field-3d field-password">
                <label>Mật khẩu</label>
                <div className="input-wrap-3d">
                  <Lock size={18} className="input-icon-3d" />
                  <input
                    type={showPass ? "text" : "password"}
                    className="input-3d"
                    placeholder="Nhập mật khẩu..."
                    autoComplete="current-password"
                    style={{ paddingRight: "3rem" }}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="btn-toggle-pass"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="error-text-3d">⚠ {errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`btn-submit-3d ${isLoading ? "loading" : ""}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập hệ thống</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="form-footer-3d">
              © 2026 EREM OS — Nền tảng quản lý dự trù thiết bị trường học
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
