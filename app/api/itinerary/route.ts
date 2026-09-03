import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { env } from "@/lib/env";
import { requireUser } from "@/lib/auth/user";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getPackageCatalogContext } from "@/lib/ai/catalog";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

const PreferencesSchema = z.object({
  destination: z.string().max(200).optional(),
  budgetINR: z.number().positive().optional(),
  durationDays: z.number().int().positive().optional(),
  groupSize: z.number().int().positive().optional(),
  interests: z.array(z.string()).optional(),
  notes: z.string().max(1000).optional(),
});

const ItineraryOutputSchema = z.object({
  title: z.string(),
  summary: z.string(),
  days: z
    .array(
      z.object({
        day: z.number().int().min(1),
        title: z.string(),
        detail: z.string(),
      })
    )
    .min(1),
  // Must reference real catalog package slugs — cross-checked against the DB below.
  // The model choosing these is a *recommendation*; it never sets the price.
  recommendedPackageSlugs: z.array(z.string()).min(1).max(3),
});

export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(`itinerary:${user.id}`, {
    key: "itinerary",
    limit: 5,
    windowSec: 3600,
  });
  if (!rateLimit.success) return rateLimitResponse(rateLimit);

  if (!env.ANTHROPIC_API_KEY) {
    return Response.json(
      {
        error: "AI_NOT_CONFIGURED",
        message: "ANTHROPIC_API_KEY is not set — itinerary generation isn't live yet.",
      },
      { status: 503 }
    );
  }

  const parsedInput = PreferencesSchema.safeParse(await req.json());
  if (!parsedInput.success) {
    return Response.json({ error: "INVALID_INPUT", issues: parsedInput.error.issues }, { status: 400 });
  }
  const preferences = parsedInput.data;

  const catalog = await getPackageCatalogContext();

  let generated;
  try {
    const result = await generateObject({
      model: anthropic("claude-sonnet-5"),
      schema: ItineraryOutputSchema,
      system: [
        "You design custom multi-day travel itineraries for Wonderlust Expeditions,",
        "built strictly from this real package catalog — never invent a package, price,",
        "or slug that isn't listed:",
        "",
        catalog,
        "",
        "recommendedPackageSlugs must contain only slugs that appear above.",
      ].join("\n"),
      prompt: `Design an itinerary for a traveller with these preferences: ${JSON.stringify(preferences)}`,
    });
    generated = result.object;
  } catch (err) {
    console.error("[itinerary] generation failed:", err);
    return Response.json({ error: "GENERATION_FAILED" }, { status: 502 });
  }

  // Schema conformance doesn't guarantee the slugs are real — verify against
  // the DB before this is ever persisted or priced. A hallucinated slug here
  // fails the request rather than silently pricing a fictional package.
  const packages = await prisma.package.findMany({
    where: { slug: { in: generated.recommendedPackageSlugs }, active: true },
  });
  const foundSlugs = new Set(packages.map((p) => p.slug));
  const invalidSlugs = generated.recommendedPackageSlugs.filter((slug) => !foundSlugs.has(slug));

  if (invalidSlugs.length > 0 || packages.length === 0) {
    console.error("[itinerary] model referenced unknown package slug(s):", invalidSlugs);
    return Response.json({ error: "INVALID_GENERATED_OUTPUT" }, { status: 422 });
  }

  // Server-computed from real package rows — never the model's own number.
  const currency = packages[0].currency;
  const totalPriceMinor = packages.reduce((sum, pkg) => sum + pkg.priceFromMinor, 0);

  const draft = await prisma.generatedItinerary.create({
    data: {
      userId: user.id,
      title: generated.title,
      preferences: preferences,
      itinerary: generated,
      totalPriceMinor,
      currency,
      approved: false, // never bookable until an admin approves it — see A2
    },
  });

  return Response.json({
    id: draft.id,
    approved: false,
    itinerary: generated,
    totalPriceMinor,
    currency,
  });
}
