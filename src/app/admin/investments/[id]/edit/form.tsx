"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Coins, ArrowLeft } from "lucide-react";
import { updateOtherInvestment } from "@/app/actions/item";
import CurrencyInput from "@/components/CurrencyInput";
import { toast } from "@/components/Toast";

const invSchema = z.object({
  name: z.string().min(1, "Tên hạng mục không được để trống"),
  description: z.string().min(1, "Mô tả chi tiết"),
  unit: z.string().min(1, "Đơn vị tính"),
  standardPrice: z.string().min(1, "Đơn giá chuẩn"),
});

type InvFormValues = z.infer<typeof invSchema>;

interface Investment {
  id: string;
  name: string;
  description: string;
  unit: string;
  standardPrice: unknown;
}

export default function EditInvestmentForm({ investment }: { investment: Investment }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InvFormValues>({
    resolver: zodResolver(invSchema),
    defaultValues: {
      name: investment.name || "",
      description: investment.description || "",
      unit: investment.unit || "Gói",
      standardPrice: String(investment.standardPrice || 0),
    },
  });

  const onSubmit = async (data: InvFormValues) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await updateOtherInvestment(investment.id, data);
      if (res.success) {
        toast.success("Cập nhật Hạng mục Đầu tư khác thành công!");
        router.push("/admin/investments");
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
    <>
      <div style={{ marginBottom: "1.25rem" }}>
        <Link
          href="/admin/investments"
          className="btn btn-secondary"
          style={{ fontSize: "0.825rem", padding: "0.45rem 0.85rem", gap: "0.35rem" }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </Link>
      </div>

      <div className="card" style={{ padding: "1.75rem" }}>
        <div style={{ paddingBottom: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(245, 158, 11, 0.15)", border: "1px solid #f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Coins size={20} style={{ color: "#fbbf24" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff" }}>Chỉnh sửa Hạng mục Đầu tư khác</h1>
            <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Cập nhật tên hạng mục, mô tả chi tiết và đơn giá chuẩn</p>
          </div>
        </div>

        {error && <div className="alert-error" style={{ marginBottom: "1.25rem" }}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Tên Hạng mục <span style={{ color: "var(--error)" }}>*</span></label>
            <input type="text" className="form-input" placeholder="VD: Máy lạnh, bàn ghế, trang trí..." {...register("name")} />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả chi tiết <span style={{ color: "var(--error)" }}>*</span></label>
            <textarea className="form-input" rows={4} placeholder="VD: Máy lạnh, công suất 2 HP, Inverter..." {...register("description")} />
            {errors.description && <p className="form-error">{errors.description.message}</p>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Đơn vị tính <span style={{ color: "var(--error)" }}>*</span></label>
              <input type="text" className="form-input" placeholder="VD: Gói, Chuyến..." {...register("unit")} />
              {errors.unit && <p className="form-error">{errors.unit.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Đơn giá chuẩn (VNĐ) <span style={{ color: "var(--error)" }}>*</span></label>
              <CurrencyInput
                placeholder="VD: 8,000,000"
                value={watch("standardPrice")}
                onChange={(val) => setValue("standardPrice", val, { shouldValidate: true })}
              />
              {errors.standardPrice && <p className="form-error">{errors.standardPrice.message}</p>}
            </div>
          </div>

          <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => router.push("/admin/investments")} style={{ flex: 1, justifyContent: "center" }}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ flex: 1.5, justifyContent: "center" }}>
              {isLoading ? "Đang xử lý..." : "Cập nhật Hạng mục"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
