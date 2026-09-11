import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { env } from "@/lib/env";
import { requireUser } from "@/lib/auth/user";
import { guardAiRequest } from "@/lib/ai/limits";
import { getPackageCatalogContext } from "@/lib/ai/catalog";
import { prisma } from "@/lib/db";
import { ItineraryOutputSchema } from "@/lib/ai/itinerary";

export const runtime = "nodejs";
export const maxDuration = 60;

const PreferencesSchema = z.object({
  destination: z.string().max(200).optional(),
  budgetINR: z.number().positive().optional(),
  budgetTier: z.enum(["budget", "comfort", "premium", "luxury"]).optional(),
  durationDays: z.number().int().positive().max(60).optional(),
  groupSize: z.number().int().positive().max(50).optional(),
  groupType: z.enum(["solo", "couple", "family", "friends"]).optional(),
  travelMonth: z.string().max(20).optional(),
  interests: z.array(z.string().max(40)).max(12).optional(),
  notes: z.string().max(1000).optional(),
});

export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

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

  const refused = await guardAiRequest("itinerary", user.id);
  if (refused) return refused;

  const catalog = await getPackageCatalogContext();

  let generated;
  try {
    const result = await generateObject({
      model: anthropic("claude-sonnet-5"),
      schema: ItineraryOutputSchema,
      system: [
        "You design custom multi-day travel itineraries anywhere in India for Wonderlust Expeditions.",
        "Plan realistic days: sensible travel times between places, the season, and the traveller's group, pace and budget.",
        "If no destination is given, choose one in India that fits the other preferences.",
        "",
        "These are our bookable packages:",
        catalog,
        "",
        "recommendedPackageSlugs: include up to 3 slugs from the list above only when a package genuinely fits this trip, otherwise return an empty array.",
        "Never invent a package, slug or price, and don't quote prices anywhere in the itinerary.",
      ].join("\n"),
      prompt: `Design an itinerary for a traveller with these preferences: ${JSON.stringify(preferences)}`,
    });
    generated = result.object;
  } catch (err) {
    console.error("[itinerary] generation failed:", err);
    return Response.json({ error: "GENERATION_FAILED" }, { status: 502 });
  }

  // The model's slugs are only a recommendation: keep just the ones that are real,
  // active packages. A hallucinated slug is dropped rather than priced.
  const suggested = generated.recommendedPackageSlugs;
  const packages =
    suggested.length > 0
      ? await prisma.package.findMany({ where: { slug: { in: suggested }, active: true } })
      : [];
  const realSlugs = new Set(packages.map((p) => p.slug));
  const dropped = suggested.filter((slug) => !realSlugs.has(slug));
  if (dropped.length > 0) {
    console.warn("[itinerary] dropped unknown package slug(s):", dropped);
  }
  const itinerary = { ...generated, recommendedPackageSlugs: suggested.filter((slug) => realSlugs.has(slug)) };

  // Server-computed from real package rows — never the model's own number. No
  // matching package means a custom trip, unpriced until the team quotes it.
  const currency = packages[0]?.currency ?? "INR";
  const totalPriceMinor =
    packages.length > 0 ? packages.reduce((sum, pkg) => sum + pkg.priceFromMinor, 0) : null;

  const draft = await prisma.generatedItinerary.create({
    data: {
      userId: user.id,
      title: itinerary.title,
      preferences: preferences,
      itinerary,
      totalPriceMinor,
      currency,
      approved: false, // never bookable until an admin approves it — see A2
    },
  });

  return Response.json({
    id: draft.id,
    approved: false,
    itinerary,
    totalPriceMinor,
    currency,
  });
}
