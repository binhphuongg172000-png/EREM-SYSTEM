"use client";

import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X, AlertTriangle, ShieldCheck } from "lucide-react";
import { importSchoolsBulk, getSaleNamesList } from "@/app/actions/school";
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
  const [salesList, setSalesList] = useState<Array<{ id: string; name: string; username: string }>>([]);
  const [importSummary, setImportSummary] = useState<{
    successCount: number;
    rejectedCount: number;
    rejectedList: Array<{ name: string; reason: string }>;
  } | null>(null);

  useEffect(() => {
    if (isOpen && type === "schools") {
      getSaleNamesList().then((list) => {
        setSalesList(list || []);
      });
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const handleReset = () => {
    setParsedData([]);
    setFileName("");
    setError("");
    setSuccessMessage("");
    setImportSummary(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // 1. Generate & Download Excel Template
  const handleDownloadTemplate = () => {
    let headers: any[] = [];
    let sampleFileName = "";

    if (type === "schools") {
      sampleFileName = "Mau_Import_Truong_Hoc.xlsx";
      headers = [
        {
          "TÊN TRƯỜNG": "THCS Nguyễn Ảnh Thủ",
          "ĐỊA CHỈ": "12/8 Bis, Phường Đông Hưng Thuận",
          "FULL NAME SALE": "Phạm Thị Ngọc Bích",
        },
        {
          "TÊN TRƯỜNG": "THCS Đồng Khởi",
          "ĐỊA CHỈ": "20 Thạch Lam, Phường Phú Thạnh",
          "FULL NAME SALE": "Cao Thị Phương Thanh",
        },
      ];
    } else if (type === "items") {
      sampleFileName = "Mau_Import_Thiet_Bi.xlsx";
      headers = [
        {
          "STT": 1,
          "Tên Thiết bị": "Bảng từ trắng 1,2x1,8m",
          "Dự án áp dụng": "IPRO, ICLASS",
          "Cấu hình chi tiết": "Mặt bảng bằng thép phủ sơn chống lóa Hàn Quốc",
          "Linh kiện kèm theo": "Khay để bút, nam châm từ",
          "Đơn vị tính": "Bộ",
          "Đơn giá chuẩn (VNĐ)": 1255000,
        },
        {
          "STT": 2,
          "Tên Thiết bị": "Máy tính để bàn Core i7",
          "Dự án áp dụng": "IPRO",
          "Cấu hình chi tiết": "RAM 16GB, SSD 512GB, Màn hình 24 inch",
          "Linh kiện kèm theo": "Bàn phím, chuột, dây nguồn",
          "Đơn vị tính": "Bộ",
          "Đơn giá chuẩn (VNĐ)": 15000000,
        },
        {
          "STT": 3,
          "Tên Thiết bị": "Tủ Sạc 36 Thiết Bị",
          "Dự án áp dụng": "IGEN, ILINK",
          "Cấu hình chi tiết": "Tủ sạc thông minh cho máy tính bảng/laptop",
          "Linh kiện kèm theo": "Dây cáp sạc USB-C, ổ khóa",
          "Đơn vị tính": "Bộ",
          "Đơn giá chuẩn (VNĐ)": 28500000,
        },
      ];
    } else if (type === "investments") {
      sampleFileName = "Mau_Import_Dau_Tu_Khac.xlsx";
      headers = [
        {
          "STT": 1,
          "Tên Hạng mục": "Gói Lắp đặt & Đi dây mạng",
          "Mô tả chi tiết": "Thi công hạ tầng mạng LAN và ổ cắm điện cho phòng máy",
          "Đơn vị tính": "Gói",
          "Đơn giá chuẩn (VNĐ)": 8000000,
        },
      ];
    }

    const worksheet = XLSX.utils.json_to_sheet(headers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Import_Template");
    XLSX.writeFile(workbook, sampleFileName);
  };

  // Helper to validate sale name
  const checkIsValidSale = (saleNameStr: string) => {
    if (!saleNameStr || !saleNameStr.trim()) return false;
    const target = saleNameStr.trim().toLowerCase();
    return salesList.some(
      s => s.name.trim().toLowerCase() === target || 
           s.username.trim().toLowerCase() === target
    );
  };

  // 2. Process Uploaded File
  const processFile = (file: File) => {
    setError("");
    setSuccessMessage("");
    setImportSummary(null);
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

        // Strict key getter with exact match priority
        const getVal = (row: Record<string, any>, keywords: string[]) => {
          const keys = Object.keys(row);
          for (const kw of keywords) {
            const match = keys.find(k => k.trim().toLowerCase() === kw.trim().toLowerCase());
            if (match && row[match] !== undefined && row[match] !== null) {
              const val = String(row[match]).trim();
              if (val) return val;
            }
          }
          for (const kw of keywords) {
            const match = keys.find(k => {
              const cleanK = k.trim().toLowerCase();
              const cleanKw = kw.trim().toLowerCase();
              return cleanK.startsWith(cleanKw) || cleanK.endsWith(cleanKw);
            });
            if (match && row[match] !== undefined && row[match] !== null) {
              const val = String(row[match]).trim();
              if (val) return val;
            }
          }
          return "";
        };

        const cleanData: any[] = [];
        rawJson.forEach((row) => {
          if (type === "schools") {
            const name = getVal(row, ["tên trường", "ten truong", "trường", "truong", "school name"]);
            const address = getVal(row, ["địa chỉ", "dia chi", "address"]);
            const saleName = getVal(row, ["full name sale", "fullname sale", "tên sale", "ten sale", "nv sale", "sale phụ trách", "sale"]);
            if (name) {
              const isValidSale = checkIsValidSale(saleName);
              cleanData.push({ name, address, saleName, isValidSale });
            }
          } else if (type === "items") {
            const name = getVal(row, ["tên thiết bị", "ten thiet bi", "thiết bị", "thiet bi"]);
            const projectName = getVal(row, ["dự án áp dụng", "dự án", "du an", "project name", "project"]) || "IPRO";
            const specifications = getVal(row, ["cấu hình chi tiết", "cấu hình", "cau hinh", "specifications", "thông số"]);
            const accessories = getVal(row, ["linh kiện kèm theo", "linh kiện", "linh kien", "accessories", "phụ kiện"]);
            const unit = getVal(row, ["đơn vị tính", "đơn vị", "dvt", "unit"]) || "Bộ";
            const priceStr = getVal(row, ["đơn giá chuẩn", "đơn giá", "don gia", "giá"]);
            const price = Number(priceStr.replace(/[^0-9.]/g, "")) || 0;
            if (name) cleanData.push({ name, projectName, specifications, accessories, unit, standardPrice: price });
          } else if (type === "investments") {
            const name = getVal(row, ["tên hạng mục", "ten hang muc", "hạng mục"]);
            const description = getVal(row, ["mô tả chi tiết", "mô tả", "mo ta", "description"]);
            const unit = getVal(row, ["đơn vị tính", "đơn vị", "dvt", "unit"]) || "Gói";
            const priceStr = getVal(row, ["đơn giá chuẩn", "đơn giá", "don gia", "giá"]);
            const price = Number(priceStr.replace(/[^0-9.]/g, "")) || 0;
            if (name) cleanData.push({ name, description, unit, standardPrice: price });
          }
        });

        if (cleanData.length === 0) {
          setError("Không tìm thấy dòng hợp lệ nào trong file. Vui lòng kiểm tra lại tên tiêu đề cột!");
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
    setSuccessMessage("");
    setImportSummary(null);

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
        if (type === "schools" && (res.rejectedCount !== undefined)) {
          setImportSummary({
            successCount: res.successCount,
            rejectedCount: res.rejectedCount,
            rejectedList: res.rejectedList || [],
          });
        } else {
          setSuccessMessage(`🎉 Đã thêm thành công ${res.count || res.successCount} bản ghi mới vào hệ thống!`);
          setTimeout(() => {
            handleClose();
            const targetUrl = type === "schools" 
              ? "/admin/schools" 
              : type === "items" 
              ? "/admin/items" 
              : "/admin/investments";
            window.location.href = targetUrl;
          }, 1200);
        }
      } else {
        setError(res?.message || "Lỗi nhập dữ liệu từ Excel");
      }
    } catch (err: any) {
      setError("Lỗi xử lý server");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate preview stats for schools
  const validSchoolsCount = type === "schools" ? parsedData.filter(r => r.isValidSale).length : parsedData.length;
  const invalidSchoolsCount = type === "schools" ? parsedData.filter(r => !r.isValidSale).length : 0;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(3, 7, 18, 0.85)",
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
          maxWidth: "780px",
          backgroundColor: "#131c31",
          border: "1px solid #2a3859",
          borderRadius: "1.25rem",
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
            onClick={handleClose}
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
        {!importSummary && (
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
        )}

        {/* SUMMARY RESULT VIEW (KẾT QUẢ IMPORT SAU KHI XÁC NHẬN) */}
        {importSummary ? (
          <div style={{ flex: 1, overflowY: "auto", marginBottom: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "1.25rem" }}>
              {/* Card Success */}
              <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1.5px solid rgba(16, 185, 129, 0.3)", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
                <div style={{ fontSize: "0.8rem", color: "#34d399", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}>
                  <ShieldCheck size={16} /> THÊM THÀNH CÔNG
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#ffffff", marginTop: "0.3rem" }}>
                  {importSummary.successCount} <span style={{ fontSize: "0.9rem", color: "#34d399" }}>trường</span>
                </div>
              </div>

              {/* Card Rejected */}
              <div style={{ background: "rgba(244, 63, 94, 0.1)", border: "1.5.px solid rgba(244, 63, 94, 0.3)", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
                <div style={{ fontSize: "0.8rem", color: "#fb7185", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}>
                  <AlertTriangle size={16} /> BỊ TỪ CHỐI
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#ffffff", marginTop: "0.3rem" }}>
                  {importSummary.rejectedCount} <span style={{ fontSize: "0.9rem", color: "#fb7185" }}>trường</span>
                </div>
              </div>
            </div>

            {/* Rejected List Details */}
            {importSummary.rejectedList.length > 0 && (
              <div style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(244, 63, 94, 0.25)", borderRadius: "12px", padding: "1rem" }}>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fb7185", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <AlertCircle size={16} /> Danh sách {importSummary.rejectedList.length} trường bị từ chối nhập:
                </h4>
                <div style={{ maxHeight: "180px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {importSummary.rejectedList.map((item, i) => (
                    <div key={i} style={{ background: "rgba(244, 63, 94, 0.08)", border: "1px solid rgba(244, 63, 94, 0.2)", borderRadius: "8px", padding: "0.6rem 0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.825rem" }}>
                      <strong style={{ color: "#ffffff" }}>{item.name}</strong>
                      <span style={{ color: "#fb7185", fontWeight: 600, fontSize: "0.78rem" }}>⚠️ {item.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
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
                padding: "1.75rem 1.5rem",
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
              <Upload style={{ color: "#38bdf8", margin: "0 auto 0.5rem auto" }} size={30} />
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
              <div style={{ flex: 1, overflowY: "auto", marginBottom: "1.25rem", maxHeight: "240px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#34d399" }}>
                    ✓ Đã kiểm tra {parsedData.length} dòng từ file Excel:
                  </span>
                  {type === "schools" && invalidSchoolsCount > 0 && (
                    <span style={{ fontSize: "0.78rem", color: "#fb7185", background: "rgba(244, 63, 94, 0.12)", border: "1px solid rgba(244, 63, 94, 0.3)", padding: "0.2rem 0.6rem", borderRadius: "6px", fontWeight: 700 }}>
                      ⚠️ {invalidSchoolsCount} dòng sẽ bị từ chối (Sai/Thiếu tên Sale)
                    </span>
                  )}
                </div>
                <div className="table-container">
                  <table className="table" style={{ fontSize: "0.825rem" }}>
                    <thead>
                      {type === "schools" && (
                        <tr>
                          <th>Tên Trường</th>
                          <th>Địa chỉ</th>
                          <th>Nhân viên Sale phụ trách</th>
                        </tr>
                      )}
                      {type === "items" && (
                        <tr>
                          <th style={{ width: "45px", textAlign: "center" }}>STT</th>
                          <th>Tên Thiết bị</th>
                          <th>Dự án</th>
                          <th>Cấu hình</th>
                          <th>Linh kiện</th>
                          <th>ĐVT</th>
                          <th>Đơn giá (đ)</th>
                        </tr>
                      )}
                      {type === "investments" && (
                        <tr>
                          <th style={{ width: "45px", textAlign: "center" }}>STT</th>
                          <th>Tên Hạng mục</th>
                          <th>Mô tả</th>
                          <th>ĐVT</th>
                          <th>Đơn giá (đ)</th>
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {parsedData.map((row, idx) => (
                        <tr key={idx} style={{ background: type === "schools" && !row.isValidSale ? "rgba(244, 63, 94, 0.06)" : undefined }}>
                          {type === "schools" && (
                            <>
                              <td style={{ fontWeight: 700 }}>{row.name}</td>
                              <td>{row.address || "-"}</td>
                              <td>
                                {row.isValidSale ? (
                                  <span style={{ color: "#34d399", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                                    ✓ {row.saleName}
                                  </span>
                                ) : (
                                  <span style={{ color: "#fb7185", fontWeight: 700, background: "rgba(244, 63, 94, 0.15)", border: "1px solid rgba(244, 63, 94, 0.3)", padding: "0.2rem 0.55rem", borderRadius: "6px", fontSize: "0.78rem" }}>
                                    ⚠️ {row.saleName ? `"${row.saleName}" (Tên Sale không tồn tại)` : "Chưa nhập tên Sale"}
                                  </span>
                                )}
                              </td>
                            </>
                          )}
                          {type === "items" && (
                            <>
                              <td style={{ textAlign: "center", fontWeight: 700, color: "#94a3b8" }}>{idx + 1}</td>
                              <td style={{ fontWeight: 700 }}>{row.name}</td>
                              <td>
                                <span style={{ fontSize: "0.72rem", fontWeight: 800, padding: "0.15rem 0.45rem", borderRadius: "5px", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
                                  {row.projectName || "IPRO"}
                                </span>
                              </td>
                              <td>{row.specifications || "-"}</td>
                              <td>{row.accessories || "-"}</td>
                              <td>{row.unit || "Bộ"}</td>
                              <td style={{ fontWeight: 700 }}>{Number(row.standardPrice).toLocaleString()} đ</td>
                            </>
                          )}
                          {type === "investments" && (
                            <>
                              <td style={{ textAlign: "center", fontWeight: 700, color: "#94a3b8" }}>{idx + 1}</td>
                              <td style={{ fontWeight: 700 }}>{row.name}</td>
                              <td>{row.description || "-"}</td>
                              <td>{row.unit || "Gói"}</td>
                              <td style={{ fontWeight: 700 }}>{Number(row.standardPrice).toLocaleString()} đ</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "auto" }}>
          {importSummary ? (
            <button 
              onClick={() => {
                handleClose();
                const targetUrl = type === "schools" 
                  ? "/admin/schools" 
                  : type === "items" 
                  ? "/admin/items" 
                  : "/admin/investments";
                window.location.href = targetUrl;
              }} 
              className="btn btn-primary"
            >
              Hoàn thành &amp; Đóng
            </button>
          ) : (
            <>
              <button onClick={handleClose} className="btn btn-secondary" disabled={isLoading}>
                Hủy
              </button>
              <button
                onClick={handleConfirmImport}
                className="btn btn-primary"
                disabled={parsedData.length === 0 || isLoading || (type === "schools" && validSchoolsCount === 0)}
              >
                {isLoading 
                  ? "Đang lưu..." 
                  : (type === "schools" && invalidSchoolsCount > 0)
                    ? `Xác nhận Import ${validSchoolsCount} bản ghi hợp lệ (${invalidSchoolsCount} bị từ chối)`
                    : `Xác nhận Import ${parsedData.length} bản ghi`
                }
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
