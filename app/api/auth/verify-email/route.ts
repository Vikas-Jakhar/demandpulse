import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/auth/verification-token";
import { getCurrentSession, createSession, setSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing_token", req.url));
  }

  const result = await verifyEmailToken(token);
  if (!result.success) {
    return NextResponse.redirect(new URL(`/verify-email?error=${encodeURIComponent(result.error || "failed")}`, req.url));
  }

  // If user is currently signed in, refresh their session to reflect emailVerified: true
  const session = await getCurrentSession();
  if (session && session.email.toLowerCase() === result.email?.toLowerCase()) {
    const updatedUser = await prisma.user.findUnique({ where: { email: result.email } });
    if (updatedUser) {
      const newToken = await createSession({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        emailVerified: !!updatedUser.emailVerified,
        provider: updatedUser.provider,
        image: updatedUser.image,
      });
      await setSessionCookie(newToken);
    }
  }

  return NextResponse.redirect(new URL("/verify-email?verified=true", req.url));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token;
    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }

    const result = await verifyEmailToken(token);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Refresh session if logged in
    const session = await getCurrentSession();
    if (session && session.email.toLowerCase() === result.email?.toLowerCase()) {
      const updatedUser = await prisma.user.findUnique({ where: { email: result.email } });
      if (updatedUser) {
        const newToken = await createSession({
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          emailVerified: !!updatedUser.emailVerified,
          provider: updatedUser.provider,
          image: updatedUser.image,
        });
        await setSessionCookie(newToken);
      }
    }

    return NextResponse.json({ success: true, email: result.email });
  } catch (err) {
    console.error("verify-email error:", err);
    return NextResponse.json({ error: "Failed to verify email." }, { status: 500 });
  }
}
