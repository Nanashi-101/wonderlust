import { env } from "@/lib/env";

/** Canonical site origin, no trailing slash. Used for OG/canonical URLs, sitemaps, and payment redirects. */
export function getSiteUrl(): string {
  return (env.NEXT_PUBLIC_SITE_URL ?? env.KINDE_SITE_URL).replace(/\/+$/, "");
}
