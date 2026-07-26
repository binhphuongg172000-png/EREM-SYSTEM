"use client";

import React, { useState, useTransition } from "react";
import { updateSchoolStats } from "@/app/actions/school";
import { Edit2, Check, X } from "lucide-react";

export default function SchoolStatsEditor({ 
  schoolId, 
  initialNewStudents, 
  initialOldStudents, 
  initialInvestedClassrooms,
  isLocked 
}: { 
  schoolId: string;
  initialNewStudents: number;
  initialOldStudents: number;
  initialInvestedClassrooms: number;
  isLocked: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [newStudents, setNewStudents] = useState(initialNewStudents);
  const [oldStudents, setOldStudents] = useState(initialOldStudents);
  const [investedClassrooms, setInvestedClassrooms] = useState(initialInvestedClassrooms);

  const handleSave = async () => {
    startTransition(async () => {
      const res = await updateSchoolStats(schoolId, {
        newStudents,
        oldStudents,
        investedClassrooms
      });
      if (res.success) {
        alert("Đã cập nhật thông số trường học");
        setIsEditing(false);
      } else {
        alert(res.message);
      }
    });
  };

  if (isEditing) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <strong>Số học sinh mới:</strong>
          <input 
            type="number" 
            className="input"
            style={{ width: "80px", padding: "0.25rem 0.5rem", height: "auto" }}
            value={newStudents}
            onChange={e => setNewStudents(Number(e.target.value))}
            min={0}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <strong>Số hs cũ:</strong>
          <input 
            type="number" 
            className="input"
            style={{ width: "80px", padding: "0.25rem 0.5rem", height: "auto" }}
            value={oldStudents}
            onChange={e => setOldStudents(Number(e.target.value))}
            min={0}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <strong>Số ph đầu tư:</strong>
          <input 
            type="number" 
            className="input"
            style={{ width: "80px", padding: "0.25rem 0.5rem", height: "auto" }}
            value={investedClassrooms}
            onChange={e => setInvestedClassrooms(Number(e.target.value))}
            min={0}
          />
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
          <button 
            className="btn btn-primary" 
            style={{ padding: "0.25rem 0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
            onClick={handleSave}
            disabled={isPending}
          >
            <Check size={14} /> {isPending ? "Đang lưu..." : "Lưu"}
          </button>
          <button 
            className="btn btn-outline" 
            style={{ padding: "0.25rem 0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
            onClick={() => {
              setIsEditing(false);
              setNewStudents(initialNewStudents);
              setOldStudents(initialOldStudents);
              setInvestedClassrooms(initialInvestedClassrooms);
            }}
            disabled={isPending}
          >
            <X size={14} /> Hủy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", position: "relative" }}>
      <div style={{ position: "absolute", right: -30, top: 0 }}>
        {!isLocked && (
          <button 
            onClick={() => setIsEditing(true)}
            style={{ 
              background: "none", border: "none", color: "#94a3b8", cursor: "pointer",
              padding: "4px", display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "4px"
            }}
            title="Chỉnh sửa thông số"
            className="hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Edit2 size={14} />
          </button>
        )}
      </div>
      <p><strong>Số học sinh mới:</strong> <span style={{ color: "#ffffff", fontWeight: 700 }}>{initialNewStudents}</span></p>
      <p><strong>Số hs cũ:</strong> <span style={{ color: "#ffffff", fontWeight: 700 }}>{initialOldStudents}</span></p>
      <p><strong>Số ph đầu tư:</strong> <span style={{ color: "#ffffff", fontWeight: 700 }}>{initialInvestedClassrooms}</span></p>
    </div>
  );
}
