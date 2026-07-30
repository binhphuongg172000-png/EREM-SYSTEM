import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Lightweight prewarm endpoint - returns immediately to prevent DB connection pool exhaustion
  return NextResponse.json({ success: true, timestamp: Date.now() });
}
