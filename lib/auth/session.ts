import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { AuthUser, SessionPayload, Role } from "@/types";

const SESSION_COOKIE = "demandpulse_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set. Generate one with `openssl rand -base64 32` and add it to .env.local"
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(user: AuthUser): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    orgId: user.orgId,
    isGuest: user.isGuest ?? false,
  } satisfies Omit<SessionPayload, "exp">)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(getSecret());

  return token;
}

export async function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Reads and verifies the session cookie for use in Server Components / Route Handlers. */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function hasRole(session: SessionPayload | null, allowed: Role[]): boolean {
  if (!session) return false;
  return allowed.includes(session.role);
}

export { SESSION_COOKIE };
