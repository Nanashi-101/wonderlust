import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redisClient: Redis | null = null;

function getRedis(): Redis | null {
  if (redisClient) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redisClient = new Redis({ url, token });
  return redisClient;
}

const limiters = new Map<string, Ratelimit>();

function getLimiter(key: string, limit: number, windowSec: number): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const cacheKey = `${key}:${limit}:${windowSec}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: `wonderlust:${key}`,
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Epoch ms when the window resets. */
  reset: number;
}

/**
 * Sliding-window rate limit backed by Upstash Redis.
 *
 * Returns `{ success: true, ... }` (a no-op pass) when UPSTASH_REDIS_REST_URL/
 * TOKEN aren't set — same graceful-absence pattern as Resend/Stripe/Razorpay,
 * so the app works before that account exists. Once configured, limits
 * actually enforce.
 */
export async function checkRateLimit(
  identifier: string,
  { key, limit, windowSec }: { key: string; limit: number; windowSec: number }
): Promise<RateLimitResult> {
  const limiter = getLimiter(key, limit, windowSec);
  if (!limiter) {
    return { success: true, limit, remaining: limit, reset: Date.now() + windowSec * 1000 };
  }

  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/** Builds a `Retry-After`-bearing 429 for a failed checkRateLimit() result. */
export function rateLimitResponse(result: RateLimitResult): Response {
  const retryAfterSec = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
  return Response.json(
    { error: "RATE_LIMITED" },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
  );
}
