import bcrypt from "bcryptjs";

// 12 rounds is the current baseline recommendation for bcrypt in a
// production login path (10 is the bcryptjs default and is on the low side
// for 2026 hardware). Each increment roughly doubles hashing cost, so this
// is a deliberate cost/latency tradeoff, not an arbitrary number.
const SALT_ROUNDS = 12;

export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

/**
 * Minimum password policy enforced at signup. Kept as a pure function
 * (rather than baked into the zod schema) so the same rule can be surfaced
 * to the signup form for live client-side feedback later without importing
 * zod into a client component.
 */
export function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  if (password.length < 8) {
    return { valid: false, reason: "Password must be at least 8 characters." };
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, reason: "Password must include both letters and numbers." };
  }
  return { valid: true };
}
