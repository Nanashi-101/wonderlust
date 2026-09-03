import { describe, expect, it } from "vitest";

describe("checkRateLimit without Upstash configured", () => {
  it("always allows (no-op) rather than blocking the app", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const { checkRateLimit } = await import("@/lib/rate-limit");
    const result = await checkRateLimit("user_1", { key: "checkout", limit: 10, windowSec: 60 });

    expect(result.success).toBe(true);
    expect(result.limit).toBe(10);
    expect(result.remaining).toBe(10);
  });
});

describe("rateLimitResponse", () => {
  it("returns 429 with a Retry-After header", async () => {
    const { rateLimitResponse } = await import("@/lib/rate-limit");
    const res = rateLimitResponse({ success: false, limit: 10, remaining: 0, reset: Date.now() + 30_000 });

    expect(res.status).toBe(429);
    const retryAfter = Number(res.headers.get("Retry-After"));
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(30);
  });
});
