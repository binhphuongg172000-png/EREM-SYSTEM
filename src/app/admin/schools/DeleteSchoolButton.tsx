"use client";

import React, { useState } from "react";
import { deleteSchool } from "@/app/actions/school";

export default function DeleteSchoolButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa trường học này không?")) return;
    setIsDeleting(true);
    const res = await deleteSchool(id);
    if (!res.success) {
      alert("Lỗi: " + res.message);
    }
    setIsDeleting(false);
  };

  return (
    <button
      className="btn btn-danger"
      style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? "..." : "Xóa"}
    </button>
  );
}
