import { PrismaClient } from "@prisma/client";

/**
 * Next.js dev mode hot-reloads modules on every file change, which would
 * normally instantiate a brand new PrismaClient (and a brand new DB
 * connection pool) on every save — quickly exhausting Postgres's
 * max_connections. Stashing the client on `globalThis` in development
 * survives the module reload and reuses the same instance. In production,
 * each server process gets exactly one client, which is what we want.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
