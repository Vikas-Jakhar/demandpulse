import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/health — deliberately unauthenticated (a load balancer or
 * orchestrator hitting this doesn't have a session cookie), and
 * deliberately NOT in middleware's protected-route list. Checks actual DB
 * connectivity via a trivial query rather than just returning 200
 * unconditionally — a process that's up but can't reach Postgres should
 * fail its health check and get cycled, not keep serving 500s to real users.
 */
export async function GET() {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      database: "connected",
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Health check: database unreachable:", err);
    return NextResponse.json(
      {
        status: "error",
        database: "unreachable",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
