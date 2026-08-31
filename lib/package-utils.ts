import { z } from "zod";
import { PackageCategory, Difficulty, type Package } from "@prisma/client";

export const packageInputSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  destination: z.string().min(2, "Destination is required"),
  category: z.nativeEnum(PackageCategory),
  imagePath: z.string().min(1, "Image path or URL is required"),
  durationDays: z.number().min(1, "Duration days must be at least 1"),
  durationNights: z.number().min(0, "Duration nights must be 0 or more"),
  difficulty: z.nativeEnum(Difficulty),
  maxAltitudeFt: z.number().nullable().optional(),
  priceFrom: z.number().min(1, "Price must be greater than 0"),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  description: z.string().min(10, "Description must be at least 10 characters"),
  highlights: z.array(z.string()).min(1, "At least 1 highlight is required"),
});

export type PackageInput = z.infer<typeof packageInputSchema>;

export type LocalisedPackage = ReturnType<typeof localisePackage>;

/**
 * Resolves an image path to either its full Cloudflare R2 public URL or relative path.
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/destination/Ladakh.png";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const r2Domain =
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
    process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN;

  if (r2Domain) {
    const domain = r2Domain.endsWith("/") ? r2Domain.slice(0, -1) : r2Domain;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${domain}${cleanPath}`;
  }

  return path;
}

// Locale-aware content helper — falls back to English if no translation exists
export function localisePackage(pkg: Package, locale: string) {
  const translations = pkg.translations as Record<
    string,
    { title?: string; description?: string }
  > | null;

  const override = translations?.[locale];

  return {
    ...pkg,
    title: override?.title ?? pkg.title,
    description: override?.description ?? pkg.description,
    imagePath: getImageUrl(pkg.imagePath),
    // Format price for display
    priceDisplay: `Starting ₹${pkg.priceFrom.toLocaleString("en-IN")}`,
    // Format duration for display
    durationDisplay: `${pkg.durationDays} Days · ${pkg.durationNights} Nights`,
    // Format altitude for display
    altitudeDisplay: pkg.maxAltitudeFt
      ? `Max Altitude: ${pkg.maxAltitudeFt.toLocaleString("en-IN")} ft`
      : null,
  };
}
