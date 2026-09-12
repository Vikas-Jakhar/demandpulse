import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { AuthUser, SessionPayload } from "@/types";

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

/**
 * Sessions are stateless signed JWTs, not database-backed session rows.
 * That's a deliberate tradeoff for this phase: it avoids a Session table
 * and a lookup on every request, at the cost that a compromised token can't
 * be revoked before it expires (8h TTL bounds the blast radius). If you
 * need real revocation (force-logout-everywhere, admin-initiated logout),
 * that's a Phase 2.5 addition: a `Session` model keyed by a token ID, checked
 * here after the signature verifies.
 */
export async function createSession(user: AuthUser): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
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
    httpOnly: true, // inaccessible to client-side JS — the core XSS mitigation for session theft
    secure: process.env.NODE_ENV === "production", // HTTPS-only in production
    sameSite: "lax", // sent on top-level navigation, not on cross-site subrequests — mitigates CSRF
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
    // Covers expired, malformed, and signature-mismatched tokens alike —
    // all of them mean "treat this request as unauthenticated."
    return null;
  }
}

/** Reads and verifies the session cookie for use in Server Components / Route Handlers. */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export { SESSION_COOKIE, SESSION_TTL_SECONDS };
