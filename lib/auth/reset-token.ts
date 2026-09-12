import { SignJWT, jwtVerify } from "jose";

const RESET_TOKEN_TTL_SECONDS = 30 * 60; // 30 minutes — short enough to bound exposure if a reset link leaks

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set — required for signing password reset tokens too.");
  }
  return new TextEncoder().encode(secret);
}

export interface ResetTokenPayload {
  sub: string; // userId
  email: string;
  purpose: "password-reset";
  exp: number;
}

/**
 * Signs a short-lived, purpose-scoped token for the password reset flow.
 * Deliberately a distinct token type from the session cookie (session.ts) —
 * both are JWTs signed with the same SESSION_SECRET, but the `purpose`
 * claim means a reset token, if it ever leaked, could not also be replayed
 * as a login session, and a session token could not be replayed here to
 * reset a password. `verifyResetToken` checks this claim explicitly rather
 * than trusting "it's a validly signed JWT" alone.
 */
export async function createResetToken(userId: string, email: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + RESET_TOKEN_TTL_SECONDS;
  return new SignJWT({ sub: userId, email, purpose: "password-reset" } satisfies Omit<ResetTokenPayload, "exp">)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(getSecret());
}

export async function verifyResetToken(token: string): Promise<ResetTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.purpose !== "password-reset") return null;
    return payload as unknown as ResetTokenPayload;
  } catch {
    return null;
  }
}
