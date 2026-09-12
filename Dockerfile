# DemandPulse — production Dockerfile
# Multi-stage build: install deps once, build once, ship a minimal runtime
# image with only what's needed to run the production server.

# ── deps ────────────────────────────────────────────────────────────────
FROM node:20-slim AS deps
WORKDIR /app
# openssl is required by Prisma's query engine at runtime on Debian-slim.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
RUN npm ci

# ── build ───────────────────────────────────────────────────────────────
FROM node:20-slim AS builder
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma needs its client generated against schema.prisma before `next build`
# touches any route that imports @prisma/client.
RUN npx prisma generate
# DATABASE_URL isn't queried at build time (nothing is statically
# prerendered against the DB), but some env-validation setups still expect
# a non-empty value in scope — pass a placeholder via --build-arg if your
# pipeline requires it.
RUN npm run build

# ── runtime ─────────────────────────────────────────────────────────────
FROM node:20-slim AS runner
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 3000

# Relies on `output: "standalone"` in next.config.js, which produces a
# self-contained server.js with only the production deps actually used —
# that setting is added below in the same commit as this Dockerfile.
CMD ["node", "server.js"]
