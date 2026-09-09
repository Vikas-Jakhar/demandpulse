import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import type { AuthUser } from "@/types";

// Demo-mode user store. Replace with a Prisma lookup against the User model
// (see prisma/schema.prisma) once a database is provisioned:
//   const user = await prisma.user.findUnique({ where: { email } })
const DEMO_USERS: (AuthUser & { passwordHash: string })[] = [
  {
    id: "user_admin_1",
    name: "Priya Shah",
    email: "admin@demandpulse.io",
    role: "ADMIN",
    orgId: "org_demo",
    // password: "demopass123"
    passwordHash: "$2a$10$xX3VYFq1r8G7Zb8b3o1F0.4y6r2z1B9Q1z1a0S8oX2Yy8g5J7q0Vi",
  },
];

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = loginSchema.parse(await req.json());
    const user = DEMO_USERS.find((u) => u.email.toLowerCase() === body.email.toLowerCase());

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const { passwordHash: _drop, ...authUser } = user;
    const token = await createSession(authUser);
    await setSessionCookie(token);

    return NextResponse.json({ user: authUser });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
    }
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
