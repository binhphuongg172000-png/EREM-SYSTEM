"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/app/actions/auth";
import { clearCache } from "@/lib/cache";

export async function approveProposal(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return { success: false, message: "Chỉ ADMIN mới có quyền thực hiện thao tác này." };
    }

    await prisma.proposal.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    clearCache();
    revalidatePath("/admin/proposals");
    revalidatePath(`/admin/proposals/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function rejectProposal(id: string, reason: string) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return { success: false, message: "Chỉ ADMIN mới có quyền thực hiện thao tác này." };
    }

    await prisma.proposal.update({
      where: { id },
      data: { 
        status: "REJECTED",
        rejectReason: reason
      },
    });

    clearCache();
    revalidatePath("/admin/proposals");
    revalidatePath(`/admin/proposals/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function lockProposal(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return { success: false, message: "Chỉ ADMIN mới có quyền thay đổi trạng thái dự trù." };
    }

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

    clearCache();
    revalidatePath("/admin/proposals");
    revalidatePath("/admin/schools");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi đóng băng dự trù" };
  }
}

export async function completeProposal(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return { success: false, message: "Chỉ ADMIN mới có quyền thay đổi trạng thái dự trù." };
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: { school: true }
    });
    if (!proposal) throw new Error("Không tìm thấy dự trù");

    await prisma.$transaction([
      prisma.proposal.update({
        where: { id },
        data: { status: "COMPLETED" },
      }),
      prisma.school.update({
        where: { id: proposal.schoolId },
        data: { isLocked: true },
      })
    ]);

    clearCache();
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
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return { success: false, message: "Chỉ ADMIN mới có quyền thay đổi trạng thái dự trù." };
    }

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

    clearCache();
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
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return { success: false, message: "Chỉ ADMIN mới có quyền thay đổi trạng thái dự trù." };
    }

    await prisma.proposal.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    clearCache();
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
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return { success: false, message: "Chỉ Super Admin mới có quyền xóa dự trù." };
    }

    await prisma.proposal.delete({
      where: { id },
    });
    clearCache();
    revalidatePath("/admin/proposals");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi xóa bản dự trù" };
  }
}
