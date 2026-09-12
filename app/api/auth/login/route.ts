import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import type { AuthUser } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof loginSchema>;
  try {
    body = loginSchema.parse(await req.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid input." }, { status: 400 });
    }
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });

    // Deliberately identical error and status for "no such user" and "wrong
    // password" — a distinct "that email isn't registered" message lets an
    // attacker enumerate which emails have accounts on the platform.
    const invalidCredentials = () =>
      NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    if (!user) {
      return invalidCredentials();
    }

    const passwordValid = await verifyPassword(body.password, user.passwordHash);
    if (!passwordValid) {
      return invalidCredentials();
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const authUser: AuthUser = { id: user.id, name: user.name, email: user.email };
    const token = await createSession(authUser);
    await setSessionCookie(token);

    return NextResponse.json({ user: authUser });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
