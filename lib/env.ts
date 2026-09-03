import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Env validation
//
// Parsed once at server boot (see instrumentation.ts) so a missing/misconfigured
// var fails fast with a readable message instead of surfacing later as a cryptic
// runtime error deep in Prisma/Kinde/R2. Keep this in sync with .env.example —
// every var below should exist there, and vice versa.
// ─────────────────────────────────────────────────────────────────────────────

const serverSchema = z.object({
  // --- Database (Postgres) ---
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().min(1, "DIRECT_URL is required"),

  // --- Auth (Kinde) ---
  KINDE_CLIENT_ID: z.string().min(1, "KINDE_CLIENT_ID is required"),
  KINDE_CLIENT_SECRET: z.string().min(1, "KINDE_CLIENT_SECRET is required"),
  KINDE_ISSUER_URL: z.string().min(1, "KINDE_ISSUER_URL is required"),
  KINDE_SITE_URL: z.string().min(1, "KINDE_SITE_URL is required"),
  // Optional — next.config.ts derives sane defaults from KINDE_SITE_URL when unset.
  KINDE_POST_LOGIN_REDIRECT_URL: z.string().optional(),
  KINDE_POST_LOGOUT_REDIRECT_URL: z.string().optional(),

  // --- Object storage (Cloudflare R2) ---
  CLOUDFLARE_R2_ACCOUNT_ID: z.string().min(1, "CLOUDFLARE_R2_ACCOUNT_ID is required"),
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().min(1, "CLOUDFLARE_R2_ACCESS_KEY_ID is required"),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().min(1, "CLOUDFLARE_R2_SECRET_ACCESS_KEY is required"),
  CLOUDFLARE_R2_BUCKET_NAME: z.string().min(1, "CLOUDFLARE_R2_BUCKET_NAME is required"),
  // Optional — lib/r2.ts falls back to NEXT_PUBLIC_R2_PUBLIC_URL, then to a raw R2 URL.
  CLOUDFLARE_R2_PUBLIC_DOMAIN: z.string().optional(),

  // --- Email (Resend) ---
  // All optional by design — unset, lib/email/send.ts no-ops with a logged warning
  // and the app still runs.
  RESEND_API_KEY: z.string().optional(),
  EMAIL_REPLY_TO: z.string().optional(),
  ADMIN_ALERT_TO: z.string().optional(),

  // --- Payments (Stripe intl / Razorpay India) ---
  // Optional for now — M5/M6 is scaffolded (adapters, checkout route, webhooks)
  // but not live. lib/payments/stripe.ts and razorpay.ts throw a clear error if
  // actually invoked without these, same graceful-absence pattern as Resend.
  // Once payments go live, promote these to required (drop .optional()).
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().optional(),

  // --- Rate limiting (Upstash Redis) ---
  // Optional — lib/rate-limit.ts no-ops (always allows) without these.
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // --- AI (chatbot + itinerary generation) ---
  // Optional — app/api/chat and app/api/itinerary return a clear 503 without this,
  // same graceful-absence pattern as the rest. Untested without a real key.
  ANTHROPIC_API_KEY: z.string().optional(),

  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const clientSchema = z.object({
  // Optional — lib/package-utils.ts and lib/r2.ts fall back to CLOUDFLARE_R2_PUBLIC_DOMAIN.
  NEXT_PUBLIC_R2_PUBLIC_URL: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

function reportAndThrow(error: z.ZodError, label: string): never {
  const lines = error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`);
  throw new Error(
    `Invalid ${label} environment variables:\n${lines.join("\n")}\n\n` +
      "Check .env.example for the full list of required variables."
  );
}

function parseServerEnv(): ServerEnv {
  const result = serverSchema.safeParse(process.env);
  if (!result.success) reportAndThrow(result.error, "server");
  return result.data;
}

function parseClientEnv(): ClientEnv {
  const result = clientSchema.safeParse({
    NEXT_PUBLIC_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });
  if (!result.success) reportAndThrow(result.error, "client");
  return result.data;
}

export const clientEnv: ClientEnv = parseClientEnv();

/**
 * Server-only env. A client component that imports this either crashes (the
 * vars were never sent to the browser) or, worse, leaks a secret into the
 * client bundle. The type system can't stop a "use client" file from importing
 * a server module, so this is guarded at runtime too.
 */
export const env: ServerEnv =
  typeof window === "undefined"
    ? parseServerEnv()
    : new Proxy({} as ServerEnv, {
        get(_target, prop) {
          throw new Error(
            `lib/env.ts: attempted to read server env var "${String(prop)}" from the client. ` +
              "Use clientEnv for NEXT_PUBLIC_* values instead."
          );
        },
      });
