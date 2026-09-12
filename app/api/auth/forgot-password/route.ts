import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { createResetToken } from "@/lib/auth/reset-token";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset";

const requestSchema = z.object({ email: z.string().email() });

/**
 * POST /api/auth/forgot-password — always responds with the same generic
 * success message, whether or not the email belongs to a real account.
 * A distinct "no account with that email" response would let an attacker
 * enumerate which addresses are registered; this route trades that away
 * deliberately, the same reasoning already applied to /api/auth/login's
 * "invalid email or password" (rather than "no such user").
 */
export async function POST(req: NextRequest) {
  let email: string;
  try {
    ({ email } = requestSchema.parse(await req.json()));
  } catch {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const genericResponse = NextResponse.json({
    message: "If an account exists for that email, a reset link is on its way.",
  });

  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return genericResponse; // silent no-op — see enumeration note above
    }

    const token = await createResetToken(user.id, user.email);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
    const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

    // Best-effort: a failed email send shouldn't turn into a different
    // response than the "email doesn't exist" case above (see enumeration
    // note), so this is caught and logged, not surfaced to the caller.
    await sendPasswordResetEmail(user.email, resetUrl).catch((err) => {
      console.error("Failed to send password reset email:", err);
    });

    return genericResponse;
  } catch (err) {
    console.error("Forgot-password error:", err);
    return genericResponse; // still generic, even on an unexpected server error
  }
}
