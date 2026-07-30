"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createItem, createOtherInvestment } from "@/app/actions/item";
import { FileSpreadsheet, Laptop, Coins, ArrowLeft, Check } from "lucide-react";
import ExcelImportModal from "@/components/ExcelImportModal";
import CurrencyInput from "@/components/CurrencyInput";
import { toast } from "@/components/Toast";

const itemSchema = z.object({
  name: z.string().min(1, "Tên thiết bị không được để trống"),
  specifications: z.string().optional(),
  accessories: z.string().optional(),
  unit: z.string().min(1, "Đơn vị tính"),
  standardPrice: z.string().min(1, "Đơn giá chuẩn"),
});

const invSchema = z.object({
  name: z.string().min(1, "Tên hạng mục không được để trống"),
  description: z.string().min(1, "Mô tả chi tiết"),
  unit: z.string().min(1, "Đơn vị tính"),
  standardPrice: z.string().min(1, "Đơn giá chuẩn"),
});

const AVAILABLE_PROJECTS = ["IPRO", "ICLASS", "IGEN", "ILINK"];

export default function NewItemForm({ type }: { type: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>(["IPRO"]);

  const formItem = useForm<z.infer<typeof itemSchema>>({
    resolver: zodResolver(itemSchema),
  });

  const formInv = useForm<z.infer<typeof invSchema>>({
    resolver: zodResolver(invSchema),
  });

  const toggleProject = (pKey: string) => {
    if (selectedProjects.includes(pKey)) {
      if (selectedProjects.length > 1) {
        setSelectedProjects(selectedProjects.filter(p => p !== pKey));
      }
    } else {
      setSelectedProjects([...selectedProjects, pKey]);
    }
  };

  const onSubmitItem = async (data: any) => {
    setIsLoading(true);
    setError("");
    const res = await createItem({
      ...data,
      projectName: selectedProjects.join(", ") || "IPRO",
    });
    if (res.success) {
      toast.success("Tạo Thiết bị mới thành công!");
      router.refresh();
      router.push("/admin/items");
    } else {
      setError(res.message);
      setIsLoading(false);
    }
  };

  const onSubmitInv = async (data: any) => {
    setIsLoading(true);
    setError("");
    const res = await createOtherInvestment(data);
    if (res.success) {
      toast.success("Tạo Hạng mục Đầu tư khác thành công!");
      router.refresh();
      router.push("/admin/investments");
    } else {
      setError(res.message);
      setIsLoading(false);
    }
  };

  const isInvestment = type === "investments";
  const backLink = isInvestment ? "/admin/investments" : "/admin/items";

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <Link
          href={backLink}
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
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: isInvestment ? "rgba(245, 158, 11, 0.15)" : "rgba(56, 189, 248, 0.15)", border: `1px solid ${isInvestment ? "#f59e0b" : "#38bdf8"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isInvestment ? <Coins size={20} style={{ color: "#fbbf24" }} /> : <Laptop size={20} style={{ color: "#38bdf8" }} />}
          </div>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff" }}>
              {isInvestment ? "Thêm Hạng mục Đầu tư khác" : "Thêm Thiết bị mới"}
            </h1>
            <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
              {isInvestment ? "Tạo hạng mục dịch vụ, đào tạo hoặc đầu tư đi kèm" : "Khai báo cấu hình, dự án áp dụng và đơn giá chuẩn cho thiết bị"}
            </p>
          </div>
        </div>

        {error && <div className="alert-error" style={{ marginBottom: "1.25rem" }}>{error}</div>}

        {isInvestment ? (
          <form onSubmit={formInv.handleSubmit(onSubmitInv)}>
            <div className="form-group">
              <label className="form-label">Tên Hạng mục <span style={{ color: "var(--error)" }}>*</span></label>
              <input type="text" className="form-input" placeholder="VD: Máy lạnh, bàn ghế, trang trí..." {...formInv.register("name")} />
              {formInv.formState.errors.name && <p className="form-error">{formInv.formState.errors.name.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Mô tả chi tiết <span style={{ color: "var(--error)" }}>*</span></label>
              <textarea className="form-input" rows={4} placeholder="VD: Máy lạnh, công suất 2 HP, Inverter..." {...formInv.register("description")} />
              {formInv.formState.errors.description && <p className="form-error">{formInv.formState.errors.description.message}</p>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Đơn vị tính <span style={{ color: "var(--error)" }}>*</span></label>
                <input type="text" className="form-input" placeholder="VD: Gói, Chuyến..." defaultValue="Gói" {...formInv.register("unit")} />
                {formInv.formState.errors.unit && <p className="form-error">{formInv.formState.errors.unit.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Đơn giá chuẩn (VNĐ) <span style={{ color: "var(--error)" }}>*</span></label>
                <CurrencyInput
                  placeholder="VD: 8,000,000"
                  value={formInv.watch("standardPrice")}
                  onChange={(val) => formInv.setValue("standardPrice", val, { shouldValidate: true })}
                />
                {formInv.formState.errors.standardPrice && <p className="form-error">{formInv.formState.errors.standardPrice.message}</p>}
              </div>
            </div>

            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
              <button type="button" className="btn btn-secondary" onClick={() => router.push("/admin/investments")} style={{ flex: 1, justifyContent: "center" }}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ flex: 1.5, justifyContent: "center" }}>
                {isLoading ? "Đang xử lý..." : "Lưu Hạng mục"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={formItem.handleSubmit(onSubmitItem)}>
            {/* Multi-Project Selection */}
            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
              <label className="form-label" style={{ display: "block", marginBottom: "0.5rem" }}>
                Dự án áp dụng <span style={{ color: "var(--error)" }}>*</span> (Có thể chọn nhiều dự án)
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                {AVAILABLE_PROJECTS.map(pKey => {
                  const isChecked = selectedProjects.includes(pKey);
                  return (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => toggleProject(pKey)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.45rem 0.9rem",
                        borderRadius: "8px",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        border: isChecked ? "1.5px solid #38bdf8" : "1.5px solid #334155",
                        background: isChecked ? "rgba(56, 189, 248, 0.15)" : "rgba(15, 23, 42, 0.5)",
                        color: isChecked ? "#38bdf8" : "#94a3b8",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "4px",
                        border: `1px solid ${isChecked ? "#38bdf8" : "#64748b"}`,
                        background: isChecked ? "#38bdf8" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#0f172a"
                      }}>
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>
                      {pKey}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tên Thiết bị <span style={{ color: "var(--error)" }}>*</span></label>
              <input type="text" className="form-input" placeholder="VD: Máy tính để bàn Core i7" {...formItem.register("name")} />
              {formItem.formState.errors.name && <p className="form-error">{formItem.formState.errors.name.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Cấu hình chi tiết</label>
              <textarea className="form-input" rows={4} placeholder="VD: Core i7 13700, RAM 16GB, SSD 512GB..." {...formItem.register("specifications")} />
              {formItem.formState.errors.specifications && <p className="form-error">{formItem.formState.errors.specifications.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Linh kiện kèm theo</label>
              <textarea className="form-input" rows={2} placeholder="VD: Củ sạc, dây cáp, chuột..." {...formItem.register("accessories")} />
              {formItem.formState.errors.accessories && <p className="form-error">{formItem.formState.errors.accessories.message}</p>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Đơn vị tính <span style={{ color: "var(--error)" }}>*</span></label>
                <input type="text" className="form-input" placeholder="VD: Bộ, Chiếc, Máy..." defaultValue="Bộ" {...formItem.register("unit")} />
                {formItem.formState.errors.unit && <p className="form-error">{formItem.formState.errors.unit.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Đơn giá chuẩn (VNĐ) <span style={{ color: "var(--error)" }}>*</span></label>
                <CurrencyInput
                  placeholder="VD: 15,000,000"
                  value={formItem.watch("standardPrice")}
                  onChange={(val) => formItem.setValue("standardPrice", val, { shouldValidate: true })}
                />
                {formItem.formState.errors.standardPrice && <p className="form-error">{formItem.formState.errors.standardPrice.message}</p>}
              </div>
            </div>

            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
              <button type="button" className="btn btn-secondary" onClick={() => router.push("/admin/items")} style={{ flex: 1, justifyContent: "center" }}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ flex: 1.5, justifyContent: "center" }}>
                {isLoading ? "Đang xử lý..." : "Lưu Thiết bị"}
              </button>
            </div>
          </form>
        )}
      </div>

      <ExcelImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        type={isInvestment ? "investments" : "items"}
        title={isInvestment ? "Import Danh sách Hạng mục Đầu tư từ Excel" : "Import Danh sách Thiết bị từ Excel"}
      />
    </>
  );
}
