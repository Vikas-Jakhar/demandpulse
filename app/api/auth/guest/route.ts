import { NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import type { AuthUser } from "@/types";

/**
 * Demo Guest Mode: issues a signed session with no signup and no database
 * row. `isGuest: true` is the flag the rest of the app checks to decide
 * what a guest can and can't do.
 *
 * Open design question for Phase 3: a guest's `id` here (`guest_xxxxxxxx`)
 * does not correspond to any row in the `User` table, so it CANNOT be used
 * as a foreign key once dataset ingestion starts writing to Postgres — a
 * `Dataset.userId` pointing at a nonexistent user would violate the
 * foreign-key constraint in schema.prisma. Before Phase 3 lands, decide
 * one of:
 *   (a) guests get a real, ephemeral User row created here (cleaned up by
 *       a scheduled job after some TTL), so their uploads persist like
 *       anyone else's for the session, or
 *   (b) guest mode stays read-only / sample-data-only and never calls the
 *       dataset-persistence routes at all.
 * Nothing below forces either answer yet — this route still works standalone
 * for browsing the UI with mock data, which is all it needs to do today.
 */
export async function POST() {
  const guestUser: AuthUser = {
    id: `guest_${crypto.randomUUID().slice(0, 8)}`,
    name: "Guest Viewer",
    email: "guest@demandpulse.io",
    isGuest: true,
  };

  const token = await createSession(guestUser);
  await setSessionCookie(token);

  return NextResponse.json({ user: guestUser });
}
