"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { createProposal } from "@/app/actions/proposal-sale";
import { vietnameseIncludes } from "@/lib/vietnamese";
import { AlertCircle, AlertTriangle, RefreshCcw, Search, Plus, Trash2, Package, Building2, ChevronDown, CheckCircle2, FileText, TrendingUp, GraduationCap, DoorOpen, Wrench } from "lucide-react";
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
type CatalogInvestment = { id: string; name: string; description: string; standardPrice: number; unit: string; category?: string };

type ProposalItem = { tempId: number; name: string; specifications: string; quantity: number; price: number; type: "ITEM" | "INVESTMENT"; unit: string; category?: string };

const isConstructionItem = (item: { name: string; category?: string }) => {
  if (item.category === "CONSTRUCTION") return true;
  const nameLower = (item.name || "").toLowerCase();
  return (
    nameLower.startsWith("gói thi công") ||
    nameLower.startsWith("gói bảo trì") ||
    nameLower.startsWith("gói hệ thống")
  );
};

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
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogModalTab, setCatalogModalTab] = useState<"ALL" | "ITEM" | "INVESTMENT" | "CONSTRUCTION">("ALL");
  const [catalogModalSearch, setCatalogModalSearch] = useState("");

  const getSchoolStatus = (s: any) => {
    if (!s.latestProposal) return { type: "NONE", label: "Chưa có dự trù", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" };
    if (s.latestProposal.status === "COMPLETED") return { type: "COMPLETED", label: "Đã hoàn thành", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)" };
    if (s.isLocked || s.latestProposal.status === "APPROVED") return { type: "LOCKED", label: "Đang thực hiện", color: "#f43f5e", bg: "rgba(244, 63, 94, 0.15)" };
    return { type: "INIT", label: "Khởi tạo", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" };
  };

  const filteredSchools = schools.filter(s => {
    const matchesSearch = vietnameseIncludes(s.name, searchQuery) || 
                          vietnameseIncludes(s.address, searchQuery);
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
  const totalEquipment = items.filter(i => i.type === "ITEM").reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
  const totalInvestment = items.filter(i => i.type === "INVESTMENT").reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
  const totalInvested = totalEquipment + totalInvestment;
  const delta = allocatedBudget - totalInvested;
  const budgetUsagePercent = allocatedBudget > 0 ? Math.min((totalInvested / allocatedBudget) * 100, 100) : 0;

  // Pre-fetch destination route for 0ms instant redirect
  useEffect(() => {
    router.prefetch("/sale/proposals");
  }, [router]);

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
            unit: inv.unit,
            category: inv.category
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
      router.push("/sale/proposals");
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
        
        /* Dropdown Lists - Solid Opaque Background */
        .dropdown-list {
          position: absolute;
          top: calc(100% + 6px);
          left: 0; right: 0;
          background: #090d16 !important;
          border: 1.5px solid #38bdf8 !important;
          border-radius: 10px;
          max-height: 320px;
          overflow-y: auto;
          z-index: 9999 !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.95);
          list-style: none;
          margin: 0;
          padding: 0.35rem;
          animation: slideDown 0.2s ease;
        }
        .dropdown-item {
          padding: 0.55rem 0.75rem;
          cursor: pointer;
          border-radius: 8px;
          background: #111827 !important;
          border: 1px solid #1e293b !important;
          margin-bottom: 0.3rem;
          transition: all 0.2s ease;
        }
        .dropdown-item:hover {
          background: #1e293b !important;
          border-color: #38bdf8 !important;
          transform: translateX(2px);
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
        
        .budget-bottom-bar {
          position: fixed;
          bottom: 0;
          left: 250px;
          right: 0;
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          padding: 0.85rem 2rem;
          background: #090e1a;
          border-top: 1px solid rgba(56, 189, 248, 0.25);
          box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.8);
          animation: slideUp 0.3s ease;
        }
        @media (max-width: 768px) {
          .budget-bottom-bar {
            left: 0;
            bottom: 62px;
            padding: 0.75rem 1rem;
          }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", animation: "fadeIn 0.4s ease", paddingBottom: selectedSchool ? "5rem" : 0 }}>
        
        {/* Step Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.2rem", background: "rgba(15, 23, 42, 0.5)", border: "1px solid #1e293b", borderRadius: "10px", width: "fit-content" }}>
          {[
            { step: 1, label: "Chọn trường", done: !!selectedSchoolId },
            { step: 2, label: "Nhập chỉ tiêu & Hạng mục", done: !!selectedSchoolId && items.length > 0 },
            { step: 3, label: "Xác nhận xuất dự trù", done: false },
          ].map((s, idx) => (
            <React.Fragment key={s.step}>
              {idx > 0 && (
                <div style={{ width: 20, height: 2, borderRadius: 1, background: s.done || (idx === 1 && !!selectedSchoolId) || (idx === 2 && items.length > 0) ? "#38bdf8" : "#334155", transition: "background 0.4s", flexShrink: 0 }} />
              )}
              <div style={{
                display: "flex", alignItems: "center", gap: "0.35rem",
                padding: "0.35rem 0.65rem", borderRadius: "8px",
                background: s.done ? "rgba(16,185,129,0.08)" : (idx === 0 && !selectedSchoolId) || (idx === 1 && selectedSchoolId && items.length === 0) || (idx === 2 && items.length > 0) ? "rgba(56,189,248,0.08)" : "transparent",
                border: `1px solid ${s.done ? "rgba(16,185,129,0.2)" : (idx === 0 && !selectedSchoolId) || (idx === 1 && selectedSchoolId && items.length === 0) || (idx === 2 && items.length > 0) ? "rgba(56,189,248,0.2)" : "transparent"}`,
                transition: "all 0.3s ease"
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: s.done ? "#10b981" : "#334155",
                  color: s.done ? "#fff" : "#64748b",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.6rem", fontWeight: 800, transition: "all 0.3s",
                  flexShrink: 0
                }}>
                  {s.done ? "✓" : s.step}
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 600, color: s.done ? "#10b981" : "#94a3b8", transition: "color 0.3s", whiteSpace: "nowrap" }}>{s.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* ROW 1: School Search */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
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
                    placeholder="Nhập tên trường học để tìm..." 
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
            
            {/* Item Search Bar & Catalog Trigger */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              <div className="search-wrapper" ref={itemSearchRef} style={{ flex: 1, minWidth: "280px", position: "relative" }}>
                <div className="input-with-icon">
                  <Search size={18} className="search-icon" color="#38bdf8" />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Gõ tên thiết bị hoặc gói đầu tư để tìm & thêm nhanh..." 
                    value={itemSearchQuery}
                    onChange={(e) => {
                      setItemSearchQuery(e.target.value);
                      setIsItemDropdownOpen(true);
                    }}
                    onFocus={() => setIsItemDropdownOpen(true)}
                    disabled={selectedSchool?.isLocked}
                  />
                  {itemSearchQuery && (
                    <button
                      type="button"
                      onClick={() => { setItemSearchQuery(""); setIsItemDropdownOpen(false); }}
                      style={{
                        position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
                        background: "transparent", border: "none", color: "#64748b", cursor: "pointer",
                        fontSize: "0.85rem", padding: "2px"
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Direct Typing Combobox Dropdown */}
                {isItemDropdownOpen && !selectedSchool?.isLocked && itemSearchQuery.trim() !== "" && (() => {
                  const filteredItems = catalogItems.filter(i => vietnameseIncludes(i.name, itemSearchQuery) || vietnameseIncludes(i.specifications, itemSearchQuery));
                  const filteredInvs = catalogInvestments.filter(i => vietnameseIncludes(i.name, itemSearchQuery) || vietnameseIncludes(i.description, itemSearchQuery));
                  const hasResults = filteredItems.length > 0 || filteredInvs.length > 0;
                  
                  return (
                    <div 
                      className="dropdown-list" 
                      style={{ 
                        position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                        background: "#0d1424", border: "1.5px solid #38bdf8", borderRadius: "10px",
                        maxHeight: "220px", overflowY: "auto", zIndex: 250,
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.95)", padding: "0.35rem"
                      }}
                    >
                      {!hasResults ? (
                        <div style={{ padding: "1rem", textAlign: "center", color: "#64748b", fontSize: "0.825rem" }}>
                          Không tìm thấy kết quả cho "{itemSearchQuery}"
                        </div>
                      ) : (
                        <>
                          {filteredItems.length > 0 && (
                            <div style={{ marginBottom: "0.4rem" }}>
                              <div style={{ padding: "0.3rem 0.5rem", fontSize: "0.68rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                📦 Thiết bị ({filteredItems.length})
                              </div>
                              {filteredItems.map(i => (
                                <div
                                  key={`ITEM_${i.id}`}
                                  className="dropdown-item"
                                  onClick={() => {
                                    addItemByValue(`ITEM_${i.id}`);
                                    setItemSearchQuery("");
                                    setIsItemDropdownOpen(false);
                                  }}
                                  style={{ padding: "0.45rem 0.6rem", borderRadius: "6px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}
                                >
                                  <div style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    <span style={{ fontWeight: 600, color: "#f8fafc", fontSize: "0.825rem" }}>{i.name}</span>
                                    {i.specifications && (
                                      <span style={{ fontSize: "0.725rem", color: "#94a3b8", marginLeft: "6px" }}>— {i.specifications}</span>
                                    )}
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0 }}>
                                    <span style={{ fontSize: "0.65rem", padding: "1px 5px", borderRadius: 4, background: "rgba(51, 65, 85, 0.4)", color: "#cbd5e1" }}>{i.unit || "Bộ"}</span>
                                    <span style={{ fontSize: "0.8rem", color: "#38bdf8", fontWeight: 700 }}>{Number(i.standardPrice).toLocaleString()}đ</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {filteredInvs.length > 0 && (
                            <div>
                              <div style={{ padding: "0.3rem 0.5rem", fontSize: "0.68rem", fontWeight: 800, color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                🏢 Đầu tư khác ({filteredInvs.length})
                              </div>
                              {filteredInvs.map(i => (
                                <div
                                  key={`INV_${i.id}`}
                                  className="dropdown-item"
                                  onClick={() => {
                                    addItemByValue(`INV_${i.id}`);
                                    setItemSearchQuery("");
                                    setIsItemDropdownOpen(false);
                                  }}
                                  style={{ padding: "0.45rem 0.6rem", borderRadius: "6px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}
                                >
                                  <div style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    <span style={{ fontWeight: 600, color: "#f8fafc", fontSize: "0.825rem" }}>{i.name}</span>
                                    {i.description && (
                                      <span style={{ fontSize: "0.725rem", color: "#94a3b8", marginLeft: "6px" }}>— {i.description}</span>
                                    )}
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0 }}>
                                    <span style={{ fontSize: "0.65rem", padding: "1px 5px", borderRadius: 4, background: "rgba(51, 65, 85, 0.4)", color: "#cbd5e1" }}>{i.unit || "Cái"}</span>
                                    <span style={{ fontSize: "0.8rem", color: "#a855f7", fontWeight: 700 }}>{Number(i.standardPrice).toLocaleString()}đ</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>

              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(true)}
                disabled={selectedSchool?.isLocked}
                style={{
                  padding: "0.55rem 1.15rem",
                  borderRadius: "8px",
                  fontSize: "0.825rem",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #38bdf8, #2563eb)",
                  boxShadow: "0 4px 12px rgba(56, 189, 248, 0.25)",
                  border: "none",
                  color: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = "none"; }}
              >
                <Package size={15} />
                + Bổ sung Hạng mục (Catalog)
              </button>
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
                              value={item.quantity === 0 ? "" : item.quantity} 
                              onChange={e => updateItemQuantity(item.tempId, e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
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

                {/* GROUP 2: HẠNG MỤC THI CÔNG */}
                {items.filter(i => i.type === "INVESTMENT" && isConstructionItem(i)).length > 0 && (
                  <div style={{ background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(6, 182, 212, 0.3)", borderRadius: "12px", overflow: "hidden" }}>
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "0.55rem 0.85rem", background: "rgba(6, 182, 212, 0.08)",
                      borderBottom: "1px solid rgba(6, 182, 212, 0.25)"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#06b6d4", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        <Wrench size={14} />
                        Thi công ({items.filter(i => i.type === "INVESTMENT" && isConstructionItem(i)).length})
                      </div>
                      <div style={{ fontSize: "0.825rem", fontWeight: 700, color: "#06b6d4" }}>
                        Tổng thi công: {items.filter(i => i.type === "INVESTMENT" && isConstructionItem(i)).reduce((acc, curr) => acc + (curr.quantity * curr.price), 0).toLocaleString()}đ
                      </div>
                    </div>

                    <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {items.filter(i => i.type === "INVESTMENT" && isConstructionItem(i)).map((item) => (
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
                              value={item.quantity === 0 ? "" : item.quantity} 
                              onChange={e => updateItemQuantity(item.tempId, e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
                              disabled={selectedSchool?.isLocked}
                              title="Số lượng"
                            />
                          </div>
                          
                          <div>
                            <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700, marginBottom: 4 }}>ĐƠN GIÁ (đ/{item.unit || "Gói"})</div>
                            <CurrencyInput 
                              value={item.price} 
                              onChange={val => updateItemPrice(item.tempId, parseInt(val) || 0)}
                              style={{ padding: "6px", borderRadius: 8, fontSize: "0.85rem", fontWeight: 600 }}
                              disabled={selectedSchool?.isLocked}
                            />
                          </div>
                          
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700, marginBottom: 4 }}>THÀNH TIỀN</div>
                            <div style={{ padding: "6px 0", fontSize: "0.875rem", fontWeight: 700, color: "#06b6d4", whiteSpace: "nowrap" }}>
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

                {/* GROUP 3: HẠNG MỤC ĐẦU TƯ KHÁC */}
                {items.filter(i => i.type === "INVESTMENT" && !isConstructionItem(i)).length > 0 && (
                  <div style={{ background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(168, 85, 247, 0.25)", borderRadius: "12px", overflow: "hidden" }}>
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "0.55rem 0.85rem", background: "rgba(168, 85, 247, 0.08)",
                      borderBottom: "1px solid rgba(168, 85, 247, 0.25)"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#a855f7", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        <Building2 size={14} />
                        Đầu tư khác ({items.filter(i => i.type === "INVESTMENT" && !isConstructionItem(i)).length})
                      </div>
                      <div style={{ fontSize: "0.825rem", fontWeight: 700, color: "#a855f7" }}>
                        Tổng đầu tư khác: {items.filter(i => i.type === "INVESTMENT" && !isConstructionItem(i)).reduce((acc, curr) => acc + (curr.quantity * curr.price), 0).toLocaleString()}đ
                      </div>
                    </div>

                    <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {items.filter(i => i.type === "INVESTMENT" && !isConstructionItem(i)).map((item) => (
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
                              value={item.quantity === 0 ? "" : item.quantity} 
                              onChange={e => updateItemQuantity(item.tempId, e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
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

        {/* ── STICKY BOTTOM BUDGET BAR ── */}
        {selectedSchool && (
          <div className="budget-bottom-bar">
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flex: 1, flexWrap: "wrap", minWidth: 0 }}>
              {/* Budget Allocated */}
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Ngân sách</div>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#38bdf8", letterSpacing: "-0.02em" }}>{allocatedBudget.toLocaleString()}đ</div>
              </div>

              <div style={{ width: 1, height: 28, background: "rgba(51, 65, 85, 0.6)", flexShrink: 0 }} />

              {/* Usage Progress */}
              <div style={{ minWidth: 140, flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 600 }}>Đã sử dụng</span>
                  <span style={{ fontSize: "0.6rem", color: budgetUsagePercent > 100 ? "#f43f5e" : "#38bdf8", fontWeight: 700 }}>{budgetUsagePercent.toFixed(1)}%</span>
                </div>
                <div className="budget-bar-track" style={{ margin: 0, height: 5 }}>
                  <div className="budget-bar-fill" style={{
                    width: `${Math.min(budgetUsagePercent, 100)}%`,
                    background: budgetUsagePercent > 100
                      ? "linear-gradient(90deg, #f43f5e, #e11d48)"
                      : budgetUsagePercent > 80
                        ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                        : "linear-gradient(90deg, #38bdf8, #3b82f6)"
                  }} />
                </div>
              </div>

              <div style={{ width: 1, height: 28, background: "rgba(51, 65, 85, 0.6)", flexShrink: 0 }} />

              {/* Equipment */}
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Thiết bị</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#38bdf8" }}>{totalEquipment.toLocaleString()}đ</div>
              </div>

              {/* Investment */}
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Đầu tư khác</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#a855f7" }}>{totalInvestment.toLocaleString()}đ</div>
              </div>

              <div style={{ width: 1, height: 28, background: "rgba(51, 65, 85, 0.6)", flexShrink: 0 }} />

              {/* Delta */}
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Chênh lệch</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 800, color: delta >= 0 ? "#10b981" : "#f43f5e" }}>
                  {delta >= 0 ? `+${delta.toLocaleString()}đ` : `${delta.toLocaleString()}đ`}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
              <button
                type="button"
                onClick={handleClearData}
                className="submit-btn secondary"
                style={{ padding: "0.5rem 0.85rem", fontSize: "0.78rem", borderRadius: 8, width: "auto" }}
                disabled={!selectedSchoolId || selectedSchool?.isLocked || (items.length === 0 && !schoolDetails.oldStudents && !schoolDetails.newStudents && !schoolDetails.investedClassrooms)}
              >
                <RefreshCcw size={13} /> Làm sạch
              </button>
              <button
                type="submit"
                className="submit-btn primary"
                style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem", borderRadius: 8, width: "auto" }}
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
                    Xuất Dự trù
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* ── CATALOG BROWSER MODAL DIALOG (SAAS STANDARD) ── */}
      {isCatalogModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(9, 14, 26, 0.88)", backdropFilter: "blur(10px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
          padding: "1.5rem", animation: "fadeIn 0.2s ease"
        }}>
          <div style={{
            background: "#0f172a", border: "1px solid #334155", borderRadius: "16px",
            width: "100%", maxWidth: "780px", maxHeight: "80vh", margin: "auto",
            display: "flex", flexDirection: "column", overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.95)"
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "1rem 1.25rem", borderBottom: "1px solid #1e293b",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(15, 23, 42, 0.8)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Package size={20} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#f8fafc" }}>
                  Kho Hạng mục Đầu tư & Thiết bị
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(false)}
                style={{
                  background: "transparent", border: "none", color: "#94a3b8",
                  fontSize: "1.25rem", cursor: "pointer", padding: "4px 8px", borderRadius: "6px"
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Filter & Search Toolbar */}
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #1e293b", display: "flex", flexDirection: "column", gap: "0.75rem", background: "rgba(30, 41, 59, 0.3)" }}>
              <div className="input-with-icon">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Tìm kiếm thiết bị, thông số hoặc gói đầu tư..."
                  value={catalogModalSearch}
                  onChange={(e) => setCatalogModalSearch(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ display: "flex", gap: "0.4rem" }}>
                {(() => {
                  const constrCatalog = catalogInvestments.filter(i => isConstructionItem(i));
                  const pureInvCatalog = catalogInvestments.filter(i => !isConstructionItem(i));
                  return [
                    { key: "ALL", label: `Tất cả (${catalogItems.length + catalogInvestments.length})`, color: "#38bdf8" },
                    { key: "ITEM", label: `Thiết bị (${catalogItems.length})`, color: "#38bdf8" },
                    { key: "CONSTRUCTION", label: `Thi công (${constrCatalog.length})`, color: "#06b6d4" },
                    { key: "INVESTMENT", label: `Đầu tư khác (${pureInvCatalog.length})`, color: "#a855f7" },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setCatalogModalTab(tab.key as any)}
                      style={{
                        padding: "4px 12px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700,
                        border: "1px solid",
                        borderColor: catalogModalTab === tab.key ? tab.color : "#334155",
                        background: catalogModalTab === tab.key ? `${tab.color}22` : "transparent",
                        color: catalogModalTab === tab.key ? tab.color : "#94a3b8",
                        cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      {tab.label}
                    </button>
                  ));
                })()}
              </div>
            </div>

            {/* Modal Body Grid */}
            <div style={{ padding: "1.25rem", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
              {(() => {
                const constrCatalog = catalogInvestments.filter(i => isConstructionItem(i));
                const pureInvCatalog = catalogInvestments.filter(i => !isConstructionItem(i));

                const itemsList = (catalogModalTab === "ALL" || catalogModalTab === "ITEM")
                  ? catalogItems.filter(i => vietnameseIncludes(i.name, catalogModalSearch) || vietnameseIncludes(i.specifications, catalogModalSearch))
                  : [];
                const constrsList = (catalogModalTab === "ALL" || catalogModalTab === "CONSTRUCTION")
                  ? constrCatalog.filter(i => vietnameseIncludes(i.name, catalogModalSearch) || vietnameseIncludes(i.description, catalogModalSearch))
                  : [];
                const invsList = (catalogModalTab === "ALL" || catalogModalTab === "INVESTMENT")
                  ? pureInvCatalog.filter(i => vietnameseIncludes(i.name, catalogModalSearch) || vietnameseIncludes(i.description, catalogModalSearch))
                  : [];

                if (itemsList.length === 0 && constrsList.length === 0 && invsList.length === 0) {
                  return (
                    <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                      <Package size={36} color="#475569" style={{ margin: "0 auto 0.75rem" }} />
                      <p style={{ margin: 0, fontWeight: 600 }}>Không tìm thấy hạng mục phù hợp</p>
                    </div>
                  );
                }

                return (
                  <>
                    {/* Items Section */}
                    {itemsList.length > 0 && (
                      <div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Package size={14} /> Thiết bị ({itemsList.length})
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "0.75rem" }}>
                          {itemsList.map(item => {
                            const added = items.some(i => i.type === "ITEM" && i.name === item.name);
                            return (
                              <div
                                key={item.id}
                                style={{
                                  background: "rgba(15, 23, 42, 0.6)", border: "1px solid #334155", borderRadius: "10px",
                                  padding: "0.75rem 0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem"
                                }}
                              >
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ fontWeight: 700, color: "#f8fafc", fontSize: "0.85rem", marginBottom: 3 }}>{item.name}</div>
                                  {item.specifications && (
                                    <div style={{ fontSize: "0.725rem", color: "#94a3b8", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                      {item.specifications}
                                    </div>
                                  )}
                                  <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                    <span style={{ fontSize: "0.65rem", padding: "1px 5px", borderRadius: 4, background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", fontWeight: 700 }}>{item.unit || "Bộ"}</span>
                                    <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#38bdf8" }}>{Number(item.standardPrice).toLocaleString()}đ</span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => addItemByValue(`ITEM_${item.id}`)}
                                  style={{
                                    padding: "0.4rem 0.75rem", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700,
                                    background: added ? "rgba(16, 185, 129, 0.2)" : "#38bdf8",
                                    border: added ? "1px solid #10b981" : "none",
                                    color: added ? "#10b981" : "#0f172a",
                                    cursor: "pointer", flexShrink: 0, transition: "all 0.2s"
                                  }}
                                >
                                  {added ? "✓ Đã thêm" : "+ Thêm"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Investments Section */}
                    {invsList.length > 0 && (
                      <div style={{ marginTop: itemsList.length > 0 ? "1rem" : 0 }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Building2 size={14} /> Đầu tư khác ({invsList.length})
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "0.75rem" }}>
                          {invsList.map(inv => {
                            const added = items.some(i => i.type === "INVESTMENT" && i.name === inv.name);
                            return (
                              <div
                                key={inv.id}
                                style={{
                                  background: "rgba(15, 23, 42, 0.6)", border: "1px solid #334155", borderRadius: "10px",
                                  padding: "0.75rem 0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem"
                                }}
                              >
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ fontWeight: 700, color: "#f8fafc", fontSize: "0.85rem", marginBottom: 3 }}>{inv.name}</div>
                                  {inv.description && (
                                    <div style={{ fontSize: "0.725rem", color: "#94a3b8", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                      {inv.description}
                                    </div>
                                  )}
                                  <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                    <span style={{ fontSize: "0.65rem", padding: "1px 5px", borderRadius: 4, background: "rgba(168, 85, 247, 0.15)", color: "#a855f7", fontWeight: 700 }}>{inv.unit || "Cái"}</span>
                                    <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#a855f7" }}>{Number(inv.standardPrice).toLocaleString()}đ</span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => addItemByValue(`INV_${inv.id}`)}
                                  style={{
                                    padding: "0.4rem 0.75rem", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700,
                                    background: added ? "rgba(16, 185, 129, 0.2)" : "#a855f7",
                                    border: added ? "1px solid #10b981" : "none",
                                    color: added ? "#10b981" : "#ffffff",
                                    cursor: "pointer", flexShrink: 0, transition: "all 0.2s"
                                  }}
                                >
                                  {added ? "✓ Đã thêm" : "+ Thêm"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Construction Section */}
                    {constrsList.length > 0 && (
                      <div style={{ marginTop: (itemsList.length > 0 || invsList.length > 0) ? "1rem" : 0 }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Wrench size={14} /> Thi công ({constrsList.length})
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "0.75rem" }}>
                          {constrsList.map(inv => {
                            const added = items.some(i => i.type === "INVESTMENT" && i.name === inv.name);
                            return (
                              <div
                                key={inv.id}
                                style={{
                                  background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(6, 182, 212, 0.4)", borderRadius: "10px",
                                  padding: "0.75rem 0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem"
                                }}
                              >
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ fontWeight: 700, color: "#f8fafc", fontSize: "0.85rem", marginBottom: 3 }}>{inv.name}</div>
                                  {inv.description && (
                                    <div style={{ fontSize: "0.725rem", color: "#94a3b8", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                      {inv.description}
                                    </div>
                                  )}
                                  <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                    <span style={{ fontSize: "0.65rem", padding: "1px 5px", borderRadius: 4, background: "rgba(6, 182, 212, 0.15)", color: "#06b6d4", fontWeight: 700 }}>{inv.unit || "Gói"}</span>
                                    <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#06b6d4" }}>{Number(inv.standardPrice).toLocaleString()}đ</span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => addItemByValue(`INV_${inv.id}`)}
                                  style={{
                                    padding: "0.4rem 0.75rem", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700,
                                    background: added ? "rgba(16, 185, 129, 0.2)" : "#06b6d4",
                                    border: added ? "1px solid #10b981" : "none",
                                    color: added ? "#10b981" : "#ffffff",
                                    cursor: "pointer", flexShrink: 0, transition: "all 0.2s"
                                  }}
                                >
                                  {added ? "✓ Đã thêm" : "+ Thêm"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid #1e293b", display: "flex", justifyContent: "flex-end", background: "rgba(15, 23, 42, 0.8)" }}>
              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(false)}
                style={{
                  padding: "0.5rem 1.25rem", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 700,
                  background: "#3b82f6", border: "none", color: "#ffffff", cursor: "pointer"
                }}
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}

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
