import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { createSession, setSessionCookie } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error || "Google sign-in was cancelled.")}`, req.url));
  }

  // Validate state
  const storedState = cookies().get("dp_oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(new URL("/login?error=Invalid+OAuth+state+parameter.", req.url));
  }
  cookies().delete("dp_oauth_state");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?error=Google+OAuth+is+not+configured.", req.url));
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error("Google token exchange error:", errText);
      return NextResponse.redirect(new URL("/login?error=Failed+to+exchange+Google+token.", req.url));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch Google user profile
    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userinfoResponse.ok) {
      return NextResponse.redirect(new URL("/login?error=Failed+to+fetch+Google+user+profile.", req.url));
    }

    const profile = await userinfoResponse.json();
    const email = profile.email?.toLowerCase();
    const name = profile.name || profile.given_name || "Google User";
    const picture = profile.picture || null;

    if (!email) {
      return NextResponse.redirect(new URL("/login?error=No+email+provided+by+Google.", req.url));
    }

    // 3. Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          image: picture,
          provider: "google",
          emailVerified: new Date(),
          lastLoginAt: new Date(),
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          image: picture || user.image,
          emailVerified: user.emailVerified || new Date(),
        },
      });
    }

    // 4. Create protected session
    const sessionToken = await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: !!user.emailVerified,
      provider: "google",
      image: user.image,
    });

    await setSessionCookie(sessionToken);

    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (err) {
    console.error("Google callback exception:", err);
    return NextResponse.redirect(new URL("/login?error=Google+authentication+failed.", req.url));
  }
}
