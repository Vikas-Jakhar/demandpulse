import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { createSession, setSessionCookie } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  // If real Google OAuth credentials are provided, redirect to Google consent screen
  if (clientId && clientSecret) {
    const state = crypto.randomBytes(16).toString("hex");

    // Store state in an HTTP-only cookie to prevent CSRF
    cookies().set("dp_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("state", state);
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "select_account");

    return NextResponse.redirect(googleAuthUrl.toString());
  }

  // Developer / Demo Fallback:
  // When GOOGLE_CLIENT_ID is not yet configured in .env.local, provide a frictionless
  // Google sign-in demo experience so the feature is immediately testable.
  console.log(
    "\n[DemandPulse Auth] GOOGLE_CLIENT_ID not detected in environment.\n" +
      "Simulating Google OAuth Sign-In for demo testing.\n" +
      "To connect live Google Cloud credentials, set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local\n"
  );

  const demoEmail = "alex.google@demandpulse.io";
  let user = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Alex Vance (Google)",
        email: demoEmail,
        provider: "google",
        emailVerified: new Date(),
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        emailVerified: user.emailVerified || new Date(),
      },
    });
  }

  const token = await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: true,
    provider: "google",
    image: user.image,
  });

  await setSessionCookie(token);

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
