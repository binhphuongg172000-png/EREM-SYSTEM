"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUser } from "@/app/actions/user";
import { toast } from "@/components/Toast";
import { UserPlus, ArrowLeft } from "lucide-react";

const userSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(3, "Mật khẩu ít nhất 3 ký tự"),
  name: z.string().min(1, "Vui lòng nhập họ và tên"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "SALE"]),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function NewUserPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "SALE",
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true);
    setError("");
    
    try {
      const res = await createUser(data);
      if (res.success) {
        toast.success("Tạo Người dùng mới thành công!");
        router.push("/admin/users");
        router.refresh();
      } else {
        setError(res.message);
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.25rem" }}>
        <Link
          href="/admin/users"
          className="btn btn-secondary"
          style={{ fontSize: "0.825rem", padding: "0.45rem 0.85rem", gap: "0.35rem" }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </Link>
      </div>

      <div className="card" style={{ padding: "1.75rem" }}>
        <div style={{ paddingBottom: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(168, 85, 247, 0.15)", border: "1px solid #a855f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UserPlus size={20} style={{ color: "#c084fc" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff" }}>Thêm Người dùng mới</h1>
            <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Khởi tạo tài khoản truy cập hệ thống và phân quyền vai trò</p>
          </div>
        </div>

        {error && <div className="alert-error" style={{ marginBottom: "1.25rem" }}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Tên đăng nhập <span style={{ color: "var(--error)" }}>*</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="VD: nv_sale_01"
                {...register("username")}
              />
              {errors.username && <p className="form-error">{errors.username.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu <span style={{ color: "var(--error)" }}>*</span></label>
              <input
                type="password"
                className="form-input"
                placeholder="Nhập mật khẩu..."
                {...register("password")}
              />
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Họ và tên <span style={{ color: "var(--error)" }}>*</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="VD: Nguyễn Văn A"
                {...register("name")}
              />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Email liên hệ</label>
              <input
                type="email"
                className="form-input"
                placeholder="VD: a@erem.vn"
                {...register("email")}
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phân quyền Vai trò <span style={{ color: "var(--error)" }}>*</span></label>
            <select className="form-input" {...register("role")}>
              <option value="SALE">Nhân viên kinh doanh (SALE)</option>
              <option value="ADMIN">Quản trị viên hệ thống (ADMIN)</option>
              <option value="SUPER_ADMIN">Quản trị viên cấp cao (SUPER ADMIN)</option>
            </select>
            {errors.role && <p className="form-error">{errors.role.message}</p>}
          </div>

          <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.push("/admin/users")}
              style={{ flex: 1, justifyContent: "center" }}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ flex: 1.5, justifyContent: "center" }}
            >
              {isLoading ? "Đang xử lý..." : "Lưu Người dùng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
