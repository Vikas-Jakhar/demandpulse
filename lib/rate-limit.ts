/**
 * Rate limiting for the two routes that cost real money or real CPU per
 * call: /api/copilot (an Anthropic API call) and /api/forecast (a
 * multi-candidate backtest). This implementation is an in-memory sliding
 * window — intentionally simple, and honestly scoped:
 *
 * IT ONLY WORKS CORRECTLY ON A SINGLE SERVER INSTANCE. Each process has its
 * own in-memory Map, so a multi-instance deployment (multiple Vercel
 * lambdas, a scaled-out container fleet) gives every instance its own
 * independent quota — a user could get N requests per instance rather than
 * N total. That's fine for a single-instance deploy or local dev; it is
 * NOT fine for real production traffic behind a load balancer.
 *
 * For real production use, swap `checkRateLimit` below for a call to a
 * shared store — Upstash Redis's `@upstash/ratelimit` is the standard
 * choice on Vercel and elsewhere, and has the same "check, return
 * {allowed, retryAfterMs}" shape this function does, so callers
 * (routes using `enforceRateLimit`) wouldn't need to change.
 */
import { NextResponse } from "next/server";

interface WindowEntry {
  count: number;
  windowStartMs: number;
}

const store = new Map<string, WindowEntry>();

// Periodic cleanup so the in-memory Map doesn't grow unbounded across a
// long-lived process — without this, every distinct rate-limit key (e.g.
// every user id that's ever called the API) stays in memory forever.
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupIfDue(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now - entry.windowStartMs > windowMs) store.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * Fixed-window rate limit: `limit` requests per `windowMs` per `key`.
 * `key` should be something like `${route}:${userId}` so different routes
 * (and different users) don't share a quota.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  cleanupIfDue(windowMs);

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStartMs >= windowMs) {
    store.set(key, { count: 1, windowStartMs: now });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: windowMs - (now - entry.windowStartMs) };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, retryAfterMs: 0 };
}

// Per-route limits. Copilot is the tighter budget since it's the one
// calling out to a paid external API on every request.
export const RATE_LIMITS = {
  copilot: { limit: 20, windowMs: 60_000 }, // 20 messages/min/user
  forecast: { limit: 30, windowMs: 60_000 }, // 30 forecast runs/min/user
} as const;

/**
 * Route-handler convenience wrapper: checks the limit for `route` + `userId`
 * and returns a ready-to-return 429 NextResponse if it's exceeded, or null
 * if the request should proceed. Usage at the top of a route handler:
 *
 *   const limited = enforceRateLimit("copilot", session.sub);
 *   if (limited) return limited;
 */
export function enforceRateLimit(route: keyof typeof RATE_LIMITS, userId: string) {
  const { limit, windowMs } = RATE_LIMITS[route];
  const result = checkRateLimit(`${route}:${userId}`, limit, windowMs);

  if (!result.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429, headers: { "Retry-After": Math.ceil(result.retryAfterMs / 1000).toString() } }
    );
  }
  return null;
}
