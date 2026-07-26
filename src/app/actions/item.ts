"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createItem(data: any) {
  try {
    if (!data.name || !data.specifications || !data.standardPrice) {
      throw new Error("Vui lòng điền đầy đủ thông tin thiết bị (Tên, Quy cách kỹ thuật, Đơn giá)");
    }
    const existingName = await prisma.item.findFirst({
      where: { name: { equals: data.name, mode: "insensitive" } }
    });
    if (existingName) {
      throw new Error(`Tên thiết bị "${data.name}" đã tồn tại! Vui lòng chọn tên khác.`);
    }

    const code = data.code || `TB-${Date.now().toString().slice(-6)}`;
    const newItem = await prisma.item.create({
      data: {
        code,
        name: data.name,
        specifications: data.specifications,
        accessories: data.accessories || "",
        standardPrice: Number(data.standardPrice) || 0,
      },
    });

    revalidatePath("/admin/items");
    return { success: true, item: newItem };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi tạo thiết bị" };
  }
}

export async function createOtherInvestment(data: any) {
  try {
    if (!data.name || !data.description || !data.unit || !data.standardPrice) {
      throw new Error("Vui lòng điền đầy đủ thông tin hạng mục (Tên, Mô tả, Đơn vị tính, Đơn giá)");
    }
    const existingName = await prisma.otherInvestment.findFirst({
      where: { name: { equals: data.name, mode: "insensitive" } }
    });
    if (existingName) {
      throw new Error(`Tên hạng mục "${data.name}" đã tồn tại! Vui lòng chọn tên khác.`);
    }

    const newInv = await prisma.otherInvestment.create({
      data: {
        name: data.name,
        description: data.description,
        unit: data.unit,
        standardPrice: Number(data.standardPrice) || 0,
      },
    });

    revalidatePath("/admin/items");
    revalidatePath("/admin/investments");
    return { success: true, investment: newInv };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi tạo hạng mục đầu tư khác" };
  }
}

export async function deleteOtherInvestment(id: string) {
  try {
    await prisma.otherInvestment.delete({
      where: { id },
    });
    revalidatePath("/admin/investments");
    revalidatePath("/admin/items");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi xóa hạng mục đầu tư khác" };
  }
}

export async function deleteItem(id: string) {
  try {
    await prisma.item.delete({
      where: { id },
    });
    revalidatePath("/admin/items");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi xóa thiết bị" };
  }
}

export async function updateItem(id: string, data: any) {
  try {
    if (!data.name || !data.specifications || !data.standardPrice) {
      throw new Error("Vui lòng điền đầy đủ thông tin thiết bị (Tên, Quy cách kỹ thuật, Đơn giá)");
    }
    const existingName = await prisma.item.findFirst({
      where: { name: { equals: data.name, mode: "insensitive" }, id: { not: id } }
    });
    if (existingName) {
      throw new Error(`Tên thiết bị "${data.name}" đã tồn tại! Vui lòng chọn tên khác.`);
    }

    const updateData: any = {
      name: data.name,
      specifications: data.specifications,
      accessories: data.accessories || "",
      standardPrice: Number(data.standardPrice) || 0,
    };
    if (data.code) {
      updateData.code = data.code;
    }

    const updated = await prisma.item.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/items");
    return { success: true, item: updated };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi cập nhật thiết bị" };
  }
}

export async function updateOtherInvestment(id: string, data: any) {
  try {
    if (!data.name || !data.description || !data.unit || !data.standardPrice) {
      throw new Error("Vui lòng điền đầy đủ thông tin hạng mục (Tên, Mô tả, Đơn vị tính, Đơn giá)");
    }
    const existingName = await prisma.otherInvestment.findFirst({
      where: { name: { equals: data.name, mode: "insensitive" }, id: { not: id } }
    });
    if (existingName) {
      throw new Error(`Tên hạng mục "${data.name}" đã tồn tại! Vui lòng chọn tên khác.`);
    }

    const updated = await prisma.otherInvestment.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        unit: data.unit,
        standardPrice: Number(data.standardPrice) || 0,
      },
    });

    revalidatePath("/admin/investments");
    revalidatePath("/admin/items");
    return { success: true, investment: updated };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi cập nhật hạng mục đầu tư khác" };
  }
}

export async function importItemsBulk(records: { code?: string; name: string; specifications?: string; accessories?: string; standardPrice: number }[]) {
  try {
    const dataToCreate = records.map((r, idx) => ({
      code: r.code || `TB-${Date.now().toString().slice(-6)}-${idx + 1}`,
      name: r.name,
      specifications: r.specifications || "",
      accessories: r.accessories || "",
      standardPrice: Number(r.standardPrice) || 0,
    }));

    const result = await prisma.item.createMany({
      data: dataToCreate,
      skipDuplicates: true,
    });

    revalidatePath("/admin/items");
    return { success: true, count: result.count };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi nhập danh sách thiết bị từ Excel" };
  }
}

export async function importOtherInvestmentsBulk(records: { name: string; description?: string; unit?: string; standardPrice: number }[]) {
  try {
    const dataToCreate = records.map(r => ({
      name: r.name,
      description: r.description || "",
      unit: r.unit || "Gói",
      standardPrice: Number(r.standardPrice) || 0,
    }));

    const result = await prisma.otherInvestment.createMany({
      data: dataToCreate,
    });

    revalidatePath("/admin/investments");
    revalidatePath("/admin/items");
    return { success: true, count: result.count };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi nhập danh sách đầu tư khác từ Excel" };
  }
}


