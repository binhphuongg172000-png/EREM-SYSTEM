"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { lockProposal, completeProposal, unlockProposal, revertToLocked } from "@/app/actions/proposal-admin";
import { toast } from "@/components/Toast";
import { ChevronDown, CircleDot, CheckCircle2, Lock, X } from "lucide-react";

export default function ProposalStatusSelect({ 
  proposal, 
  isSysAdmin = false 
}: { 
  proposal: any; 
  isSysAdmin?: boolean;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [overrideStatus, setOverrideStatus] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isLocked = proposal.school?.isLocked;
  const isCompleted = proposal.status === "COMPLETED";

  // Determine current effective status (support optimistic override)
  let currentStatus = "init";
  let badgeClass = "badge-orange";
  let statusText = "KHỞI TẠO";

  const effectiveStatus = overrideStatus || (
    isCompleted ? "completed" :
    (proposal.status === "CLOSED" ? "closed" :
    (isLocked || proposal.status === "APPROVED" ? "locked" : "init"))
  );
  
  if (effectiveStatus === "completed") {
    currentStatus = "completed";
    badgeClass = "badge-success";
    statusText = "HOÀN THÀNH";
  } else if (effectiveStatus === "closed") {
    currentStatus = "closed";
    badgeClass = "badge-secondary";
    statusText = "ĐÃ ĐÓNG";
  } else if (effectiveStatus === "locked") {
    currentStatus = "locked";
    badgeClass = "badge-error";
    statusText = "ĐANG THỰC HIỆN";
  }

  const canChange = isSysAdmin && currentStatus !== "closed";

  // Sync prop changes
  useEffect(() => {
    setOverrideStatus(null);
  }, [proposal.status, proposal.school?.isLocked]);

  // Close menu or popover on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setPendingAction(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (newStatus: string) => {
    setShowMenu(false);
    if (!isSysAdmin || newStatus === currentStatus) return;

    if (newStatus === "locked" && currentStatus === "init") setPendingAction("lock");
    else if (newStatus === "completed" && (currentStatus === "locked" || currentStatus === "init")) setPendingAction("complete");
    else if (newStatus === "locked" && currentStatus === "completed") setPendingAction("revertToLocked");
    else if (newStatus === "init" && currentStatus !== "init") setPendingAction("unlock"); 
  };

  const runAction = async (action: string) => {
    setIsLoading(true);
    
    // OPTIMISTIC UPDATE: Update UI status instantly with zero latency
    let nextStatus = currentStatus;
    if (action === "lock" || action === "revertToLocked") nextStatus = "locked";
    else if (action === "complete") nextStatus = "completed";
    else if (action === "unlock") nextStatus = "init";

    setOverrideStatus(nextStatus);
    setPendingAction(null);

    let res: any;
    switch (action) {
      case "lock": res = await lockProposal(proposal.id); break;
      case "complete": res = await completeProposal(proposal.id); break;
      case "revertToLocked": res = await revertToLocked(proposal.id); break;
      case "unlock": res = await unlockProposal(proposal.id); break;
    }

    if (res?.success) {
      toast.success("Đã cập nhật trạng thái");
      router.refresh();
    } else {
      setOverrideStatus(null); // Revert on error
      toast.error(res?.message || "Có lỗi xảy ra");
    }
    
    setIsLoading(false);
  };

  const confirmConfig: Record<string, any> = {
    lock: {
      title: "Chuyển Đang thực hiện",
      message: `Khoá chỉnh sửa dự trù trường "${proposal.school?.name}"?`,
      confirmText: "Xác nhận",
      btnBg: "linear-gradient(135deg, #f59e0b, #d97706)",
      color: "#fbbf24",
    },
    complete: {
      title: "Hoàn thành dự trù",
      message: `Xác nhận hoàn tất dự trù "${proposal.school?.name}"?`,
      confirmText: "Hoàn thành",
      btnBg: "linear-gradient(135deg, #10b981, #059669)",
      color: "#10b981",
    },
    revertToLocked: {
      title: "Chuyển về Đang thực hiện",
      message: `Mở lại dự trù trường "${proposal.school?.name}"?`,
      confirmText: "Chuyển về",
      btnBg: "linear-gradient(135deg, #f59e0b, #d97706)",
      color: "#fbbf24",
    },
    unlock: {
      title: "Mở lại Khởi tạo",
      message: `Cho phép Sale chỉnh sửa lại dự trù "${proposal.school?.name}"?`,
      confirmText: "Mở lại",
      btnBg: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      color: "#60a5fa",
    },
  };

  const dropdownItemStyle = (isSelected: boolean, color: string) => ({
    width: "100%", display: "flex", alignItems: "center", gap: "0.5rem",
    padding: "0.6rem 0.8rem", border: "none", background: isSelected ? `rgba(${color}, 0.15)` : "transparent",
    color: isSelected ? `rgb(${color})` : "#cbd5e1", fontSize: "0.8rem", cursor: "pointer", borderRadius: "6px",
    fontWeight: isSelected ? 600 : 500, transition: "all 0.15s ease"
  });

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block", textAlign: "left" }}>
      <button
        type="button"
        onClick={() => { if (canChange) { setPendingAction(null); setShowMenu(!showMenu); } }}
        disabled={isLoading || !canChange}
        className={`badge ${badgeClass}`}
        style={{ 
          cursor: canChange ? "pointer" : "default", 
          border: "1px solid", 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "0.4rem",
          padding: "0.3rem 0.6rem 0.3rem 0.8rem",
          outline: "none",
          transition: "all 0.2s"
        }}
        title={
          !isSysAdmin 
            ? "Chỉ SYSADMIN mới có quyền thay đổi trạng thái" 
            : currentStatus === "closed" 
              ? "Không thể đổi trạng thái của dự trù đã đóng" 
              : "Nhấn để đổi trạng thái"
        }
      >
        {statusText}
        {canChange && <ChevronDown size={14} style={{ opacity: 0.7, transform: (showMenu || pendingAction) ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />}
      </button>

      {/* DROPDOWN MENU (Smart Top Positioned) */}
      {showMenu && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 6px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#0f172a",
          border: "1px solid #334155",
          borderRadius: "10px",
          padding: "0.4rem",
          zIndex: 100,
          minWidth: "180px",
          boxShadow: "0 15px 35px rgba(0,0,0,0.85)",
          animation: "fadeInUp 0.15s ease-out"
        }}>
          <style>{`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translate(-50%, 6px); }
              to { opacity: 1; transform: translate(-50%, 0); }
            }
          `}</style>
          
          <button
            type="button"
            style={dropdownItemStyle(currentStatus === "init", "251, 146, 60")}
            onMouseEnter={(e) => { if (currentStatus !== "init") e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            onMouseLeave={(e) => { if (currentStatus !== "init") e.currentTarget.style.background = "transparent"; }}
            onClick={() => handleSelect("init")}
          >
            <CircleDot size={14} color={currentStatus === "init" ? "#fb923c" : "#94a3b8"} />
            Khởi tạo
          </button>
          
          <button
            type="button"
            style={dropdownItemStyle(currentStatus === "locked", "244, 63, 94")}
            onMouseEnter={(e) => { if (currentStatus !== "locked") e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            onMouseLeave={(e) => { if (currentStatus !== "locked") e.currentTarget.style.background = "transparent"; }}
            onClick={() => handleSelect("locked")}
          >
            <Lock size={14} color={currentStatus === "locked" ? "#f43f5e" : "#94a3b8"} />
            Đang thực hiện
          </button>
          
          <button
            type="button"
            style={dropdownItemStyle(currentStatus === "completed", "16, 185, 129")}
            onMouseEnter={(e) => { if (currentStatus !== "completed") e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            onMouseLeave={(e) => { if (currentStatus !== "completed") e.currentTarget.style.background = "transparent"; }}
            onClick={() => handleSelect("completed")}
          >
            <CheckCircle2 size={14} color={currentStatus === "completed" ? "#10b981" : "#94a3b8"} />
            Hoàn thành
          </button>
        </div>
      )}

      {/* INLINE POPOVER CONFIRMATION BOX (Smart Top Positioned UI) */}
      {pendingAction && confirmConfig[pendingAction] && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#0f172a",
          border: `1.5px solid ${confirmConfig[pendingAction].color}`,
          borderRadius: "14px",
          padding: "1rem 1.15rem",
          zIndex: 120,
          width: "270px",
          boxShadow: "0 20px 45px rgba(0,0,0,0.9)",
          animation: "fadeInUp 0.15s ease-out",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem"
        }}>
          {/* Arrow Pointer Pointing Down */}
          <div style={{
            position: "absolute",
            bottom: "-7px",
            left: "50%",
            transform: "translateX(-50%) rotate(45deg)",
            width: "12px",
            height: "12px",
            background: "#0f172a",
            borderRight: `1.5px solid ${confirmConfig[pendingAction].color}`,
            borderBottom: `1.5px solid ${confirmConfig[pendingAction].color}`
          }} />

          {/* Header & Close */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Lock size={15} color={confirmConfig[pendingAction].color} />
              {confirmConfig[pendingAction].title}
            </span>
            <button
              type="button"
              onClick={() => setPendingAction(null)}
              disabled={isLoading}
              style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: "0.1rem" }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Inline Message */}
          <p style={{ fontSize: "0.78rem", color: "#cbd5e1", margin: 0, lineHeight: 1.45 }}>
            {confirmConfig[pendingAction].message}
          </p>

          {/* Action Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.2rem" }}>
            <button
              type="button"
              onClick={() => setPendingAction(null)}
              disabled={isLoading}
              style={{
                padding: "0.4rem 0.6rem", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600,
                background: "rgba(255, 255, 255, 0.06)", border: "1px solid #334155", color: "#cbd5e1",
                cursor: "pointer", transition: "all 0.15s"
              }}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => runAction(pendingAction)}
              disabled={isLoading}
              style={{
                padding: "0.4rem 0.6rem", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 800,
                background: confirmConfig[pendingAction].btnBg, border: "none", color: "#ffffff",
                cursor: isLoading ? "not-allowed" : "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
              }}
            >
              {isLoading ? "Đang xử lý..." : confirmConfig[pendingAction].confirmText}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
