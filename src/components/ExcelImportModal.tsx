"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X } from "lucide-react";
import { importSchoolsBulk } from "@/app/actions/school";
import { importItemsBulk, importOtherInvestmentsBulk } from "@/app/actions/item";

export type ImportType = "schools" | "items" | "investments";

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ImportType;
  title: string;
}

export default function ExcelImportModal({
  isOpen,
  onClose,
  type,
  title,
}: ExcelImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  if (!isOpen) return null;

  // 1. Generate & Download Excel Template
  const handleDownloadTemplate = () => {
    let headers: any[] = [];
    let sampleFileName = "";

    if (type === "schools") {
      sampleFileName = "Mau_Import_Truong_Hoc.xlsx";
      headers = [
        {
          "Tên Trường": "THCS Nguyễn Trãi",
          "Địa chỉ": "Quận Thanh Xuân, Hà Nội",
          "Tên Sale": "Sale 1",
        },
        {
          "Tên Trường": "THPT Chuyên Hà Nội - Amsterdam",
          "Địa chỉ": "Quận Cầu Giấy, Hà Nội",
          "Tên Sale": "Sale 1",
        },
      ];
    } else if (type === "items") {
      sampleFileName = "Mau_Import_Thiet_Bi.xlsx";
      headers = [
        {
          "Tên Thiết bị": "Máy tính để bàn Core i7",
          "Cấu hình chi tiết": "RAM 16GB, SSD 512GB, Màn hình 24 inch",
          "Linh kiện kèm theo": "Bàn phím, chuột, dây nguồn",
          "Đơn vị tính": "Bộ",
          "Đơn giá chuẩn (VNĐ)": 15000000,
        },
        {
          "Tên Thiết bị": "Máy chiếu Full HD Epson",
          "Cấu hình chi tiết": "Độ phân giải Full HD 1080p, 3600 Lumens",
          "Linh kiện kèm theo": "Dây nguồn, cáp HDMI, giá treo",
          "Đơn vị tính": "Chiếc",
          "Đơn giá chuẩn (VNĐ)": 12500000,
        },
      ];
    } else if (type === "investments") {
      sampleFileName = "Mau_Import_Dau_Tu_Khac.xlsx";
      headers = [
        {
          "Tên Hạng mục": "Gói Lắp đặt & Đi dây mạng",
          "Mô tả chi tiết": "Thi công hạ tầng mạng LAN và ổ cắm điện cho phòng máy",
          "Đơn vị tính": "Gói",
          "Đơn giá chuẩn (VNĐ)": 8000000,
        },
        {
          "Tên Hạng mục": "Chuyến Vận chuyển & Bàn giao",
          "Mô tả chi tiết": "Vận chuyển thiết bị tận nơi và hỗ trợ nghiệm thu",
          "Đơn vị tính": "Chuyến",
          "Đơn giá chuẩn (VNĐ)": 3000000,
        },
      ];
    }

    const worksheet = XLSX.utils.json_to_sheet(headers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Import_Template");
    XLSX.writeFile(workbook, sampleFileName);
  };

  // 2. Process Uploaded File
  const processFile = (file: File) => {
    setError("");
    setSuccessMessage("");
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!rawJson || rawJson.length === 0) {
          setError("File Excel không có dữ liệu!");
          setParsedData([]);
          return;
        }

        // Map raw data based on type
        const cleanData: any[] = [];
        rawJson.forEach((row) => {
          if (type === "schools") {
            const name = row["Tên Trường"] || row["Tên trường"] || row["name"];
            const address = row["Địa chỉ"] || row["address"] || "";
            const saleName = row["Tên Sale"] || row["sale"] || "";
            if (name) cleanData.push({ name: String(name).trim(), address: String(address).trim(), saleName: String(saleName).trim() });
          } else if (type === "items") {
            const name = row["Tên Thiết bị"] || row["Tên thiết bị"] || row["name"];
            const specifications = row["Cấu hình chi tiết"] || row["Cấu hình"] || row["specifications"] || "";
            const accessories = row["Linh kiện kèm theo"] || row["Linh kiện"] || row["accessories"] || "";
            const unit = row["Đơn vị tính"] || row["ĐVT"] || row["unit"] || "Bộ";
            const price = row["Đơn giá chuẩn (VNĐ)"] || row["Đơn giá"] || row["price"] || 0;
            if (name) cleanData.push({ name: String(name).trim(), specifications: String(specifications).trim(), accessories: String(accessories).trim(), unit: String(unit).trim(), standardPrice: Number(price) || 0 });
          } else if (type === "investments") {
            const name = row["Tên Hạng mục"] || row["Tên hạng mục"] || row["name"];
            const description = row["Mô tả chi tiết"] || row["Mô tả"] || row["description"] || "";
            const unit = row["Đơn vị tính"] || row["ĐVT"] || row["unit"] || "Gói";
            const price = row["Đơn giá chuẩn (VNĐ)"] || row["Đơn giá"] || row["price"] || 0;
            if (name) cleanData.push({ name: String(name).trim(), description: String(description).trim(), unit: String(unit).trim(), standardPrice: Number(price) || 0 });
          }
        });

        if (cleanData.length === 0) {
          setError("Không tìm thấy dòng hợp lệ nào trong file. Vui lòng kiểm tra lại cấu trúc cột!");
        } else {
          setParsedData(cleanData);
        }
      } catch (err: any) {
        setError("Không thể đọc file Excel. Vui lòng đảm bảo file hợp lệ!");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // 3. Confirm Import to DB
  const handleConfirmImport = async () => {
    if (parsedData.length === 0) return;
    setIsLoading(true);
    setError("");

    try {
      let res: any;
      if (type === "schools") {
        res = await importSchoolsBulk(parsedData);
      } else if (type === "items") {
        res = await importItemsBulk(parsedData);
      } else if (type === "investments") {
        res = await importOtherInvestmentsBulk(parsedData);
      }

      if (res && res.success) {
        setSuccessMessage(`🎉 Đã thêm thành công ${res.count} bản ghi mới vào hệ thống!`);
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1200);
      } else {
        setError(res?.message || "Lỗi nhập dữ liệu từ Excel");
      }
    } catch (err: any) {
      setError("Lỗi xử lý server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(3, 7, 18, 0.8)",
        backdropFilter: "blur(8px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "720px",
          backgroundColor: "#131c31",
          border: "1px solid #2a3859",
          borderRadius: "1rem",
          boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
          padding: "1.75rem",
          position: "relative",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FileSpreadsheet style={{ color: "#38bdf8" }} size={22} />
              {title}
            </h2>
            <span style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>
              Hỗ trợ nhập hàng loạt dữ liệu từ file Excel (.xlsx, .xls) hoặc CSV
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#cbd5e1",
              cursor: "pointer",
              padding: "0.35rem",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Bar: Download Sample */}
        <div style={{ padding: "0.85rem 1.1rem", backgroundColor: "#0f172a", borderRadius: "0.5rem", border: "1px solid #2a3859", marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "#ffffff", fontWeight: 600 }}>
            Chưa có file mẫu chuẩn? Tải file mẫu tại đây:
          </span>
          <button
            onClick={handleDownloadTemplate}
            className="btn btn-secondary"
            style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem", backgroundColor: "#1e293b", borderColor: "#38bdf8", color: "#38bdf8", fontWeight: 700 }}
          >
            <Download size={14} /> Tải File Mẫu (.xlsx)
          </button>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragOver ? "#38bdf8" : "#334155"}`,
            backgroundColor: isDragOver ? "rgba(56, 189, 248, 0.1)" : "#0d1527",
            borderRadius: "0.75rem",
            padding: "2rem 1.5rem",
            textAlign: "center",
            cursor: "pointer",
            marginBottom: "1.25rem",
            transition: "all 0.2s ease",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <Upload style={{ color: "#38bdf8", margin: "0 auto 0.75rem auto" }} size={32} />
          <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.25rem" }}>
            Kéo thả file Excel vào đây hoặc <span style={{ color: "#38bdf8", textDecoration: "underline" }}>bấm chọn file từ máy</span>
          </p>
          <span style={{ fontSize: "0.775rem", color: "#94a3b8" }}>
            {fileName ? `File đã chọn: ${fileName}` : "Chấp nhận định dạng: .xlsx, .xls, .csv"}
          </span>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div style={{ padding: "0.75rem 1rem", backgroundColor: "rgba(244, 63, 94, 0.15)", border: "1px solid #f43f5e", borderRadius: "0.5rem", color: "#fb7185", fontSize: "0.85rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {successMessage && (
          <div style={{ padding: "0.75rem 1rem", backgroundColor: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", borderRadius: "0.5rem", color: "#34d399", fontSize: "0.875rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle2 size={18} /> {successMessage}
          </div>
        )}

        {/* Preview Data Table */}
        {parsedData.length > 0 && (
          <div style={{ flex: 1, overflowY: "auto", marginBottom: "1.25rem", maxHeight: "220px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#34d399" }}>
                ✓ Đã trích xuất {parsedData.length} bản ghi từ file Excel:
              </span>
            </div>
            <div className="table-container">
              <table className="table" style={{ fontSize: "0.825rem" }}>
                <thead>
                  {type === "schools" && (
                    <tr>
                      <th>Tên Trường</th>
                      <th>Địa chỉ</th>
                      <th>Gán Sale</th>
                    </tr>
                  )}
                  {type === "items" && (
                    <tr>
                      <th>Tên Thiết bị</th>
                      <th>Cấu hình</th>
                      <th>Linh kiện</th>
                      <th>ĐVT</th>
                      <th>Đơn giá (đ)</th>
                    </tr>
                  )}
                  {type === "investments" && (
                    <tr>
                      <th>Tên Hạng mục</th>
                      <th>Mô tả</th>
                      <th>ĐVT</th>
                      <th>Đơn giá (đ)</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {parsedData.map((row, idx) => (
                    <tr key={idx}>
                      {type === "schools" && (
                        <>
                          <td style={{ fontWeight: 700 }}>{row.name}</td>
                          <td>{row.address || "-"}</td>
                          <td>{row.saleName ? row.saleName : <span style={{ color: "#f43f5e" }}>Thiếu tên Sale</span>}</td>
                        </>
                      )}
                      {type === "items" && (
                        <>
                          <td style={{ fontWeight: 700 }}>{row.name}</td>
                          <td>{row.specifications}</td>
                          <td>{row.accessories || "-"}</td>
                          <td>{row.unit || "Bộ"}</td>
                          <td style={{ fontWeight: 700 }}>{Number(row.standardPrice).toLocaleString()}</td>
                        </>
                      )}
                      {type === "investments" && (
                        <>
                          <td style={{ fontWeight: 700 }}>{row.name}</td>
                          <td>{row.description}</td>
                          <td>{row.unit}</td>
                          <td style={{ fontWeight: 700 }}>{Number(row.standardPrice).toLocaleString()}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "auto" }}>
          <button onClick={onClose} className="btn btn-secondary" disabled={isLoading}>
            Hủy
          </button>
          <button
            onClick={handleConfirmImport}
            className="btn btn-primary"
            disabled={parsedData.length === 0 || isLoading}
          >
            {isLoading ? "Đang lưu..." : `Xác nhận Import ${parsedData.length} bản ghi`}
          </button>
        </div>
      </div>
    </div>
  );
}
