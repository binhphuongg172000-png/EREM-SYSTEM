import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const t0 = Date.now();
  const steps: Record<string, number> = {};

  try {
    // Step 1: connect check
    await prisma.$connect();
    steps.connect = Date.now() - t0;

    // Step 2: simple query
    const t1 = Date.now();
    const result = await prisma.$queryRaw<[{ region: string }]>`
      SELECT current_setting('server_version') as region
    `;
    steps.query = Date.now() - t1;

    // Step 3: user table query  
    const t2 = Date.now();
    const count = await prisma.user.count();
    steps.userCount = Date.now() - t2;
    steps.total = Date.now() - t0;

    // Show DB URL region (masked password)
    const dbUrl = process.env.DATABASE_URL || "";
    const regionMatch = dbUrl.match(/ap-southeast-\d/);
    const hostMatch = dbUrl.match(/@([^:\/]+)/);

    return NextResponse.json({
      ok: true,
      timing: steps,
      dbRegion: regionMatch?.[0] || "unknown",
      dbHost: hostMatch?.[1]?.replace(/postgres\.[a-z0-9]+/, "postgres.***") || "unknown",
      userCount: count,
      serverTime: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err?.message,
      timing: steps,
    }, { status: 500 });
  }
}
