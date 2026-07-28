"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getCachedData } from "@/lib/cache";
import { cache } from "react";

export async function loginAction(data: any) {
  try {
    const username = data?.username?.trim();
    const password = data?.password;

    if (!username || !password) {
      return { success: false, message: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu." };
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        role: true,
        status: true,
        name: true,
      },
    });

    if (!user) {
      return { success: false, message: "Tên đăng nhập hoặc mật khẩu không đúng." };
    }

    if (user.status !== "ACTIVE") {
      return { success: false, message: "Tài khoản của bạn đã bị khóa." };
    }

    let isValidPassword = password === user.password;
    if (!isValidPassword && user.password.startsWith("$2")) {
      isValidPassword = await bcrypt.compare(password, user.password);
    }

    if (!isValidPassword) {
      return { success: false, message: "Tên đăng nhập hoặc mật khẩu không đúng." };
    }

    // Set cookies for session
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

    return { success: true, user: { id: user.id, role: user.role, name: user.name } };
  } catch (error: any) {
    console.error("Login action error:", error);
    return { success: false, message: "Lỗi hệ thống: " + (error?.message || String(error)) };
  }
}

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;
  
  return getCachedData(`current_user_${userId}`, async () => {
    return prisma.user.findUnique({ where: { id: userId } });
  }, 30);
});

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("userId");
  cookieStore.delete("userRole");
  return { success: true };
}
