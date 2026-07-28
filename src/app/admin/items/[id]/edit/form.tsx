"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Laptop, ArrowLeft } from "lucide-react";
import { updateItem } from "@/app/actions/item";
import CurrencyInput from "@/components/CurrencyInput";
import { toast } from "@/components/Toast";

const itemSchema = z.object({
  name: z.string().min(1, "Tên thiết bị không được để trống"),
  specifications: z.string().min(1, "Mô tả cấu hình"),
  accessories: z.string().optional(),
  unit: z.string().min(1, "Đơn vị tính"),
  standardPrice: z.string().min(1, "Đơn giá chuẩn"),
});

type ItemFormValues = z.infer<typeof itemSchema>;

interface Item {
  id: string;
  name: string;
  specifications: string;
  accessories?: string | null;
  unit: string;
  standardPrice: unknown;
}

export default function EditItemForm({ item }: { item: Item }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: item.name || "",
      specifications: item.specifications || "",
      accessories: item.accessories || "",
      unit: item.unit || "Bộ",
      standardPrice: String(item.standardPrice || 0),
    },
  });

  const onSubmit = async (data: ItemFormValues) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await updateItem(item.id, data);
      if (res.success) {
        toast.success("Cập nhật Thiết bị phần cứng thành công!");
        router.push("/admin/items");
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
          href="/admin/items"
          className="btn btn-secondary"
          style={{ fontSize: "0.825rem", padding: "0.45rem 0.85rem", gap: "0.35rem" }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </Link>
      </div>

      <div className="card" style={{ padding: "1.75rem" }}>
        <div style={{ paddingBottom: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(56, 189, 248, 0.15)", border: "1px solid #38bdf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Laptop size={20} style={{ color: "#38bdf8" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff" }}>Chỉnh sửa Thông tin Thiết bị</h1>
            <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Cập nhật thông tin chi tiết cấu hình và đơn giá chuẩn của thiết bị</p>
          </div>
        </div>

        {error && <div className="alert-error" style={{ marginBottom: "1.25rem" }}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Tên Thiết bị <span style={{ color: "var(--error)" }}>*</span></label>
            <input type="text" className="form-input" {...register("name")} />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Cấu hình chi tiết <span style={{ color: "var(--error)" }}>*</span></label>
            <textarea className="form-input" rows={4} {...register("specifications")} />
            {errors.specifications && <p className="form-error">{errors.specifications.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Linh kiện kèm theo</label>
            <textarea className="form-input" rows={2} {...register("accessories")} />
            {errors.accessories && <p className="form-error">{errors.accessories.message}</p>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Đơn vị tính <span style={{ color: "var(--error)" }}>*</span></label>
              <input type="text" className="form-input" placeholder="VD: Bộ, Chiếc, Máy..." {...register("unit")} />
              {errors.unit && <p className="form-error">{errors.unit.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Đơn giá chuẩn (VNĐ) <span style={{ color: "var(--error)" }}>*</span></label>
              <CurrencyInput
                placeholder="VD: 15,000,000"
                value={watch("standardPrice")}
                onChange={(val) => setValue("standardPrice", val, { shouldValidate: true })}
              />
              {errors.standardPrice && <p className="form-error">{errors.standardPrice.message}</p>}
            </div>
          </div>

          <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => router.push("/admin/items")} style={{ flex: 1, justifyContent: "center" }}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ flex: 1.5, justifyContent: "center" }}>
              {isLoading ? "Đang xử lý..." : "Cập nhật Thiết bị"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
