"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSchool } from "@/app/actions/school";
import { FileSpreadsheet, School, ArrowLeft } from "lucide-react";
import ExcelImportModal from "@/components/ExcelImportModal";
import { toast } from "@/components/Toast";

const schoolSchema = z.object({
  name: z.string().min(3, "Tên trường ít nhất 3 ký tự"),
  address: z.string().min(5, "Địa chỉ chi tiết hơn"),
  saleId: z.string().min(1, "Vui lòng chọn nhân viên Sale"),
});

type SchoolFormValues = z.infer<typeof schoolSchema>;

export default function NewSchoolForm({ sales }: { sales: any[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
  });

  const onSubmit = async (data: SchoolFormValues) => {
    setIsLoading(true);
    setError("");
    
    try {
      const res = await createSchool(data);
      if (res.success) {
        toast.success("Tạo Trường học mới thành công!");
        router.push("/admin/schools");
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <Link
          href="/admin/schools"
          className="btn btn-secondary"
          style={{ fontSize: "0.825rem", padding: "0.45rem 0.85rem", gap: "0.35rem" }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </Link>

        <button
          type="button"
          onClick={() => setIsImportOpen(true)}
          className="btn btn-secondary"
          style={{ fontSize: "0.825rem", borderColor: "#38bdf8", color: "#38bdf8", fontWeight: 700, padding: "0.45rem 0.85rem", gap: "0.4rem" }}
        >
          <FileSpreadsheet size={16} /> Import từ File Excel
        </button>
      </div>

      <div className="card" style={{ padding: "1.75rem" }}>
        <div style={{ paddingBottom: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(56, 189, 248, 0.15)", border: "1px solid #38bdf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <School size={20} style={{ color: "#38bdf8" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff" }}>Thêm Trường học mới</h1>
            <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Nhập thông tin điểm trường và phân công Nhân viên Sale quản lý</p>
          </div>
        </div>

        {error && <div className="alert-error" style={{ marginBottom: "1.25rem" }}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Tên Trường <span style={{ color: "var(--error)" }}>*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="VD: THCS Nguyễn Trãi"
              {...register("name")}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Địa chỉ chi tiết <span style={{ color: "var(--error)" }}>*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="VD: Số 12 Khuất Duy Tiến, Thanh Xuân, Hà Nội"
              {...register("address")}
            />
            {errors.address && <p className="form-error">{errors.address.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Phân công Nhân viên Sale quản lý <span style={{ color: "var(--error)" }}>*</span></label>
            <select className="form-input" {...register("saleId")}>
              <option value="">-- Chọn Nhân viên Sale --</option>
              {sales.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.saleId && <p className="form-error">{errors.saleId.message}</p>}
          </div>

          <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.push("/admin/schools")}
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
              {isLoading ? "Đang xử lý..." : "Lưu Trường học"}
            </button>
          </div>
        </form>
      </div>

      <ExcelImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        type="schools"
        title="Import Danh sách Trường học từ Excel"
      />
    </>
  );
}
