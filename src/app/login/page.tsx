"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { User, Lock, Eye, EyeOff, Sparkles, ShieldCheck, TrendingUp, Layers, ArrowRight, Loader2 } from "lucide-react";
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
  
  // 3D Tilt Mouse tracking state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    router.prefetch("/admin/dashboard");
    router.prefetch("/sale/dashboard");

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
        
        window.location.href = targetUrl;
      } else {
        setError(res.message || "Tên đăng nhập hoặc mật khẩu không đúng");
        setIsLoading(false);
      }
    } catch {
      setError("Có lỗi hệ thống xảy ra. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-3d-page">
      {/* Dynamic Ambient 3D Glowing Orbs in Background */}
      <div className="bg-glow-orb orb-cyan" />
      <div className="bg-glow-orb orb-indigo" />
      <div className="bg-glow-orb orb-rose" />

      <div className="login-3d-container">
        
        {/* ===================================================
           LEFT 3D HERO PANEL (3D Perspective Showcase)
           =================================================== */}
        <div className="login-3d-hero">
          {/* 3D Isometric Floating Stage */}
          <div 
            className="hero-3d-stage"
            style={{
              transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`
            }}
          >
            {/* Holographic 3D Rings */}
            <div className="ring-3d ring-1" />
            <div className="ring-3d ring-2" />

            {/* Main Brand Floating 3D Badge */}
            <div className="brand-3d-badge">
              <div className="brand-3d-icon-box">
                <Sparkles size={42} color="#ffffff" className="sparkle-spin" />
              </div>
              <h1 className="brand-3d-title">EREM OS</h1>
              <p className="brand-3d-tagline">Quản Lý Dự Trù & Bàn Giao Thiết Bị</p>
            </div>

            {/* 3D Floating Feature Cards */}
            <div className="features-3d-stack">
              {/* Card 1 */}
              <div className="card-3d float-delay-1">
                <div className="card-3d-icon icon-cyan">
                  <Layers size={20} />
                </div>
                <div>
                  <strong>Lập dự trù tự động AI</strong>
                  <span>Định mức kinh phí từng trường học</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="card-3d float-delay-2">
                <div className="card-3d-icon icon-emerald">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <strong>Biên bản bàn giao số</strong>
                  <span>Ký điện tử & Lưu trữ an toàn</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="card-3d float-delay-3">
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
           RIGHT 3D FORM PANEL (Glassmorphism Login Box)
           =================================================== */}
        <div className="login-3d-form-panel">
          <div className="form-3d-card">
            
            {/* Header Title */}
            <div className="form-header">
              <div className="version-pill">EREM EDUCATION v2.5</div>
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
              <div className="field-3d">
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
              <div className="field-3d">
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
