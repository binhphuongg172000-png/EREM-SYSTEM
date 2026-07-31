"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wrench, ArrowLeft } from "lucide-react";
import { createOtherInvestment } from "@/app/actions/item";
import CurrencyInput from "@/components/CurrencyInput";
import { toast } from "@/components/Toast";

const schema = z.object({
  name: z.string().min(1, "Tên hạng mục thi công không được để trống"),
  description: z.string().min(1, "Mô tả chi tiết hạng mục thi công"),
  unit: z.string().min(1, "Đơn vị tính"),
  standardPrice: z.string().min(1, "Đơn giá chuẩn"),
});

type FormValues = z.infer<typeof schema>;

export default function NewConstructionPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      unit: "Gói",
      standardPrice: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await createOtherInvestment({
        ...data,
        category: "CONSTRUCTION"
      });
      if (res.success) {
        toast.success("Thêm Hạng mục Thi công thành công!");
        router.push("/admin/constructions");
        router.refresh();
      } else {
        setError(res.message);
        setIsLoading(false);
      }
    } catch {
      setError("Có lỗi hệ thống xảy ra");
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.25rem" }}>
        <Link
          href="/admin/constructions"
          className="btn btn-secondary"
          style={{ fontSize: "0.825rem", padding: "0.45rem 0.85rem", gap: "0.35rem" }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách Thi công
        </Link>
      </div>

      <div className="card" style={{ padding: "1.75rem" }}>
        <div style={{ paddingBottom: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(56, 189, 248, 0.15)", border: "1px solid #38bdf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Wrench size={20} style={{ color: "#38bdf8" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff" }}>Thêm Hạng mục Thi công mới</h1>
            <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Nhập thông tin gói thi công, lắp đặt, di dời hoặc bảo trì phòng học</p>
          </div>
        </div>

        {error && <div className="alert-error" style={{ marginBottom: "1.25rem" }}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Tên Hạng mục Thi công <span style={{ color: "var(--error)" }}>*</span></label>
            <input type="text" className="form-input" placeholder="VD: Gói thi công cắt đôi bảng từ xanh..." {...register("name")} />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả chi tiết <span style={{ color: "var(--error)" }}>*</span></label>
            <textarea className="form-input" rows={4} placeholder="VD: Thi công tháo gỡ, vận chuyển và lắp đặt hoàn thiện..." {...register("description")} />
            {errors.description && <p className="form-error">{errors.description.message}</p>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Đơn vị tính <span style={{ color: "var(--error)" }}>*</span></label>
              <input type="text" className="form-input" placeholder="VD: Gói, Phòng..." {...register("unit")} />
              {errors.unit && <p className="form-error">{errors.unit.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Đơn giá chuẩn (VNĐ) <span style={{ color: "var(--error)" }}>*</span></label>
              <CurrencyInput
                placeholder="VD: 3,500,000"
                value={watch("standardPrice")}
                onChange={(val) => setValue("standardPrice", val, { shouldValidate: true })}
              />
              {errors.standardPrice && <p className="form-error">{errors.standardPrice.message}</p>}
            </div>
          </div>

          <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => router.push("/admin/constructions")} style={{ flex: 1, justifyContent: "center" }}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ flex: 1.5, justifyContent: "center" }}>
              {isLoading ? "Đang xử lý..." : "Lưu Hạng mục Thi công"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
