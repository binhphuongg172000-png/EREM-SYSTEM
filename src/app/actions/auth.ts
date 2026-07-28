"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getCachedData } from "@/lib/cache";
import { warmAdminSystem, warmSaleSystem } from "@/lib/prewarmer";
import { cache } from "react";

export async function loginAction(data: any) {
  try {
    const user = await getCachedData(`login_user_${data.username}`, async () => {
      return prisma.user.findUnique({
        where: { username: data.username },
      });
    }, 60);

    if (!user) {
      return { success: false, message: "Tên đăng nhập hoặc mật khẩu không đúng." };
    }

    if (user.status !== "ACTIVE") {
      return { success: false, message: "Tài khoản của bạn đã bị khóa." };
    }

    let isValidPassword = data.password === user.password;
    if (!isValidPassword && user.password.startsWith("$2")) {
      isValidPassword = await bcrypt.compare(data.password, user.password);
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

    // Fire background prewarmer asynchronously (do not await)
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      warmAdminSystem();
    } else {
      warmSaleSystem(user.id);
    }

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
