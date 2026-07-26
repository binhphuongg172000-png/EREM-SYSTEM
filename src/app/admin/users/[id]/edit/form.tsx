"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateUser } from "@/app/actions/user";
import { toast } from "@/components/Toast";
import { UserCheck, ArrowLeft } from "lucide-react";

const editUserSchema = z.object({
  name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ").or(z.literal("")),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "SALE"]),
  password: z.string().optional(),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

export default function EditUserForm({ user }: { user: any }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      role: user.role || "SALE",
      password: "",
    },
  });

  const onSubmit = async (data: EditUserFormValues) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await updateUser(user.id, data);
      if (res.success) {
        toast.success("Cập nhật thông tin Người dùng thành công!");
        router.push("/admin/users");
        router.refresh();
      } else {
        setError(res.message);
        setIsLoading(false);
      }
    } catch (err: any) {
      setError("Có lỗi hệ thống xảy ra");
      setIsLoading(false);
    }
  };

  return (
    <>
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
            <UserCheck size={20} style={{ color: "#c084fc" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff" }}>Chỉnh sửa Thông tin Người dùng</h1>
            <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Cập nhật thông tin cá nhân, phân quyền hoặc đổi mật khẩu</p>
          </div>
        </div>

        {error && <div className="alert-error" style={{ marginBottom: "1.25rem" }}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Tên đăng nhập</label>
              <input
                type="text"
                className="form-input"
                value={user.username}
                disabled
                style={{ opacity: 0.6, cursor: "not-allowed", backgroundColor: "#0b0f19" }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Đổi mật khẩu mới (để trống nếu giữ nguyên)</label>
              <input
                type="password"
                className="form-input"
                placeholder="Mật khẩu mới..."
                {...register("password")}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Họ và tên <span style={{ color: "var(--error)" }}>*</span></label>
              <input
                type="text"
                className="form-input"
                {...register("name")}
              />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Email liên hệ</label>
              <input
                type="email"
                className="form-input"
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
              {isLoading ? "Đang xử lý..." : "Cập nhật Người dùng"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
