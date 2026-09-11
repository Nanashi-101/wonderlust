import { checkRateLimit, isRateLimitConfigured, rateLimitResponse } from "@/lib/rate-limit";

/**
 * Spend guards for the Claude-backed routes, protecting the prepaid Anthropic
 * credit. Two layers:
 *  - per user: one account can't drain the credit on its own
 *  - site-wide per rolling 24h: caps total spend even across many accounts/bots
 * Anthropic's console spend limit remains the hard backstop behind both.
 */
type AiRoute = "chat" | "itinerary";

const PER_USER = {
  chat: { limit: 30, windowSec: 60 * 60 },
  itinerary: { limit: 5, windowSec: 24 * 60 * 60 },
} as const;

const DAILY_DEFAULTS: Record<AiRoute, number> = { chat: 200, itinerary: 30 };
const DAILY_ENV: Record<AiRoute, string> = {
  chat: "AI_DAILY_CHAT_LIMIT",
  itinerary: "AI_DAILY_ITINERARY_LIMIT",
};

function dailyLimit(route: AiRoute): number {
  const n = Number(process.env[DAILY_ENV[route]]);
  return Number.isInteger(n) && n > 0 ? n : DAILY_DEFAULTS[route];
}

/**
 * Returns the Response to send when the request must be refused, or null to
 * proceed. Call it after input validation, so malformed requests don't burn quota.
 */
export async function guardAiRequest(route: AiRoute, userId: string): Promise<Response | null> {
  // Without Redis every limit is a silent no-op. In production that would mean
  // unmetered spend, so refuse instead; local dev keeps working without it.
  if (!isRateLimitConfigured() && process.env.NODE_ENV === "production") {
    return Response.json(
      { error: "AI_NOT_CONFIGURED", message: "Rate limiting (Upstash) is not configured." },
      { status: 503 }
    );
  }

  const perUser = await checkRateLimit(`${route}:${userId}`, {
    key: `${route}-user`,
    ...PER_USER[route],
  });
  if (!perUser.success) return rateLimitResponse(perUser);

  const daily = await checkRateLimit(`${route}:site`, {
    key: `${route}-daily`,
    limit: dailyLimit(route),
    windowSec: 24 * 60 * 60,
  });
  if (!daily.success) return rateLimitResponse(daily, "AI_DAILY_LIMIT");

  return null;
}
