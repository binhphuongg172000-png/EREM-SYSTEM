"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { clearCache } from "@/lib/cache";
import crypto from "crypto";

export async function createProposal(data: any) {
  try {
    const cookieStore = await cookies();
    const saleId = cookieStore.get("userId")?.value;
    if (!saleId) throw new Error("Chưa đăng nhập");

    const proposalId = crypto.randomUUID();

    const ops: any[] = [
      prisma.school.update({
        where: { id: data.schoolId },
        data: {
          investedClassrooms: Number(data.schoolDetails?.investedClassrooms) || 0,
          oldStudents: Number(data.schoolDetails?.oldStudents) || 0,
          newStudents: Number(data.schoolDetails?.newStudents) || 0,
        }
      }),
      prisma.proposal.updateMany({
        where: { schoolId: data.schoolId },
        data: { status: "CLOSED" }
      }),
      prisma.proposal.create({
        data: {
          id: proposalId,
          schoolId: data.schoolId,
          saleId: saleId,
          status: "PENDING",
          allocatedBudget: data.allocatedBudget,
          investedBudget: data.investedBudget,
          investedClassrooms: Number(data.schoolDetails?.investedClassrooms) || 0,
          oldStudents: Number(data.schoolDetails?.oldStudents) || 0,
          newStudents: Number(data.schoolDetails?.newStudents) || 0,
        },
      })
    ];

    if (data.items && data.items.length > 0) {
      ops.push(
        prisma.proposalItem.createMany({
          data: data.items.map((i: any) => ({
            proposalId,
            name: i.name,
            specifications: i.specifications || "",
            accessories: i.accessories || "",
            quantity: Number(i.quantity),
            price: Number(i.price),
            totalPrice: Number(i.quantity) * Number(i.price),
          })),
        })
      );
    }

    if (data.investments && data.investments.length > 0) {
      ops.push(
        prisma.proposalInvestment.createMany({
          data: data.investments.map((i: any) => ({
            proposalId,
            name: i.name,
            description: i.specifications || i.description || "",
            quantity: Number(i.quantity),
            price: Number(i.price),
            totalPrice: Number(i.quantity) * Number(i.price),
          })),
        })
      );
    }

    await prisma.$transaction(ops);

    clearCache();
    revalidatePath("/sale/dashboard");
    revalidatePath("/admin/dashboard");
    revalidatePath("/sale/proposals");
    revalidatePath("/admin/proposals");
    revalidatePath("/sale/proposals/new");
    revalidatePath("/", "layout");
    
    return { success: true, id: proposalId };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi tạo dự trù" };
  }
}

export async function updateProposal(id: string, data: any) {
  try {
    const existing = await prisma.proposal.findUnique({
      where: { id },
      include: { school: true }
    });
    if (!existing) throw new Error("Không tìm thấy hồ sơ dự trù");
    if (existing.school?.isLocked) throw new Error("Hồ sơ này thuộc Trường đã bị Admin khóa đóng băng dữ liệu");

    await prisma.$transaction(async (tx) => {
      await tx.proposalItem.deleteMany({ where: { proposalId: id } });
      await tx.proposalInvestment.deleteMany({ where: { proposalId: id } });

      await tx.proposal.update({
        where: { id },
        data: {
          allocatedBudget: data.allocatedBudget,
          investedBudget: data.investedBudget,
        },
      });

      if (data.items && data.items.length > 0) {
        await tx.proposalItem.createMany({
          data: data.items.map((i: any) => ({
            proposalId: id,
            name: i.name,
            specifications: i.specifications || "",
            accessories: i.accessories || "",
            quantity: i.quantity,
            price: i.price,
 totalPrice: i.quantity * i.price,
          })),
        });
      }

      if (data.investments && data.investments.length > 0) {
        await tx.proposalInvestment.createMany({
          data: data.investments.map((i: any) => ({
            proposalId: id,
            name: i.name,
            description: i.description || "",
            quantity: i.quantity,
            price: i.price,
            totalPrice: i.quantity * i.price,
          })),
        });
      }
    });

    clearCache();
    revalidatePath("/sale/dashboard");
    revalidatePath("/admin/dashboard");
    revalidatePath("/sale/proposals");
    revalidatePath("/admin/proposals");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi cập nhật dự trù" };
  }
}

export async function deleteProposalSale(id: string) {
  try {
    const existing = await prisma.proposal.findUnique({
      where: { id },
      include: { school: true }
    });
    if (!existing) throw new Error("Không tìm thấy hồ sơ dự trù");
    if (existing.school?.isLocked) throw new Error("Hồ sơ này thuộc Trường đã bị Admin khóa đóng băng dữ liệu");

    await prisma.proposal.delete({ where: { id } });

    clearCache();
    revalidatePath("/sale/dashboard");
    revalidatePath("/admin/dashboard");
    revalidatePath("/sale/proposals");
    revalidatePath("/admin/proposals");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi xóa dự trù" };
  }
}
