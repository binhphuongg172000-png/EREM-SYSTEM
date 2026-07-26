"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function loginAction(data: any) {
  try {
    const user = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (!user) {
      return { success: false, message: "Tên đăng nhập hoặc mật khẩu không đúng." };
    }

    if (user.status !== "ACTIVE") {
      return { success: false, message: "Tài khoản của bạn đã bị khóa." };
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);

    if (!isValidPassword) {
      return { success: false, message: "Tên đăng nhập hoặc mật khẩu không đúng." };
    }

    // Set cookies
    const cookieStore = await cookies();
    cookieStore.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    cookieStore.set("userRole", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return { success: true, user: { id: user.id, role: user.role } };
  } catch (error: any) {
    return { success: false, message: "Lỗi hệ thống: " + error.message };
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user && user.status !== "ACTIVE") return null;
  return user;
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("userId");
  cookieStore.delete("userRole");
  return { success: true };
}
