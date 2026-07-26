"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createUser(data: any) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUser) {
      throw new Error("Tên đăng nhập đã tồn tại");
    }

    if (data.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingEmail) {
        throw new Error("Email đã được sử dụng");
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        name: data.name,
        email: data.email || null,
        role: data.role,
        status: "ACTIVE",
      },
    });

    revalidatePath("/admin/users");
    return { success: true, user: newUser };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi tạo người dùng" };
  }
}

export async function updateUser(id: string, data: any) {
  try {
    const updateData: any = {
      name: data.name,
      email: data.email || null,
      role: data.role,
    };
    if (data.password && data.password.trim() !== "") {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/admin/users");
    return { success: true, user: updated };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi cập nhật người dùng" };
  }
}

export async function toggleUserStatus(id: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("Không tìm thấy người dùng");
    if (user.username === "admin") throw new Error("Không thể khóa tài khoản Admin tối cao");

    const newStatus = user.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
    await prisma.user.update({
      where: { id },
      data: { status: newStatus },
    });

    revalidatePath("/admin/users");
    return { success: true, newStatus };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi thay đổi trạng thái" };
  }
}

export async function deleteUser(id: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("Không tìm thấy người dùng");
    if (user.username === "admin") throw new Error("Không thể xóa tài khoản Admin tối cao");

    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Không thể xóa người dùng đã có dữ liệu liên quan" };
  }
}

