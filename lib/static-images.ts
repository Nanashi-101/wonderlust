import { clientEnv } from "@/lib/env";

/**
 * Marketing/site-chrome images (hero backgrounds, partner logos, gallery
 * photos, presets) live in the R2 bucket alongside admin-uploaded package
 * photos, not in /public — keeps the repo small and lets Cloudflare's CDN
 * serve them. Safe to call from client components: it only reads the
 * public NEXT_PUBLIC_R2_PUBLIC_URL var.
 */
export function staticImage(key: string): string {
  // Full URLs (e.g. the planner's Unsplash photos) pass straight through.
  if (/^https?:\/\//i.test(key)) return key;
  const base = (clientEnv.NEXT_PUBLIC_R2_PUBLIC_URL ?? "").replace(/\/+$/, "");
  const cleanKey = key.replace(/^\/+/, "");
  return `${base}/${cleanKey}`;
}
