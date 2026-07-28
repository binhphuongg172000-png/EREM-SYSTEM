"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { clearCache } from "@/lib/cache";

export async function deleteHandoverAdmin(id: string) {
  try {
    await prisma.handover.delete({
      where: { id },
    });
    revalidatePath("/admin/handovers");
    revalidatePath("/sale/handovers");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi xóa biên bản bàn giao" };
  }
}

export async function createHandover(data: {
  proposalId: string;
  schoolId: string;
  senderId?: string;
  receiverId?: string;
}) {
  try {
    const cookieStore = await cookies();
    const currentUserId = cookieStore.get("userId")?.value;
    if (!currentUserId) throw new Error("Chưa đăng nhập");

    const sender = data.senderId || currentUserId;
    const receiver = data.receiverId || sender;
    // Cập nhật các biên bản cũ của trường này thành SUPERSEDED
    await prisma.handover.updateMany({
      where: { 
        schoolId: data.schoolId,
        status: { in: ["PENDING", "CONFIRMED"] }
      },
      data: { status: "SUPERSEDED" }
    });

    // Tạo biên bản mới
    const handover = await prisma.handover.create({
      data: {
        proposalId: data.proposalId,
        schoolId: data.schoolId,
        senderId: sender,
        receiverId: receiver,
        status: "PENDING",
      }
    });

    clearCache();
    revalidatePath("/sale/handovers");
    revalidatePath("/admin/handovers");
    return { success: true, handoverId: handover.id };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi tạo biên bản bàn giao" };
  }
}
