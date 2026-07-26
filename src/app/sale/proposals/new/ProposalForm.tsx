"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { createProposal } from "@/app/actions/proposal-sale";
import { AlertCircle, AlertTriangle, RefreshCcw, Search, Plus, Trash2, Package, Building2, ChevronDown, CheckCircle2, FileText, TrendingUp, GraduationCap, DoorOpen } from "lucide-react";
import CurrencyInput from "@/components/CurrencyInput";

type ProposalItemInput = {
  name: string;
  specifications: string;
  quantity: number;
  price: number;
};

type ProposalInvestmentInput = {
  name: string;
  description: string;
  quantity: number;
  price: number;
};

type School = { 
  id: string; 
  name: string; 
  address: string;
  principalName: string | null;
  contractNumber: string | null;
  investedClassrooms: number;
  oldStudents: number;
  newStudents: number;
  isLocked: boolean;
  latestProposal: {
    id: string;
    updatedAt: string;
    items: ProposalItemInput[];
    investments: ProposalInvestmentInput[];
  } | null;
};

type CatalogItem = { id: string; name: string; specifications: string; standardPrice: number; unit: string };
type CatalogInvestment = { id: string; name: string; description: string; standardPrice: number; unit: string };

type ProposalItem = { tempId: number; name: string; specifications: string; quantity: number; price: number; type: "ITEM" | "INVESTMENT"; unit: string };

