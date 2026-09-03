import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";

const STATIC_PATHS = ["", "/packages", "/gallery"];

// Queries the DB, so this must be dynamic (request-time), not statically
// prerendered at build time — a build environment (CI, Docker) has no
// reachable database, and static generation would otherwise go stale
// whenever a package is added without a full rebuild+redeploy.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const packages = await prisma.package.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true },
  });

  const alternates = (path: string) =>
    Object.fromEntries(routing.locales.map((locale) => [locale, `${siteUrl}/${locale}${path}`]));

  const staticEntries: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    STATIC_PATHS.map((path) => ({
      url: `${siteUrl}/${locale}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
      alternates: { languages: alternates(path) },
    }))
  );

  const packageEntries: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    packages.map((pkg) => ({
      url: `${siteUrl}/${locale}/packages/${pkg.slug}`,
      lastModified: pkg.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      alternates: { languages: alternates(`/packages/${pkg.slug}`) },
    }))
  );

  return [...staticEntries, ...packageEntries];
}
