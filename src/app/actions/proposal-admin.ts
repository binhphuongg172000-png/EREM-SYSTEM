"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function approveProposal(id: string) {
  try {
    await prisma.proposal.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    // TODO: Write Audit Log
    revalidatePath("/admin/proposals");
    revalidatePath(`/admin/proposals/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function rejectProposal(id: string, reason: string) {
  try {
    await prisma.proposal.update({
      where: { id },
      data: { 
        status: "REJECTED",
        rejectReason: reason
      },
    });

    // TODO: Write Audit Log
    revalidatePath("/admin/proposals");
    revalidatePath(`/admin/proposals/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function lockProposal(id: string) {
  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: { school: true }
    });
    if (!proposal) throw new Error("Không tìm thấy dự trù");

    await prisma.$transaction([
      prisma.proposal.update({
        where: { id },
        data: { status: "APPROVED" },
      }),
      prisma.school.update({
        where: { id: proposal.schoolId },
        data: { isLocked: true },
      })
    ]);

    revalidatePath("/admin/proposals");
    revalidatePath("/admin/schools");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi đóng băng dự trù" };
  }
}

export async function completeProposal(id: string) {
  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: { school: true }
    });
    if (!proposal) throw new Error("Không tìm thấy dự trù");
    if (!proposal.school?.isLocked) throw new Error("Trường chưa được khóa, không thể hoàn thành");

    await prisma.proposal.update({
      where: { id },
      data: { status: "COMPLETED" },
    });

    revalidatePath("/admin/proposals");
    revalidatePath(`/admin/proposals/${id}`);
    revalidatePath("/sale/proposals");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi chuyển trạng thái hoàn thành" };
  }
}

export async function unlockProposal(id: string) {
  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: { school: true }
    });
    if (!proposal) throw new Error("Không tìm thấy dự trù");

    await prisma.$transaction([
      prisma.proposal.update({
        where: { id },
        data: { status: "PENDING" },
      }),
      prisma.school.update({
        where: { id: proposal.schoolId },
        data: { isLocked: false },
      })
    ]);

    revalidatePath("/admin/proposals");
    revalidatePath("/admin/schools");
    revalidatePath("/sale/proposals");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi mở khóa dự trù" };
  }
}

export async function revertToLocked(id: string) {
  try {
    await prisma.proposal.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    revalidatePath("/admin/proposals");
    revalidatePath(`/admin/proposals/${id}`);
    revalidatePath("/sale/proposals");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi chuyển trạng thái" };
  }
}

export async function deleteProposalAdmin(id: string) {
  try {
    await prisma.proposal.delete({
      where: { id },
    });
    revalidatePath("/admin/proposals");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi xóa bản dự trù" };
  }
}

