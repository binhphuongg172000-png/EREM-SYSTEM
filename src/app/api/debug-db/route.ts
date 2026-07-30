import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const dbUrl = process.env.DATABASE_URL || "NOT_SET";
  const maskedUrl = dbUrl.replace(/:[^:@]+@/, ":****@");

  let proposalsCount = -1;
  let rawProposals: any[] = [];
  let errorMsg = null;

  try {
    rawProposals = await prisma.proposal.findMany({
      select: {
        id: true,
        projectName: true,
        newStudents: true,
        allocatedBudget: true,
        investedBudget: true,
        school: { select: { id: true, name: true, newStudents: true } },
        sale: { select: { id: true, name: true } },
      },
    });
    proposalsCount = rawProposals.length;
  } catch (err: any) {
    errorMsg = err?.message || String(err);
  }

  return NextResponse.json({
    dbUrl: maskedUrl,
    proposalsCount,
    rawProposals,
    errorMsg,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}
