import { NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import type { AuthUser } from "@/types";

/** Demo Guest Mode: issues a scoped, read-only session with no signup required. */
export async function POST() {
  const guestUser: AuthUser = {
    id: `guest_${crypto.randomUUID().slice(0, 8)}`,
    name: "Guest Viewer",
    email: "guest@demandpulse.io",
    role: "VIEWER",
    orgId: "org_demo",
    isGuest: true,
  };

  const token = await createSession(guestUser);
  await setSessionCookie(token);

  return NextResponse.json({ user: guestUser });
}
