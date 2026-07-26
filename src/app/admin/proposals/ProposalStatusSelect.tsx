"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { lockProposal, completeProposal, unlockProposal, revertToLocked } from "@/app/actions/proposal-admin";
import { toast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import { ChevronDown, CircleDot, CheckCircle2, Lock } from "lucide-react";

export default function ProposalStatusSelect({ proposal }: { proposal: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isLocked = proposal.school?.isLocked;
  const isCompleted = proposal.status === "COMPLETED";

  // Determine current effective status
  let currentStatus = "init";
  let badgeClass = "badge-orange";
  let statusText = "KHỞI TẠO";
  
  if (isCompleted) {
    currentStatus = "completed";
    badgeClass = "badge-success";
    statusText = "HOÀN THÀNH";
  } else if (proposal.status === "CLOSED") {
    currentStatus = "closed";
    badgeClass = "badge-secondary";
    statusText = "ĐÃ ĐÓNG";
  } else if (isLocked || proposal.status === "APPROVED") {
    currentStatus = "locked";
    badgeClass = "badge-error";
    statusText = "ĐANG THỰC HIỆN";
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (newStatus: string) => {
    setShowMenu(false);
    if (newStatus === currentStatus) return;

    if (newStatus === "locked" && currentStatus === "init") setPendingAction("lock");
    else if (newStatus === "completed" && (currentStatus === "locked" || currentStatus === "init")) setPendingAction("complete");
    else if (newStatus === "locked" && currentStatus === "completed") setPendingAction("revertToLocked");
    else if (newStatus === "init" && currentStatus !== "init") setPendingAction("unlock"); 
  };

  const runAction = async (action: string) => {
    setIsLoading(true);
    let res: any;
    const schoolName = proposal.school?.name;

    switch (action) {
      case "lock": res = await lockProposal(proposal.id); break;
      case "complete": 
        if (currentStatus === "init") {
          await lockProposal(proposal.id);
        }
        res = await completeProposal(proposal.id); 
        break;
      case "revertToLocked": res = await revertToLocked(proposal.id); break;
      case "unlock": res = await unlockProposal(proposal.id); break;
    }

    if (res?.success) {
      toast.success("Đã cập nhật trạng thái");
      router.refresh();
    } else {
      toast.error(res?.message || "Có lỗi xảy ra");
    }
    
    setIsLoading(false);
    setPendingAction(null);
  };

  const confirmConfig: Record<string, any> = {
    lock: {
      title: "Xác nhận Đang thực hiện",
      message: `Chuyển dự trù trường "${proposal.school?.name}" sang Đang thực hiện? Sale sẽ không thể chỉnh sửa.`,
      confirmText: "Đồng ý",
      variant: "warning",
    },
    complete: {
      title: "Xác nhận Hoàn thành",
      message: `Chuyển dự trù trường "${proposal.school?.name}" sang Hoàn thành?`,
      confirmText: "Hoàn thành",
      variant: "success",
    },
    revertToLocked: {
      title: "Chuyển về Đang thực hiện",
      message: `Hoàn tác trạng thái dự trù trường "${proposal.school?.name}" về Đang thực hiện?`,
      confirmText: "Xác nhận",
      variant: "warning",
    },
    unlock: {
      title: "Chuyển về Khởi tạo",
      message: `Chuyển dự trù trường "${proposal.school?.name}" về Khởi tạo? Sale sẽ có thể chỉnh sửa lại.`,
      confirmText: "Đồng ý",
      variant: "warning",
    },
  };

  const dropdownItemStyle = (isSelected: boolean, color: string) => ({
    width: "100%", display: "flex", alignItems: "center", gap: "0.5rem",
    padding: "0.6rem 0.8rem", border: "none", background: isSelected ? `rgba(${color}, 0.15)` : "transparent",
    color: isSelected ? `rgb(${color})` : "#cbd5e1", fontSize: "0.8rem", cursor: "pointer", borderRadius: "6px",
    fontWeight: isSelected ? 600 : 500, transition: "all 0.15s ease"
  });

  return (
    <>
      <div ref={menuRef} style={{ position: "relative", display: "inline-block", textAlign: "left" }}>
        <button
          onClick={() => { if (currentStatus !== "closed") setShowMenu(!showMenu) }}
          disabled={isLoading}
          className={`badge ${badgeClass}`}
          style={{ 
            cursor: currentStatus === "closed" ? "default" : "pointer", 
            border: "1px solid", 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "0.4rem",
            padding: "0.3rem 0.6rem 0.3rem 0.8rem",
            outline: "none",
            transition: "all 0.2s"
          }}
          title={currentStatus === "closed" ? "Không thể đổi trạng thái của dự trù đã đóng" : "Nhấn để đổi trạng thái"}
        >
          {statusText}
          {currentStatus !== "closed" && <ChevronDown size={14} style={{ opacity: 0.7, transform: showMenu ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />}
        </button>

        {showMenu && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
            padding: "0.4rem",
            zIndex: 50,
            minWidth: "180px",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.3)",
            animation: "fadeInDown 0.15s ease-out"
          }}>
            <style>{`
              @keyframes fadeInDown {
                from { opacity: 0; transform: translate(-50%, -6px); }
                to { opacity: 1; transform: translate(-50%, 0); }
              }
            `}</style>
            
            <button
              style={dropdownItemStyle(currentStatus === "init", "251, 146, 60")} // fb923c
              onMouseEnter={(e) => { if (currentStatus !== "init") e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={(e) => { if (currentStatus !== "init") e.currentTarget.style.background = "transparent"; }}
              onClick={() => handleSelect("init")}
            >
              <CircleDot size={14} color={currentStatus === "init" ? "#fb923c" : "#94a3b8"} />
              Khởi tạo
            </button>
            
            <button
              style={dropdownItemStyle(currentStatus === "locked", "244, 63, 94")} // f43f5e
              onMouseEnter={(e) => { if (currentStatus !== "locked") e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={(e) => { if (currentStatus !== "locked") e.currentTarget.style.background = "transparent"; }}
              onClick={() => handleSelect("locked")}
            >
              <Lock size={14} color={currentStatus === "locked" ? "#f43f5e" : "#94a3b8"} />
              Đang thực hiện
            </button>
            
            <button
              style={dropdownItemStyle(currentStatus === "completed", "16, 185, 129")} // 10b981
              onMouseEnter={(e) => { if (currentStatus !== "completed") e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={(e) => { if (currentStatus !== "completed") e.currentTarget.style.background = "transparent"; }}
              onClick={() => handleSelect("completed")}
            >
              <CheckCircle2 size={14} color={currentStatus === "completed" ? "#10b981" : "#94a3b8"} />
              Hoàn thành
            </button>
          </div>
        )}
      </div>

      {pendingAction && confirmConfig[pendingAction] && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setPendingAction(null)}
          onConfirm={() => runAction(pendingAction)}
          title={confirmConfig[pendingAction].title}
          message={confirmConfig[pendingAction].message}
          confirmText={confirmConfig[pendingAction].confirmText}
          variant={confirmConfig[pendingAction].variant}
          isLoading={isLoading}
        />
      )}
    </>
  );
}
