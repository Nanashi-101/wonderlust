import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/payments/money";

/**
 * The whole active catalog, formatted as a compact context block for the
 * chatbot's system prompt and the itinerary generator's prompt.
 *
 * This is retrieval by "inject the whole catalog" rather than a vector-search
 * RAG pipeline — with a handful of packages, embeddings/a vector store would
 * be infra for infra's sake. Revisit if the catalog grows to the point this
 * no longer fits comfortably in a prompt.
 */
export async function getPackageCatalogContext(): Promise<string> {
  const packages = await prisma.package.findMany({
    where: { active: true },
    select: {
      slug: true,
      title: true,
      destination: true,
      category: true,
      difficulty: true,
      durationDays: true,
      durationNights: true,
      priceFromMinor: true,
      currency: true,
      maxAltitudeFt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  if (packages.length === 0) return "No packages are currently available.";

  return packages
    .map((pkg) => {
      const altitude = pkg.maxAltitudeFt ? `, max altitude ${pkg.maxAltitudeFt}ft` : "";
      const price = formatMoney(pkg.priceFromMinor, pkg.currency, "en-IN");
      return `- "${pkg.title}" (slug: ${pkg.slug}) — ${pkg.destination}, ${pkg.category}, ${pkg.difficulty} difficulty, ${pkg.durationDays} days / ${pkg.durationNights} nights${altitude}, from ${price}`;
    })
    .join("\n");
}
