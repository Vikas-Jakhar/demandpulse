import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import type { AuthUser } from "@/types";

const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof signupSchema>;
  try {
    body = signupSchema.parse(await req.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid input." }, { status: 400 });
    }
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  const strength = validatePasswordStrength(body.password);
  if (!strength.valid) {
    return NextResponse.json({ error: strength.reason }, { status: 400 });
  }

  try {
    const passwordHash = await hashPassword(body.password);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
      },
    });

    const authUser: AuthUser = { id: user.id, name: user.name, email: user.email };
    const token = await createSession(authUser);
    await setSessionCookie(token);

    return NextResponse.json({ user: authUser }, { status: 201 });
  } catch (err) {
    // Prisma's unique-constraint violation code, thrown when the email
    // column's @unique index rejects a duplicate — race-safe in a way an
    // upfront findUnique-then-create check on its own is not (two signups
    // for the same email arriving concurrently would both pass a prior
    // existence check; only the DB constraint is authoritative).
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
