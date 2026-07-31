"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { clearCache } from "@/lib/cache";

function safeRevalidate(paths: string[]) {
  clearCache();
  for (const p of paths) {
    try {
      revalidatePath(p);
    } catch {
      // ignore standalone context revalidate error
    }
  }
}

export async function createItem(data: any) {
  try {
    if (!data.name || !data.standardPrice) {
      throw new Error("Vui lòng điền đầy đủ thông tin thiết bị (Tên, Đơn giá)");
    }
    const existingItem = await prisma.item.findFirst({
      where: {
        name: { equals: data.name, mode: "insensitive" },
        specifications: { equals: data.specifications || "", mode: "insensitive" },
      }
    });
    if (existingItem) {
      throw new Error(`Thiết bị "${data.name}" với cấu hình này đã tồn tại trong hệ thống!`);
    }

    const code = data.code || `TB-${Date.now().toString().slice(-6)}`;
    const newItem = await prisma.item.create({
      data: {
        code,
        name: data.name,
        specifications: data.specifications || "",
        accessories: data.accessories || "",
        unit: data.unit || "Bộ",
        standardPrice: Number(data.standardPrice) || 0,
        projectName: data.projectName || "IPRO",
      },
    });

    safeRevalidate(["/admin/items", "/sale/items"]);
    return { success: true, item: JSON.parse(JSON.stringify(newItem)) };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi tạo thiết bị" };
  }
}

export async function createOtherInvestment(data: any) {
  try {
    if (!data.name || !data.description || !data.unit || !data.standardPrice) {
      throw new Error("Vui lòng điền đầy đủ thông tin hạng mục (Tên, Mô tả, Đơn vị tính, Đơn giá)");
    }
    const category = data.category || "INVESTMENT";
    const existingInv = await prisma.otherInvestment.findFirst({
      where: {
        name: { equals: data.name, mode: "insensitive" },
        description: { equals: data.description || "", mode: "insensitive" },
        category
      }
    });
    if (existingInv) {
      throw new Error(`Hạng mục "${data.name}" với mô tả này đã tồn tại!`);
    }

    const newInv = await prisma.otherInvestment.create({
      data: {
        name: data.name,
        description: data.description,
        unit: data.unit,
        standardPrice: Number(data.standardPrice) || 0,
        category,
      },
    });

    safeRevalidate(["/admin/items", "/admin/investments", "/admin/constructions"]);
    return { success: true, investment: JSON.parse(JSON.stringify(newInv)) };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi tạo hạng mục" };
  }
}

export async function deleteOtherInvestment(id: string) {
  try {
    await prisma.otherInvestment.delete({
      where: { id },
    });
    safeRevalidate(["/admin/investments", "/admin/constructions", "/admin/items"]);
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi xóa hạng mục" };
  }
}

export async function deleteItem(id: string) {
  try {
    await prisma.item.delete({
      where: { id },
    });
    safeRevalidate(["/admin/items", "/sale/items"]);
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi xóa thiết bị" };
  }
}

export async function updateItem(id: string, data: any) {
  try {
    if (!data.name || !data.standardPrice) {
      throw new Error("Vui lòng điền đầy đủ thông tin thiết bị (Tên, Đơn giá)");
    }
    const existingItem = await prisma.item.findFirst({
      where: {
        name: { equals: data.name, mode: "insensitive" },
        specifications: { equals: data.specifications || "", mode: "insensitive" },
        id: { not: id }
      }
    });
    if (existingItem) {
      throw new Error(`Thiết bị "${data.name}" với cấu hình này đã tồn tại trong hệ thống!`);
    }

    const updateData: any = {
      name: data.name,
      specifications: data.specifications || "",
      accessories: data.accessories || "",
      unit: data.unit || "Bộ",
      standardPrice: Number(data.standardPrice) || 0,
      projectName: data.projectName || "IPRO",
    };
    if (data.code) {
      updateData.code = data.code;
    }

    const updated = await prisma.item.update({
      where: { id },
      data: updateData,
    });

    safeRevalidate(["/admin/items", "/sale/items"]);
    return { success: true, item: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi cập nhật thiết bị" };
  }
}

export async function updateOtherInvestment(id: string, data: any) {
  try {
    if (!data.name || !data.description || !data.unit || !data.standardPrice) {
      throw new Error("Vui lòng điền đầy đủ thông tin hạng mục (Tên, Mô tả, Đơn vị tính, Đơn giá)");
    }
    const category = data.category || "INVESTMENT";
    const existingInv = await prisma.otherInvestment.findFirst({
      where: {
        name: { equals: data.name, mode: "insensitive" },
        description: { equals: data.description || "", mode: "insensitive" },
        id: { not: id },
        category
      }
    });
    if (existingInv) {
      throw new Error(`Hạng mục "${data.name}" với mô tả này đã tồn tại!`);
    }

    const updated = await prisma.otherInvestment.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        unit: data.unit,
        standardPrice: Number(data.standardPrice) || 0,
        category,
      },
    });

    safeRevalidate(["/admin/investments", "/admin/constructions", "/admin/items"]);
    return { success: true, investment: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi cập nhật hạng mục" };
  }
}

export async function importItemsBulk(records: { code?: string; name: string; specifications?: string; accessories?: string; standardPrice: number; projectName?: string }[]) {
  try {
    const dataToCreate = records.map((r: any, idx) => ({
      code: r.code || `TB-${Date.now().toString().slice(-6)}-${idx + 1}`,
      name: r.name,
      specifications: r.specifications || "",
      accessories: r.accessories || "",
      unit: r.unit || "Bộ",
      standardPrice: Number(r.standardPrice) || 0,
      projectName: r.projectName || "IPRO",
    }));

    const result = await prisma.item.createMany({
      data: dataToCreate,
      skipDuplicates: true,
    });

    safeRevalidate(["/admin/items", "/sale/items"]);
    return { success: true, count: result.count };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi nhập danh sách thiết bị từ Excel" };
  }
}

export async function importOtherInvestmentsBulk(
  records: { name: string; description?: string; unit?: string; standardPrice: number }[],
  category: string = "INVESTMENT"
) {
  try {
    const dataToCreate = records.map(r => ({
      name: r.name,
      description: r.description || "",
      unit: r.unit || "Gói",
      standardPrice: Number(r.standardPrice) || 0,
      category,
    }));

    const result = await prisma.otherInvestment.createMany({
      data: dataToCreate,
    });

    safeRevalidate(["/admin/investments", "/admin/constructions", "/admin/items"]);
    return { success: true, count: result.count };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi nhập danh sách từ Excel" };
  }
}
