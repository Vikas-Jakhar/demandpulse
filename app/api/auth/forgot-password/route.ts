import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { createResetToken } from "@/lib/auth/reset-token";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset";

const requestSchema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  let email: string;
  try {
    ({ email } = requestSchema.parse(await req.json()));
  } catch {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const genericResponse = (devToken?: string) =>
    NextResponse.json({
      message: "If an account exists for that email, a reset link is on its way.",
      devToken: process.env.NODE_ENV !== "production" ? devToken : undefined,
    });

  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return genericResponse();
    }

    const token = await createResetToken(user.id, user.email);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
    const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

    await sendPasswordResetEmail(user.email, resetUrl).catch((err) => {
      console.error("Failed to send password reset email:", err);
    });

    return genericResponse(token);
  } catch (err) {
    console.error("Forgot-password error:", err);
    return genericResponse();
  }
}
