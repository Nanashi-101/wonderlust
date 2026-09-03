import { notFound } from "next/navigation";

/**
 * Catch-all for any path under a locale prefix that doesn't match a real page.
 *
 * Next.js's App Router only renders a nested `not-found.tsx` when `notFound()`
 * is thrown from *within* a matched route in that segment — a URL that simply
 * doesn't match any route file falls through to the root `app/not-found.tsx`
 * instead, which has no locale context. This file exists purely to force a
 * match (so `[locale]/not-found.tsx` renders in the visitor's own locale)
 * rather than to render anything itself.
 */
export default function CatchAll() {
  notFound();
}
