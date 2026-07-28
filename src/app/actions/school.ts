"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { clearCache } from "@/lib/cache";

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

    clearCache();
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
    clearCache();
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

    clearCache();
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

    clearCache();
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
      throw new Error("Hệ thống chưa có Tài khoản Sale nào. Vui lòng tạo tài khoản Sale trước!");
    }

    const validSchoolsToCreate: any[] = [];
    const rejectedList: Array<{ name: string; reason: string }> = [];

    for (const r of records) {
      const targetSaleName = (r.saleName || "").trim();
      if (!targetSaleName) {
        rejectedList.push({
          name: r.name,
          reason: "Chưa điền Tên Sale trong file Excel",
        });
        continue;
      }

      const targetLower = targetSaleName.toLowerCase();

      // MUST STRICTLY MATCH SALE NAME OR USERNAME (EXACT MATCH ONLY)
      const matchedSale = sales.find(
        s => s.name.trim().toLowerCase() === targetLower || 
             s.username.trim().toLowerCase() === targetLower
      );

      // If NOT matched with an exact existing Sale account -> REJECT THIS ROW!
      if (!matchedSale) {
        rejectedList.push({
          name: r.name,
          reason: `Tên Sale "${r.saleName}" không khớp đúng với bất kỳ tài khoản Sale nào trên hệ thống`,
        });
        continue;
      }

      validSchoolsToCreate.push({
        name: r.name,
        address: r.address || "",
        principalName: "",
        contractNumber: "",
        oldStudents: 0,
        newStudents: 0,
        saleId: matchedSale.id,
      });
    }

    let successCount = 0;
    if (validSchoolsToCreate.length > 0) {
      const result = await prisma.school.createMany({
        data: validSchoolsToCreate,
      });
      successCount = result.count;
    }

    clearCache();
    revalidatePath("/admin/schools");

    return {
      success: true,
      successCount,
      rejectedCount: rejectedList.length,
      rejectedList,
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi nhập danh sách trường học từ Excel" };
  }
}

export async function getSaleNamesList() {
  try {
    const sales = await prisma.user.findMany({
      where: { role: "SALE" },
      select: { id: true, name: true, username: true },
      orderBy: { name: "asc" }
    });
    return sales;
  } catch {
    return [];
  }
}

