import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { verifyResetToken } from "@/lib/auth/reset-token";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";

const requestSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

/**
 * POST /api/auth/reset-password — verifies the short-lived token
 * (reset-token.ts), applies the new password, and that's it. Deliberately
 * does NOT log the user in automatically afterward — sending them back to
 * /login with their new password is a more conservative default than
 * silently issuing a session, and avoids this endpoint doubling as an
 * unintended login path if a reset link is somehow replayed.
 *
 * Note: because sessions are stateless JWTs (see session.ts), any session
 * issued before this reset stays valid until its own 8-hour expiry — this
 * route has no way to revoke it. That's the same documented tradeoff as
 * everywhere else stateless sessions show up in this app.
 */
export async function POST(req: NextRequest) {
  let body: z.infer<typeof requestSchema>;
  try {
    body = requestSchema.parse(await req.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid request." }, { status: 400 });
    }
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  const strength = validatePasswordStrength(body.password);
  if (!strength.valid) {
    return NextResponse.json({ error: strength.reason }, { status: 400 });
  }

  const payload = await verifyResetToken(body.token);
  if (!payload) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Request a new one." },
      { status: 400 }
    );
  }

  try {
    const passwordHash = await hashPassword(body.password);
    await prisma.user.update({
      where: { id: payload.sub },
      data: { passwordHash },
    });
    return NextResponse.json({ message: "Password updated. You can now sign in." });
  } catch (err) {
    console.error("Reset-password error:", err);
    return NextResponse.json({ error: "Failed to update password. Please try again." }, { status: 500 });
  }
}
