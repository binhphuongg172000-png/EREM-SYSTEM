"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSchool(data: any) {
  try {
    const newSchool = await prisma.school.create({
      data: {
        name: data.name,
        address: data.address,
        principalName: data.principalName || "",
        contractNumber: data.contractNumber || "",
        oldStudents: Number(data.oldStudents) || 0,
        newStudents: Number(data.newStudents) || 0,
        saleId: data.saleId,
      },
    });

    revalidatePath("/admin/schools");
    return { success: true, school: newSchool };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi tạo trường học" };
  }
}

export async function deleteSchool(id: string) {
  try {
    await prisma.school.delete({
      where: { id },
    });
    revalidatePath("/admin/schools");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Không thể xóa trường học này (có dữ liệu liên quan)" };
  }
}

export async function updateSchool(id: string, data: any) {
  try {
    const updated = await prisma.school.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address,
        principalName: data.principalName || "",
        contractNumber: data.contractNumber || "",
        oldStudents: Number(data.oldStudents) || 0,
        newStudents: Number(data.newStudents) || 0,
        saleId: data.saleId,
      },
    });

    revalidatePath("/admin/schools");
    return { success: true, school: updated };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi cập nhật thông tin trường học" };
  }
}


export async function updateSchoolStats(id: string, data: { oldStudents: number, newStudents: number, investedClassrooms: number }) {
  try {
    const updated = await prisma.school.update({
      where: { id },
      data: {
        oldStudents: Number(data.oldStudents) || 0,
        newStudents: Number(data.newStudents) || 0,
        investedClassrooms: Number(data.investedClassrooms) || 0,
      },
    });

    revalidatePath("/sale/proposals");
    revalidatePath("/admin/proposals");
    return { success: true, school: updated };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi cập nhật thông số trường học" };
  }
}

export async function importSchoolsBulk(records: { name: string; address: string; saleName?: string }[]) {
  try {
    const sales = await prisma.user.findMany({ where: { role: "SALE" } });
    if (sales.length === 0) {
      throw new Error("Hệ thống chưa có Tài khoản Sale nào để gán trường học");
    }

    const dataToCreate = [];

    for (const r of records) {
      if (!r.saleName) {
        throw new Error(`Trường học "${r.name}" thiếu Tên Sale`);
      }

      const found = sales.find(
        s => s.name.toLowerCase() === r.saleName!.toLowerCase() || 
             s.username.toLowerCase() === r.saleName!.toLowerCase()
      );

      if (!found) {
        throw new Error(`Nhân viên sale "${r.saleName}" không tồn tại (áp dụng cho trường: ${r.name})`);
      }

      dataToCreate.push({
        name: r.name,
        address: r.address || "",
        principalName: "",
        contractNumber: "",
        oldStudents: 0,
        newStudents: 0,
        saleId: found.id,
      });
    }

    const result = await prisma.school.createMany({
      data: dataToCreate,
    });

    revalidatePath("/admin/schools");
    return { success: true, count: result.count };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi nhập danh sách trường học từ Excel" };
  }
}



