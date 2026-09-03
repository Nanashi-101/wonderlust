"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import NotFoundScene from "../components/NotFoundScene";

/**
 * Handles `notFound()` calls thrown explicitly from within a `[locale]` page
 * (e.g. an unknown package slug) — rendered in the visitor's own locale.
 * A genuinely-unmatched URL (a mistyped path Next.js's router never routes
 * into this segment at all) is caught by the root `app/not-found.tsx` instead.
 */
export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <NotFoundScene
      copy={{
        eyebrow: t("eyebrow"),
        heading: t("heading"),
        description: t("description"),
        cta: t("cta"),
      }}
      homeHref="/"
      HomeLink={Link}
    />
  );
}
