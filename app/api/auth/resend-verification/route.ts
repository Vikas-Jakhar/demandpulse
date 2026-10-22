import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createVerificationToken } from "@/lib/auth/verification-token";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";
import { getCurrentSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    let email: string | undefined;

    // Check body or session
    try {
      const body = await req.json();
      email = body.email;
    } catch {
      // ignore
    }

    if (!email) {
      const session = await getCurrentSession();
      email = session?.email;
    }

    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't leak existence
      return NextResponse.json({ message: "Verification link sent if account exists." });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Account is already verified." });
    }

    const token = await createVerificationToken(user.email);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const verifyUrl = `${appUrl}/verify-email?token=${encodeURIComponent(token)}`;

    await sendVerificationEmail(user.email, verifyUrl);

    return NextResponse.json({
      message: "Verification email sent.",
      devToken: process.env.NODE_ENV !== "production" ? token : undefined,
    });
  } catch (err) {
    console.error("resend-verification error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
