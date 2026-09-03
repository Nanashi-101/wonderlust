# syntax=docker/dockerfile:1.7

# ---------- deps ----------
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
# npm install, not ci: some platform-optional native deps (lightningcss, esbuild)
# resolve a different transitive chain on Linux than the Windows-generated
# lockfile encodes, which trips npm ci's stricter lockfile-completeness check
# even with matching npm versions — confirmed by testing both. npm install
# resolves and self-heals instead of hard-failing on that gap.
RUN --mount=type=cache,target=/root/.npm npm install

# ---------- builder ----------
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time public vars only — genuinely public (NEXT_PUBLIC_*) values baked into the
# client bundle. Real secrets (DATABASE_URL, KINDE_CLIENT_SECRET, RESEND_API_KEY, ...)
# are injected at runtime via env_file, never here. Add more NEXT_PUBLIC_* ARGs here as
# they're introduced (e.g. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, NEXT_PUBLIC_RAZORPAY_KEY_ID
# once M5/M6 land).
ARG NEXT_PUBLIC_R2_PUBLIC_URL
ENV NEXT_PUBLIC_R2_PUBLIC_URL=$NEXT_PUBLIC_R2_PUBLIC_URL \
    NEXT_TELEMETRY_DISABLED=1

# lib/env.ts validates all required server vars at module load (by design —
# CLAUDE.md M1 wants a bad config to fail fast at *build*, not just boot), and
# `next build`'s page-data-collection phase imports every route handler,
# including ones (like /api/webhooks/stripe) that import lib/env.ts. So the
# build needs every required var present, not just DATABASE_URL/DIRECT_URL for
# `prisma generate`. These are placeholders only, scoped to this build stage —
# they don't carry into the runner stage below, and none of this code actually
# connects out during build. Real secrets come from env_file at container
# start, when the standalone server freshly re-evaluates process.env.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    DIRECT_URL="postgresql://build:build@localhost:5432/build" \
    KINDE_CLIENT_ID="build-placeholder" \
    KINDE_CLIENT_SECRET="build-placeholder" \
    KINDE_ISSUER_URL="https://build-placeholder.kinde.com" \
    KINDE_SITE_URL="http://localhost:3000" \
    CLOUDFLARE_R2_ACCOUNT_ID="build-placeholder" \
    CLOUDFLARE_R2_ACCESS_KEY_ID="build-placeholder" \
    CLOUDFLARE_R2_SECRET_ACCESS_KEY="build-placeholder" \
    CLOUDFLARE_R2_BUCKET_NAME="build-placeholder"

RUN npx prisma generate
RUN npm run build          # requires output: "standalone" in next.config.ts

# ---------- runner ----------
FROM node:22-alpine AS runner
RUN apk add --no-cache openssl curl
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
