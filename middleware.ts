import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Edge middleware can't import the Prisma client (no Node.js runtime there),
// so this stays a lightweight signature check only — "is there a validly
// signed, unexpired session cookie at all." It's the first line of defense,
// blocking anonymous requests before they reach a route handler. The second
// line — "does this specific user own this specific resource" — lives in
// lib/auth/require-user.ts + lib/auth/ownership.ts and runs inside the
// route handler itself, where Prisma is available.
const SESSION_COOKIE = "demandpulse_session";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/api/forecast",
  "/api/forecasts",
  "/api/copilot",
  "/api/datasets",
  "/api/export",
];
const PUBLIC_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password", "/api/auth"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname === "/";
}

async function verify(token: string): Promise<boolean> {
  try {
    const secret = process.env.SESSION_SECRET;
    if (!secret) return false;
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname) && !isProtected(pathname)) {
    return NextResponse.next();
  }

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = token ? await verify(token) : false;

  if (!valid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/forecast/:path*",
    "/api/forecasts/:path*",
    "/api/copilot/:path*",
    "/api/datasets/:path*",
    "/api/export/:path*",
  ],
};
