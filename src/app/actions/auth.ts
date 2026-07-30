"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { cache } from "react";
import { getCachedData } from "@/lib/cache";
import bcrypt from "bcryptjs";

export async function loginAction(data: { username?: string; password?: string } | FormData) {
  let username = "";
  let password = "";

  if (data instanceof FormData) {
    username = (data.get("username") as string) || "";
    password = (data.get("password") as string) || "";
  } else if (data && typeof data === "object") {
    username = data.username || "";
    password = data.password || "";
  }

  if (!username || !password) {
    return { success: false, message: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return { success: false, message: "Tài khoản không tồn tại trên hệ thống" };
    }

    if (user.status === "LOCKED") {
      return { success: false, message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin" };
    }

    // Check password matching (supports bcrypt hash or direct plain text fallback)
    let isValidPassword = false;
    if (user.password.startsWith("$2b$") || user.password.startsWith("$2a$")) {
      isValidPassword = await bcrypt.compare(password, user.password);
    } else {
      isValidPassword = (user.password === password);
    }

    if (!isValidPassword) {
      return { success: false, message: "Mật khẩu không chính xác" };
    }

    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";
    
    cookieStore.set("userId", user.id, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    cookieStore.set("userRole", user.role, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return { success: true, user: { id: user.id, role: user.role, name: user.name } };
  } catch (error: any) {
    console.error("Login action error:", error);
    return { success: false, message: "Lỗi hệ thống: " + (error?.message || String(error)) };
  }
}

export async function warmupAction() {
  return { success: true };
}

export const getCurrentUser = cache(async () => {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) return null;
    
    return await getCachedData(`current_user_${userId}`, async () => {
      return prisma.user.findUnique({ where: { id: userId } });
    }, 30);
  } catch (e) {
    console.error("getCurrentUser error:", e);
    return null;
  }
});

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("userId");
    cookieStore.delete("userRole");
  } catch (e) {
    console.error("logoutAction error:", e);
  }
  return { success: true };
}
