import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";

const VERIFICATION_TOKEN_TTL_HOURS = 24;

export async function createVerificationToken(email: string): Promise<string> {
  // Invalidate any existing verification tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { email: email.toLowerCase() },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_HOURS * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: {
      email: email.toLowerCase(),
      token,
      expiresAt,
    },
  });

  return token;
}

export async function verifyEmailToken(token: string): Promise<{ success: boolean; email?: string; error?: string }> {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record) {
    return { success: false, error: "Invalid or expired verification token." };
  }

  if (new Date() > record.expiresAt) {
    await prisma.verificationToken.delete({ where: { id: record.id } });
    return { success: false, error: "Verification token has expired. Please request a new one." };
  }

  // Mark user as email verified
  const user = await prisma.user.update({
    where: { email: record.email },
    data: { emailVerified: new Date() },
  });

  // Delete used token
  await prisma.verificationToken.delete({ where: { id: record.id } });

  return { success: true, email: user.email };
}