export default function ProposalForm({
  schools,
  catalogItems,
  catalogInvestments,
  initialSchoolId = ""
}: {
  schools: School[],
  catalogItems: CatalogItem[],
  catalogInvestments: CatalogInvestment[],
  initialSchoolId?: string
}) {
  const router = useRouter();
  const schoolSearchRef = useRef<HTMLDivElement>(null);
  const itemSearchRef = useRef<HTMLDivElement>(null);
  
  // States
  const [selectedSchoolId, setSelectedSchoolId] = useState(initialSchoolId);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [isItemDropdownOpen, setIsItemDropdownOpen] = useState(false);
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialHash, setInitialHash] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [schoolFilter, setSchoolFilter] = useState<"ALL" | "NONE" | "INIT" | "LOCKED" | "COMPLETED">("ALL");

  const getSchoolStatus = (s: any) => {
    if (!s.latestProposal) return { type: "NONE", label: "Chưa có dự trù", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" };
    if (s.latestProposal.status === "COMPLETED") return { type: "COMPLETED", label: "Đã hoàn thành", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)" };
    if (s.isLocked || s.latestProposal.status === "APPROVED") return { type: "LOCKED", label: "Đang thực hiện", color: "#f43f5e", bg: "rgba(244, 63, 94, 0.15)" };
    return { type: "INIT", label: "Khởi tạo", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" };
  };

  const filteredSchools = schools.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.address.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    const st = getSchoolStatus(s).type;
    if (schoolFilter !== "ALL" && st !== schoolFilter) return false;
    return true;
  });

  const [schoolDetails, setSchoolDetails] = useState<{
    investedClassrooms: number | string;
    oldStudents: number | string;
    newStudents: number | string;
  }>({
    investedClassrooms: "",
    oldStudents: "",
    newStudents: "",
  });

  // Constants
  const RATIO = 105;
  const BUDGET_PER_RATIO = 100000000;

  const selectedSchool = schools.find(s => s.id === selectedSchoolId);
  const allocatedBudget = selectedSchoolId ? Math.floor(((Number(schoolDetails.newStudents) || 0) * BUDGET_PER_RATIO) / RATIO) : 0;
  const totalInvested = items.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
  const delta = allocatedBudget - totalInvested;
  const budgetUsagePercent = allocatedBudget > 0 ? Math.min((totalInvested / allocatedBudget) * 100, 100) : 0;

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (schoolSearchRef.current && !schoolSearchRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (itemSearchRef.current && !itemSearchRef.current.contains(e.target as Node)) {
        setIsItemDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load school data when selected
  useEffect(() => {
    if (selectedSchool) {
      const details = {
        investedClassrooms: selectedSchool.investedClassrooms || "",
        oldStudents: selectedSchool.oldStudents || "",
        newStudents: selectedSchool.newStudents || "",
      };
      
      let initialItems: ProposalItem[] = [];
      if (selectedSchool.latestProposal) {
        let tempIdCounter = Date.now();
        const itemMap = new Map<string, any>();
        selectedSchool.latestProposal.items.forEach(i => {
          if (itemMap.has(i.name)) {
            itemMap.get(i.name).quantity += Number(i.quantity);
          } else {
            itemMap.set(i.name, {
              tempId: tempIdCounter++,
              name: i.name,
              specifications: i.specifications,
              quantity: Number(i.quantity),
              price: Number(i.price),
              type: "ITEM" as const,
              unit: (i as any).unit || "Bộ"
            });
          }
        });
        
        const invMap = new Map<string, any>();
        selectedSchool.latestProposal.investments.forEach(inv => {
          if (invMap.has(inv.name)) {
            invMap.get(inv.name).quantity += Number(inv.quantity);
          } else {
            invMap.set(inv.name, {
              tempId: tempIdCounter++,
              name: inv.name,
              specifications: inv.description,
              quantity: Number(inv.quantity),
              price: Number(inv.price),
              type: "INVESTMENT" as const,
              unit: (inv as any).unit || "Cái"
            });
          }
        });

        const mappedItems = Array.from(itemMap.values());
        const mappedInvestments = Array.from(invMap.values());
        initialItems = [...mappedItems, ...mappedInvestments];
      }

      setSchoolDetails(details);
      setItems(initialItems);
      
      const semanticHash = JSON.stringify({
        details,
        items: initialItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price }))
      });
      setInitialHash(semanticHash);
      setSearchQuery(`${selectedSchool.name}`);
    } else {
      setSchoolDetails({ investedClassrooms: "", oldStudents: "", newStudents: "" });
      setItems([]);
      setInitialHash("");
    }
  }, [selectedSchoolId, schools]);

  const currentHash = useMemo(() => {
    return JSON.stringify({
      details: schoolDetails,
      items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price }))
    });
  }, [schoolDetails, items]);

  const isDirty = selectedSchoolId && currentHash !== initialHash;

  const addItemByValue = (val: string) => {
    if (!val) return;
    const isItem = val.startsWith("ITEM_");
    const id = val.split("_")[1];

    if (isItem) {
      const item = catalogItems.find(i => i.id === id);
      if (item) {
        setItems(prev => {
          const existing = prev.find(i => i.type === "ITEM" && i.name === item.name);
          if (existing) {
            return prev.map(i => i.tempId === existing.tempId ? { ...i, quantity: i.quantity + 1 } : i);
          }
          return [...prev, {
            tempId: Date.now(),
            type: "ITEM",
            name: item.name,
            specifications: item.specifications,
            quantity: 1,
            price: Number(item.standardPrice),
            unit: item.unit || "Bộ"
          }];
        });
      }
    } else {
      const inv = catalogInvestments.find(i => i.id === id);
      if (inv) {
        setItems(prev => {
          const existing = prev.find(i => i.type === "INVESTMENT" && i.name === inv.name);
          if (existing) {
            return prev.map(i => i.tempId === existing.tempId ? { ...i, quantity: i.quantity + 1 } : i);
          }
          return [...prev, {
            tempId: Date.now() + 1,
            type: "INVESTMENT",
            name: inv.name,
            specifications: inv.description,
            quantity: 1,
            price: Number(inv.standardPrice),
            unit: inv.unit
          }];
        });
      }
    }
  };

  const updateItemQuantity = (tempId: number, q: number) => {
    setItems(items.map(i => i.tempId === tempId ? { ...i, quantity: q } : i));
  };
  
  const updateItemPrice = (tempId: number, p: number) => {
    setItems(items.map(i => i.tempId === tempId ? { ...i, price: p } : i));
  };

  const removeItem = (tempId: number) => {
    setItems(items.filter(i => i.tempId !== tempId));
  };

  const confirmClearData = () => {
    setItems([]);
    if (selectedSchool) {
      setSchoolDetails({
        investedClassrooms: "",
        oldStudents: "",
        newStudents: "",
      });
    }
    setShowClearConfirm(false);
  };

  const handleClearData = () => {
    setShowClearConfirm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchoolId) return alert("Vui lòng chọn trường");
    if (selectedSchool?.isLocked) return alert("Trường này đã bị khóa!");
    if (items.length === 0) return alert("Vui lòng chọn ít nhất một thiết bị hoặc hạng mục đầu tư!");

    setIsSubmitting(true);
    const data = {
      schoolId: selectedSchoolId,
      schoolDetails,
      allocatedBudget,
      investedBudget: totalInvested,
      items: items.filter(i => i.type === "ITEM"),
      investments: items.filter(i => i.type === "INVESTMENT")
    };

    const res = await createProposal(data);
    if (res.success) {
      setSubmitSuccess(true);
      setTimeout(() => {
        router.push("/sale/proposals");
        router.refresh();
      }, 1200);
    } else {
      alert("Lỗi: " + res.message);
      setIsSubmitting(false);
    }
  };

  const itemEquipmentCount = items.filter(i => i.type === "ITEM").length;
  const itemInvestmentCount = items.filter(i => i.type === "INVESTMENT").length;

  // Success overlay
  if (submitSuccess) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "60vh", animation: "fadeIn 0.3s ease"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.5rem", animation: "scaleIn 0.4s ease",
            boxShadow: "0 0 40px rgba(16, 185, 129, 0.3)"
          }}>
            <CheckCircle2 size={40} color="#fff" />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Xuất dự trù thành công!</h2>
          <p style={{ color: "#94a3b8" }}>Đang chuyển hướng về danh sách dự trù...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        
        .proposal-card {
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6));
          border: 1px solid rgba(51, 65, 85, 0.5);
          border-radius: 12px;
          padding: 1.15rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .proposal-card:hover { border-color: rgba(56, 189, 248, 0.2); }
        
        .section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 0.85rem;
          color: #f1f5f9;
        }
        .section-title .icon-wrap {
          width: 30px; height: 30px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .input-with-icon .search-icon {
          position: absolute;
          left: 0.75rem;
          color: #64748b;
          pointer-events: none;
          z-index: 2;
        }
        
        /* Core form styles */
        .form-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 8px;
          color: #f8fafc;
          outline: none;
          transition: all 0.3s ease;
          font-family: inherit;
          font-size: 0.85rem;
        }
        .form-input:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
          background: #1e293b;
        }
        .form-input:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .input-with-icon .form-input {
          padding-left: 2.35rem !important;
          border-radius: 8px !important;
          height: 38px;
        }
        
        /* Dropdown Lists - Solid Dark Background */
        .dropdown-list {
          position: absolute;
          top: calc(100% + 6px);
          left: 0; right: 0;
          background: #0d1424 !important;
          border: 1.5px solid #38bdf8 !important;
          border-radius: 10px;
          max-height: 320px;
          overflow-y: auto;
          z-index: 100;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.9);
          list-style: none;
          margin: 0;
          padding: 0.35rem;
          animation: slideDown 0.2s ease;
        }
        .dropdown-item {
          padding: 0.6rem 0.75rem;
          cursor: pointer;
          border-radius: 6px;
          border-bottom: 1px solid rgba(51, 65, 85, 0.3);
          transition: all 0.2s ease;
        }
        .dropdown-item:last-child {
          border-bottom: none;
        }
        .dropdown-item:hover {
          background: #1e293b;
        }
        
        .school-card-item:hover {
          background: rgba(30, 41, 59, 0.9) !important;
          border-color: #38bdf8 !important;
          transform: translateY(-2px);
        }
        
        .dropdown-group-label {
          padding: 0.4rem 0.75rem;
          font-size: 0.65rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        
        .stat-card {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(51, 65, 85, 0.4);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .stat-card .stat-icon {
          width: 42px; height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .item-row {
          display: grid; grid-template-columns: 1fr 90px 140px 140px 34px; gap: 0.85rem; align-items: center;
          padding: 0.75rem 0.85rem; background: rgba(30, 41, 59, 0.4); border: 1px solid #334155;
          border-radius: 10px; transition: all 0.2s ease;
        }
        .item-row:hover { background: rgba(30, 41, 59, 0.7); border-color: #475569; }
        
        .item-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        
        .remove-btn {
          width: 34px; height: 34px;
          border-radius: 8px;
          border: 1px solid rgba(244, 63, 94, 0.2);
          background: rgba(244, 63, 94, 0.1);
          color: #f43f5e;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 14px;
        }
        .remove-btn:hover:not(:disabled) {
          background: #f43f5e;
          color: #fff;
          border-color: #f43f5e;
        }
        .remove-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .budget-bar-track {
          height: 8px;
          background: rgba(51, 65, 85, 0.5);
          border-radius: 4px;
          overflow: hidden;
          margin: 1rem 0;
        }
        .budget-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }
        
        .submit-btn {
          width: 100%;
          padding: 1rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
          color: #fff;
        }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .submit-btn.primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
        }
        .submit-btn.primary:not(:disabled):hover {
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
          transform: translateY(-1px);
        }
        .submit-btn.secondary {
          background: transparent;
          border: 1px solid #334155;
          color: #94a3b8;
        }
        .submit-btn.secondary:not(:disabled):hover { border-color: #475569; color: #cbd5e1; }
        
        .alert-box {
          display: flex;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          margin-bottom: 1rem;
          font-size: 0.88rem;
          line-height: 1.5;
          animation: fadeIn 0.3s ease;
        }
        .alert-box.warning {
          background: rgba(234, 179, 8, 0.08);
          border: 1px solid rgba(234, 179, 8, 0.2);
          color: #fbbf24;
        }
        .alert-box.error {
          background: rgba(244, 63, 94, 0.08);
          border: 1px solid rgba(244, 63, 94, 0.2);
          color: #fb7185;
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          text-align: center;
          color: #475569;
        }
        .empty-state .empty-icon {
          width: 64px; height: 64px;
          border-radius: 16px;
          background: rgba(51, 65, 85, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }
      `}</style>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", animation: "fadeIn 0.4s ease" }}>
        
        {/* ROW 1: School Search & Proposal Overview Side by Side */}
        <div style={{ display: "grid", gridTemplateColumns: selectedSchool ? "1fr 280px" : "1fr", gap: "1.25rem", alignItems: "stretch" }}>
          
          {/* STEP 1: School Search */}
          <div className="proposal-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", margin: 0 }}>
            <div>
              <div className="section-title">
                <div className="icon-wrap" style={{ background: "linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(59, 130, 246, 0.2))" }}>
                  <Search size={18} color="#38bdf8" />
                </div>
                Tìm kiếm Trường học
              </div>
              
              <div className="search-wrapper" ref={schoolSearchRef} style={{ position: "relative", maxWidth: "420px" }}>
                <div className="input-with-icon">
                  <Search size={18} className="search-icon" />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Nhập tên trường hoặc địa chỉ để tìm..." 
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                      if (selectedSchoolId) setSelectedSchoolId("");
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                  />
                </div>
                {isDropdownOpen && (
                  <ul className="dropdown-list">
                    {filteredSchools.length > 0 ? filteredSchools.map(s => (
                      <li 
                        key={s.id} 
                        className="dropdown-item"
                        style={{ background: s.id === selectedSchoolId ? "rgba(56, 189, 248, 0.1)" : undefined }}
                        onClick={() => {
                          setSelectedSchoolId(s.id);
                          setSearchQuery(s.name);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div>
                            <div style={{ fontWeight: 600, color: "#f1f5f9", fontSize: "0.95rem" }}>
                              {s.name}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 2 }}>{s.address}</div>
                          </div>
                          {s.isLocked && (
                            <span style={{ fontSize: "0.7rem", padding: "3px 8px", borderRadius: 6, background: "rgba(244, 63, 94, 0.15)", color: "#f43f5e", fontWeight: 600 }}>Đang thực hiện</span>
                          )}
                        </div>
                      </li>
                    )) : (
                      <li style={{ padding: "1.5rem", textAlign: "center", color: "#64748b" }}>Không tìm thấy trường nào</li>
                    )}
                  </ul>
                )}
              </div>

              {/* School Info Section or Quick Select Grid */}
              {selectedSchool ? (
                <div style={{ marginTop: "1rem", animation: "fadeIn 0.3s ease" }}>
                  {/* Alerts */}
                  {selectedSchool.isLocked && (
                    <div className="alert-box error">
                      <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span><strong>Trường đang trong trạng thái "Đang thực hiện".</strong> Bạn có thể xem thông tin chi tiết nhưng <strong>không thể chỉnh sửa</strong> hoặc lưu bản dự trù mới.</span>
                    </div>
                  )}
                  {selectedSchool.latestProposal && !selectedSchool.isLocked && (
                    <div className="alert-box warning">
                      <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>Trường đã có bản dự trù trước đó (cập nhật {new Date(selectedSchool.latestProposal.updatedAt).toLocaleString("vi-VN")}). Dữ liệu cũ đã được load lại — Khi bấm lưu sẽ tạo ra một <strong>phiên bản dự trù mới</strong>.</span>
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", background: "rgba(30, 41, 59, 0.5)", padding: "0.85rem", borderRadius: "10px", border: "1px solid #334155" }}>
                    <div>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.35rem", fontWeight: 500 }}><GraduationCap size={14}/> HS Cũ</label>
                      <input type="number" className="form-input" disabled={selectedSchool.isLocked} style={{ width: "100%", padding: "0.5rem 0.75rem", background: "rgba(15,23,42,0.4)", borderRadius: "8px" }} 
                        value={schoolDetails.oldStudents} 
                        onChange={e => setSchoolDetails({...schoolDetails, oldStudents: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#38bdf8", marginBottom: "0.35rem", fontWeight: 500 }}><GraduationCap size={14}/> HS Mới <span style={{color:"#f43f5e"}}>*</span></label>
                      <input type="number" className="form-input" required disabled={selectedSchool.isLocked} style={{ width: "100%", padding: "0.5rem 0.75rem", background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.3)", borderRadius: "8px", color: "#38bdf8" }} 
                        value={schoolDetails.newStudents} 
                        onChange={e => setSchoolDetails({...schoolDetails, newStudents: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#a855f7", marginBottom: "0.35rem", fontWeight: 500 }}><DoorOpen size={14}/> Phòng ĐT</label>
                      <input type="number" className="form-input" disabled={selectedSchool.isLocked} style={{ width: "100%", padding: "0.5rem 0.75rem", background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "8px", color: "#a855f7" }} 
                        value={schoolDetails.investedClassrooms} 
                        onChange={e => setSchoolDetails({...schoolDetails, investedClassrooms: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: "1.25rem", animation: "fadeIn 0.3s ease" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Building2 size={13} color="#38bdf8" />
                      Danh sách trường được phân công ({filteredSchools.length})
                    </div>

                    {/* Filter Buttons */}
                    <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                      {[
                        { key: "ALL", label: `Tất cả (${schools.length})`, color: "#38bdf8" },
                        { key: "NONE", label: `Chưa có dự trù (${schools.filter(s => getSchoolStatus(s).type === "NONE").length})`, color: "#10b981" },
                        { key: "INIT", label: `Khởi tạo (${schools.filter(s => getSchoolStatus(s).type === "INIT").length})`, color: "#f59e0b" },
                        { key: "LOCKED", label: `Đang thực hiện (${schools.filter(s => getSchoolStatus(s).type === "LOCKED").length})`, color: "#f43f5e" },
                        { key: "COMPLETED", label: `Đã hoàn thành (${schools.filter(s => getSchoolStatus(s).type === "COMPLETED").length})`, color: "#38bdf8" },
                      ].map(btn => (
                        <button
                          key={btn.key}
                          type="button"
                          onClick={() => setSchoolFilter(btn.key as any)}
                          style={{
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            border: "1px solid",
                            borderColor: schoolFilter === btn.key ? btn.color : "#334155",
                            background: schoolFilter === btn.key ? `${btn.color}22` : "transparent",
                            color: schoolFilter === btn.key ? btn.color : "#94a3b8",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0.75rem" }}>
                    {filteredSchools.map(s => {
                      const stInfo = getSchoolStatus(s);
                      return (
                        <div 
                          key={s.id}
                          onClick={() => {
                            setSelectedSchoolId(s.id);
                            setSearchQuery(s.name);
                          }}
                          style={{
                            background: "rgba(15, 23, 42, 0.6)",
                            border: "1px solid #334155",
                            borderRadius: "10px",
                            padding: "0.75rem 0.85rem",
                            cursor: "pointer",
                            opacity: 1,
                            transition: "all 0.2s ease"
                          }}
                          className="school-card-item"
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                            <div style={{ fontWeight: 600, color: "#f1f5f9", fontSize: "0.85rem", lineHeight: 1.3 }}>{s.name}</div>
                            <span style={{ fontSize: "0.6rem", padding: "2px 6px", borderRadius: 4, background: stInfo.bg, color: stInfo.color, fontWeight: 700, flexShrink: 0 }}>
                              {stInfo.label}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>{s.address}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Live Preview (Equal Height to Left Card) */}
          {selectedSchool && (
            <div className="proposal-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", margin: 0, padding: "1rem" }}>
              <div>
                <div className="section-title" style={{ marginBottom: "0.75rem", fontSize: "0.9rem" }}>
                  <div className="icon-wrap" style={{ background: "linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))", width: 26, height: 26 }}>
                    <FileText size={15} color="#fbbf24" />
                  </div>
                  Tổng quan Dự trù
                </div>

                {/* Budget Bar */}
                <div style={{ background: "rgba(15, 23, 42, 0.5)", borderRadius: 10, padding: "0.75rem", marginBottom: "0.6rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.3rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Ngân sách được cấp</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#38bdf8" }}>
                      {allocatedBudget.toLocaleString()}đ
                    </span>
                  </div>
                  <div className="budget-bar-track" style={{ margin: "0.4rem 0" }}>
                    <div className="budget-bar-fill" style={{
                      width: `${budgetUsagePercent}%`,
                      background: budgetUsagePercent > 100 
                        ? "linear-gradient(90deg, #f43f5e, #e11d48)" 
                        : budgetUsagePercent > 80 
                          ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                          : "linear-gradient(90deg, #38bdf8, #3b82f6)"
                    }} />
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                    <span>Đã sử dụng {budgetUsagePercent.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Summary Numbers */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.6rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>Tổng đầu tư</span>
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#f1f5f9" }}>
                      {totalInvested.toLocaleString()}đ
                    </span>
                  </div>
                  
                  <div style={{ height: 1, background: "rgba(51, 65, 85, 0.5)" }} />
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, color: "#f1f5f9", fontSize: "0.78rem" }}>
                      {delta >= 0 ? "Còn dư" : "Vượt ngân sách"}
                    </span>
                    <span style={{ 
                      fontWeight: 700, fontSize: "1rem", 
                      color: delta >= 0 ? "#10b981" : "#f43f5e",
                    }}>
                      {delta >= 0 ? "+" : ""}{delta.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.5rem" }}>
                <button 
                  type="submit" 
                  className="submit-btn primary"
                  style={{ padding: "0.55rem", fontSize: "0.825rem", borderRadius: 8 }}
                  disabled={isSubmitting || !selectedSchoolId || selectedSchool?.isLocked || !isDirty || items.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      Xác nhận Xuất Dự trù
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className="submit-btn secondary"
                  style={{ padding: "0.5rem", fontSize: "0.775rem", borderRadius: 8 }}
                  onClick={handleClearData}
                  disabled={!selectedSchoolId || selectedSchool?.isLocked || (items.length === 0 && !schoolDetails.oldStudents && !schoolDetails.newStudents && !schoolDetails.investedClassrooms)}
                >
                  <RefreshCcw size={13} /> Làm sạch dữ liệu
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ROW 2: Items Search & Table (Full Width) */}
        {selectedSchool && (
          <div className="proposal-card" style={{ animation: "fadeIn 0.3s ease" }}>
            <div className="section-title">
              <div className="icon-wrap" style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))" }}>
                <Plus size={18} color="#10b981" />
              </div>
              Bổ sung Hạng mục
              {items.length > 0 && (
                <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "#64748b", fontWeight: 400 }}>
                  {itemEquipmentCount > 0 && <span style={{ color: "#38bdf8" }}>{itemEquipmentCount} thiết bị</span>}
                  {itemEquipmentCount > 0 && itemInvestmentCount > 0 && " · "}
                  {itemInvestmentCount > 0 && <span style={{ color: "#a855f7" }}>{itemInvestmentCount} đầu tư</span>}
                </span>
              )}
            </div>
            
            {/* Item Search */}
            <div className="search-wrapper" ref={itemSearchRef} style={{ marginBottom: "1rem", position: "relative" }}>
              <div className="input-with-icon">
                <Plus size={18} className="search-icon" />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Tìm thiết bị hoặc hạng mục đầu tư để thêm..." 
                  value={itemSearchQuery}
                  onChange={(e) => {
                    setItemSearchQuery(e.target.value);
                    setIsItemDropdownOpen(true);
                  }}
                  onFocus={() => setIsItemDropdownOpen(true)}
                  disabled={selectedSchool?.isLocked}
                />
              </div>
              {isItemDropdownOpen && !selectedSchool?.isLocked && (() => {
                const query = itemSearchQuery.toLowerCase();
                const filteredItems = catalogItems.filter(i => i.name.toLowerCase().includes(query));
                const filteredInvs = catalogInvestments.filter(i => i.name.toLowerCase().includes(query));
                const hasResults = filteredItems.length > 0 || filteredInvs.length > 0;
                
                return (
                  <ul className="dropdown-list">
                    {!hasResults ? (
                      <li style={{ padding: "1.5rem", textAlign: "center", color: "#64748b" }}>Không tìm thấy kết quả</li>
                    ) : (
                      <>
                        {filteredItems.length > 0 && (
                          <li className="dropdown-group-label" style={{ background: "rgba(56, 189, 248, 0.08)", color: "#38bdf8", borderBottom: "1px solid rgba(56, 189, 248, 0.2)", display: "flex", alignItems: "center", gap: "6px", textTransform: "none", fontSize: "0.75rem", padding: "0.45rem 0.75rem" }}>
                            <Package size={13} color="#38bdf8" />
                            <strong>Thiết bị</strong> ({filteredItems.length})
                          </li>
                        )}
                        {filteredItems.map(i => (
                          <li key={`ITEM_${i.id}`} className="dropdown-item" onClick={() => {
                            addItemByValue(`ITEM_${i.id}`);
                            setItemSearchQuery("");
                            setIsItemDropdownOpen(false);
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ flex: 1, paddingRight: "1rem" }}>
                                <div style={{ fontWeight: 600, color: "#f1f5f9", fontSize: "0.85rem", marginBottom: "2px" }}>{i.name}</div>
                                <div style={{ fontSize: "0.75rem", color: "#94a3b8", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{i.specifications}</div>
                              </div>
                              <div style={{ background: "rgba(56,189,248,0.1)", padding: "0.3rem 0.6rem", borderRadius: "6px", border: "1px solid rgba(56,189,248,0.2)", flexShrink: 0 }}>
                                <span style={{ fontSize: "0.85rem", color: "#38bdf8", fontWeight: 700, whiteSpace: "nowrap" }}>{Number(i.standardPrice).toLocaleString()}đ<span style={{ fontSize: "0.7rem", color: "#cbd5e1", fontWeight: 500 }}>/{i.unit || "Bộ"}</span></span>
                              </div>
                            </div>
                          </li>
                        ))}
                        {filteredInvs.length > 0 && (
                          <li className="dropdown-group-label" style={{ background: "rgba(168, 85, 247, 0.08)", color: "#a855f7", borderBottom: "1px solid rgba(168, 85, 247, 0.2)", display: "flex", alignItems: "center", gap: "6px", textTransform: "none", fontSize: "0.75rem", padding: "0.45rem 0.75rem" }}>
                            <Building2 size={13} color="#a855f7" />
                            <strong>Đầu tư khác</strong> ({filteredInvs.length})
                          </li>
                        )}
                        {filteredInvs.map(i => (
                          <li key={`INV_${i.id}`} className="dropdown-item" onClick={() => {
                            addItemByValue(`INV_${i.id}`);
                            setItemSearchQuery("");
                            setIsItemDropdownOpen(false);
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ flex: 1, paddingRight: "1rem" }}>
                                <div style={{ fontWeight: 600, color: "#f1f5f9", fontSize: "0.85rem", marginBottom: "2px" }}>{i.name}</div>
                                <div style={{ fontSize: "0.75rem", color: "#94a3b8", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{i.description}</div>
                              </div>
                              <div style={{ background: "rgba(168,85,247,0.1)", padding: "0.3rem 0.6rem", borderRadius: "6px", border: "1px solid rgba(168,85,247,0.2)", flexShrink: 0 }}>
                                <span style={{ fontSize: "0.85rem", color: "#a855f7", fontWeight: 700, whiteSpace: "nowrap" }}>{Number(i.standardPrice).toLocaleString()}đ<span style={{ fontSize: "0.7rem", color: "#cbd5e1", fontWeight: 500 }}>/{i.unit || "Cái"}</span></span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </>
                    )}
                  </ul>
                );
              })()}
            </div>

            {/* Item List Separated by Category */}
            {items.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                
                {/* GROUP 1: THIẾT BỊ HỌC TẬP */}
                {items.filter(i => i.type === "ITEM").length > 0 && (
                  <div style={{ background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(56, 189, 248, 0.25)", borderRadius: "12px", overflow: "hidden" }}>
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "0.55rem 0.85rem", background: "rgba(56, 189, 248, 0.08)",
                      borderBottom: "1px solid rgba(56, 189, 248, 0.25)"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#38bdf8", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        <Package size={14} />
                        Thiết bị ({items.filter(i => i.type === "ITEM").length})
                      </div>
                      <div style={{ fontSize: "0.825rem", fontWeight: 700, color: "#38bdf8" }}>
                        Tổng thiết bị: {items.filter(i => i.type === "ITEM").reduce((acc, curr) => acc + (curr.quantity * curr.price), 0).toLocaleString()}đ
                      </div>
                    </div>

                    <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {items.filter(i => i.type === "ITEM").map((item) => (
                        <div key={item.tempId} className="item-row">
                          <div>
                            <div style={{ fontWeight: 600, color: "#f1f5f9", fontSize: "0.875rem", marginBottom: 3 }}>{item.name}</div>
                            {item.specifications && (
                              <div style={{ fontSize: "0.75rem", color: "#94a3b8", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {item.specifications}
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700, marginBottom: 4 }}>SỐ LƯỢNG</div>
                            <input 
                              type="number" 
                              min="0"
                              step="0.01" 
                              className="form-input" 
                              style={{ textAlign: "center", padding: "6px", borderRadius: 8, fontSize: "0.85rem", fontWeight: 600 }}
                              value={item.quantity} 
                              onChange={e => updateItemQuantity(item.tempId, parseFloat(e.target.value) || 0)}
                              disabled={selectedSchool?.isLocked}
                              title="Số lượng"
                            />
                          </div>
                          
                          <div>
                            <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700, marginBottom: 4 }}>ĐƠN GIÁ (đ/{item.unit || "Bộ"})</div>
                            <CurrencyInput 
                              value={item.price} 
                              onChange={val => updateItemPrice(item.tempId, parseInt(val) || 0)}
                              style={{ padding: "6px", borderRadius: 8, fontSize: "0.85rem", fontWeight: 600 }}
                              disabled={selectedSchool?.isLocked}
                            />
                          </div>
                          
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700, marginBottom: 4 }}>THÀNH TIỀN</div>
                            <div style={{ padding: "6px 0", fontSize: "0.875rem", fontWeight: 700, color: "#38bdf8", whiteSpace: "nowrap" }}>
                              {(item.quantity * item.price).toLocaleString()}đ
                            </div>
                          </div>
                          
                          <button type="button" onClick={() => removeItem(item.tempId)} disabled={selectedSchool?.isLocked} className="remove-btn" title="Xóa">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* GROUP 2: HẠNG MỤC ĐẦU TƯ KHÁC */}
                {items.filter(i => i.type === "INVESTMENT").length > 0 && (
                  <div style={{ background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(168, 85, 247, 0.25)", borderRadius: "12px", overflow: "hidden" }}>
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "0.55rem 0.85rem", background: "rgba(168, 85, 247, 0.08)",
                      borderBottom: "1px solid rgba(168, 85, 247, 0.25)"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#a855f7", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        <Building2 size={14} />
                        Đầu tư khác ({items.filter(i => i.type === "INVESTMENT").length})
                      </div>
                      <div style={{ fontSize: "0.825rem", fontWeight: 700, color: "#a855f7" }}>
                        Tổng đầu tư: {items.filter(i => i.type === "INVESTMENT").reduce((acc, curr) => acc + (curr.quantity * curr.price), 0).toLocaleString()}đ
                      </div>
                    </div>

                    <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {items.filter(i => i.type === "INVESTMENT").map((item) => (
                        <div key={item.tempId} className="item-row">
                          <div>
                            <div style={{ fontWeight: 600, color: "#f1f5f9", fontSize: "0.875rem", marginBottom: 3 }}>{item.name}</div>
                            {item.specifications && (
                              <div style={{ fontSize: "0.75rem", color: "#94a3b8", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {item.specifications}
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700, marginBottom: 4 }}>SỐ LƯỢNG</div>
                            <input 
                              type="number" 
                              min="0"
                              step="0.01" 
                              className="form-input" 
                              style={{ textAlign: "center", padding: "6px", borderRadius: 8, fontSize: "0.85rem", fontWeight: 600 }}
                              value={item.quantity} 
                              onChange={e => updateItemQuantity(item.tempId, parseFloat(e.target.value) || 0)}
                              disabled={selectedSchool?.isLocked}
                              title="Số lượng"
                            />
                          </div>
                          
                          <div>
                            <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700, marginBottom: 4 }}>ĐƠN GIÁ (đ/{item.unit || "Cái"})</div>
                            <CurrencyInput 
                              value={item.price} 
                              onChange={val => updateItemPrice(item.tempId, parseInt(val) || 0)}
                              style={{ padding: "6px", borderRadius: 8, fontSize: "0.85rem", fontWeight: 600 }}
                              disabled={selectedSchool?.isLocked}
                            />
                          </div>
                          
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700, marginBottom: 4 }}>THÀNH TIỀN</div>
                            <div style={{ padding: "6px 0", fontSize: "0.875rem", fontWeight: 700, color: "#a855f7", whiteSpace: "nowrap" }}>
                              {(item.quantity * item.price).toLocaleString()}đ
                            </div>
                          </div>
                          
                          <button type="button" onClick={() => removeItem(item.tempId)} disabled={selectedSchool?.isLocked} className="remove-btn" title="Xóa">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <Package size={28} color="#475569" />
                </div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: "0.95rem" }}>Chưa có hạng mục nào</p>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem" }}>Sử dụng thanh tìm kiếm ở trên để thêm thiết bị hoặc đầu tư</p>
              </div>
            )}
          </div>
        )}
      </form>

      {/* Custom Clear Confirmation Modal */}
      {showClearConfirm && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          animation: "fadeIn 0.2s ease"
        }}>
          <div style={{
            background: "#1e293b", border: "1px solid #334155", borderRadius: "12px",
            padding: "1.5rem", width: "90%", maxWidth: "400px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)"
          }}>
            <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1.1rem", fontWeight: 600, color: "#f1f5f9" }}>Làm sạch dữ liệu</h3>
            <p style={{ margin: "0 0 1.5rem 0", color: "#cbd5e1", fontSize: "0.9rem", lineHeight: 1.5 }}>
              Bạn có chắc chắn muốn xóa toàn bộ dữ liệu đang nhập để làm lại từ đầu? Thao tác này không thể hoàn tác.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button 
                onClick={() => setShowClearConfirm(false)}
                style={{
                  padding: "0.5rem 1rem", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 500,
                  background: "transparent", border: "1px solid #475569", color: "#cbd5e1", cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#f8fafc"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#cbd5e1"; }}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmClearData}
                style={{
                  padding: "0.5rem 1rem", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 500,
                  background: "#f43f5e", border: "1px solid #f43f5e", color: "#ffffff", cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "#e11d48"}
                onMouseOut={(e) => e.currentTarget.style.background = "#f43f5e"}
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
