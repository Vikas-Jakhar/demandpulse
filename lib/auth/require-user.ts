import { NextResponse } from "next/server";
import { getCurrentSession } from "./session";
import type { SessionPayload } from "@/types";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Resolves the current session or throws. Route handlers should call this
 * first, before touching Prisma, rather than relying solely on
 * `middleware.ts` to have blocked the request — middleware protects by URL
 * pattern and is easy to misconfigure or forget to update when a route
 * moves; a check at the top of the handler itself can't be bypassed that
 * way. Pair with `toUnauthorizedResponse` in a try/catch, or use
 * `withAuth` below to avoid repeating the boilerplate.
 */
export async function requireUser(): Promise<SessionPayload> {
  const session = await getCurrentSession();
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

export function toUnauthorizedResponse(err: unknown): NextResponse | null {
  if (err instanceof UnauthorizedError) {
    return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
  }
  return null;
}

/**
 * Wraps a route handler with the requireUser() check, so individual routes
 * don't each re-implement the try/catch. The verified session is passed as
 * the second argument alongside the usual (req) signature:
 *
 *   export const GET = withAuth(async (req, session) => {
 *     const datasets = await prisma.dataset.findMany({ where: { userId: session.sub } });
 *     return NextResponse.json({ datasets });
 *   });
 */
export function withAuth<Args extends unknown[]>(
  handler: (req: Request, session: SessionPayload, ...args: Args) => Promise<NextResponse>
) {
  return async (req: Request, ...args: Args): Promise<NextResponse> => {
    try {
      const session = await requireUser();
      return await handler(req, session, ...args);
    } catch (err) {
      const unauthorized = toUnauthorizedResponse(err);
      if (unauthorized) return unauthorized;
      console.error("Unhandled error in protected route:", err);
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
  };
}
