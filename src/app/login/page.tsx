"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
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
        if (res.user.role === "ADMIN" || res.user.role === "SUPER_ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/sale/dashboard");
        }
      } else {
        setError(res.message || "Tên đăng nhập hoặc mật khẩu không đúng");
      }
    } catch {
      setError("Có lỗi hệ thống xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ---- LEFT PANEL ---- */}
      <div className="login-panel-left">
        <div className="login-brand">
          <div className="login-brand-icon">🏫</div>
          <h1>EREM SYSTEM</h1>
          <p>Hệ thống Quản lý Dự trù &amp; Bàn giao Thiết bị</p>
        </div>

        <div className="login-stats">
          <div className="login-stat-card">
            <div className="login-stat-emoji">📋</div>
            <div className="login-stat-info">
              <strong>Lập dự trù nhanh chóng</strong>
              <span>Quản lý thiết bị theo từng trường học</span>
            </div>
          </div>
          <div className="login-stat-card">
            <div className="login-stat-emoji">✅</div>
            <div className="login-stat-info">
              <strong>Biên bản bàn giao số</strong>
              <span>Ký xác nhận điện tử, lưu trữ an toàn</span>
            </div>
          </div>
          <div className="login-stat-card">
            <div className="login-stat-emoji">📊</div>
            <div className="login-stat-info">
              <strong>Theo dõi ngân sách realtime</strong>
              <span>Phân tích hiệu suất theo từng Sale</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---- RIGHT PANEL ---- */}
      <div className="login-panel-right">
        <div className="login-form-wrap">
          <div className="login-form-title">
            <h2>Xin chào! 👋</h2>
            <p>Đăng nhập để tiếp tục quản lý hệ thống</p>
          </div>

          {error && (
            <div className="login-alert-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Username */}
            <div className="login-field">
              <label>Tên đăng nhập</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">👤</span>
                <input
                  type="text"
                  className="login-input"
                  placeholder="Nhập tên đăng nhập..."
                  autoComplete="username"
                  {...register("username")}
                />
              </div>
              {errors.username && (
                <p className="login-field-error">⚠ {errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="login-field">
              <label>Mật khẩu</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">🔒</span>
                <input
                  type={showPass ? "text" : "password"}
                  className="login-input"
                  placeholder="Nhập mật khẩu..."
                  autoComplete="current-password"
                  style={{ paddingRight: "3rem" }}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: "0.9rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1rem",
                    color: "#475569",
                    padding: 0,
                    lineHeight: 1,
                  }}
                  title={showPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && (
                <p className="login-field-error">⚠ {errors.password.message}</p>
              )}
            </div>

            <button type="submit" className="login-submit" disabled={isLoading}>
              {isLoading && <span className="login-spinner" />}
              {isLoading ? "Đang xác thực..." : "Đăng nhập hệ thống"}
            </button>
          </form>

          <div className="login-form-footer">
            Hệ thống dành riêng cho <span>EREM EDUCATION</span> · v2.0
          </div>
        </div>
      </div>
    </div>
  );
}
