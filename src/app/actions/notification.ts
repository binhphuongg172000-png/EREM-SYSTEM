"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";
import { revalidatePath } from "next/cache";

// In-memory fallback store for instant zero-config real-time notifications
const memoryNotifications: Array<{
  id: string;
  userId?: string | null;
  title: string;
  message: string;
  type: string;
  proposalId?: string | null;
  schoolName?: string | null;
  read: boolean;
  createdAt: string;
}> = [];

export async function getNotifications(limit: number = 15) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, notifications: [], unreadCount: 0 };

    if ((prisma as any).notification) {
      const dbNotifs = await (prisma as any).notification.findMany({
        where: {
          OR: [
            { userId: user.id },
            { userId: null }
          ]
        },
        orderBy: { createdAt: "desc" },
        take: limit
      });

      const unreadCount = await (prisma as any).notification.count({
        where: {
          OR: [
            { userId: user.id },
            { userId: null }
          ],
          read: false
        }
      });

      return { 
        success: true, 
        notifications: JSON.parse(JSON.stringify(dbNotifs)), 
        unreadCount 
      };
    } else {
      // Memory fallback
      const userNotifs = memoryNotifications
        .filter((n) => !n.userId || n.userId === user.id)
        .slice(0, limit);
      const unreadCount = userNotifs.filter((n) => !n.read).length;
      return { success: true, notifications: userNotifs, unreadCount };
    }
  } catch (error: any) {
    const user = await getCurrentUser();
    const userNotifs = memoryNotifications
      .filter((n) => !n.userId || (user && n.userId === user.id))
      .slice(0, limit);
    const unreadCount = userNotifs.filter((n) => !n.read).length;
    return { success: true, notifications: userNotifs, unreadCount };
  }
}

export async function createNotification(data: {
  userId?: string | null;
  title: string;
  message: string;
  type?: string;
  proposalId?: string | null;
  schoolName?: string | null;
}) {
  try {
    const notifObj = {
      id: "notif_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      userId: data.userId || null,
      title: data.title,
      message: data.message,
      type: data.type || "STATUS_CHANGE",
      proposalId: data.proposalId || null,
      schoolName: data.schoolName || null,
      read: false,
      createdAt: new Date().toISOString()
    };

    memoryNotifications.unshift(notifObj);

    if ((prisma as any).notification) {
      await (prisma as any).notification.create({
        data: {
          userId: data.userId || null,
          title: data.title,
          message: data.message,
          type: data.type || "STATUS_CHANGE",
          proposalId: data.proposalId || null,
          schoolName: data.schoolName || null,
          read: false
        }
      }).catch(() => {});
    }

    return { success: true, notification: notifObj };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const user = await getCurrentUser();
    memoryNotifications.forEach((n) => {
      if (!user || !n.userId || n.userId === user.id) {
        n.read = true;
      }
    });

    if (user && (prisma as any).notification) {
      await (prisma as any).notification.updateMany({
        where: {
          OR: [
            { userId: user.id },
            { userId: null }
          ],
          read: false
        },
        data: { read: true }
      }).catch(() => {});
    }

    revalidatePath("/sale/dashboard");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    const found = memoryNotifications.find((n) => n.id === id);
    if (found) found.read = true;

    if ((prisma as any).notification) {
      await (prisma as any).notification.update({
        where: { id },
        data: { read: true }
      }).catch(() => {});
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
