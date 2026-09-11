import { z } from "zod";

/**
 * Shape of the model's structured itinerary output, stored verbatim as
 * GeneratedItinerary.itinerary. Shared by /api/itinerary (validation) and the
 * planner/admin UIs (type-only imports, so zod stays out of client bundles).
 */
export const ItineraryOutputSchema = z.object({
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
  // Catalog package slugs that genuinely fit the trip — empty for a custom trip
  // (anywhere in India). Cross-checked against the DB in the route; the model
  // choosing these is a *recommendation* and never sets the price.
  recommendedPackageSlugs: z.array(z.string()).max(3),
});

export type ItineraryContent = z.infer<typeof ItineraryOutputSchema>;
