"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight, CheckCircle2, Clock, MapPin } from "lucide-react";
import { formatMoney } from "@/lib/payments/money";
import type { Currency } from "@prisma/client";
import type { ItineraryContent } from "@/lib/ai/itinerary";

export type PlannerPackage = { slug: string; title: string; destination: string };

export function ApprovalBadge({ approved }: { approved: boolean }) {
  const t = useTranslations("Planner");
  return approved ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
      <CheckCircle2 className="w-3.5 h-3.5" /> {t("approved")}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
      <Clock className="w-3.5 h-3.5" /> {t("awaitingReview")}
    </span>
  );
}

interface ItineraryViewProps {
  itinerary: ItineraryContent;
  packages: PlannerPackage[];
  totalPriceMinor: number | null;
  currency: Currency;
  approved: boolean;
}

export default function ItineraryView({
  itinerary,
  packages,
  totalPriceMinor,
  currency,
  approved,
}: ItineraryViewProps) {
  const t = useTranslations("Planner");
  const locale = useLocale();

  // A package deactivated after generation simply drops out of the cards.
  const recommended = itinerary.recommendedPackageSlugs
    .map((slug) => packages.find((pkg) => pkg.slug === slug))
    .filter((pkg): pkg is PlannerPackage => Boolean(pkg));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <ApprovalBadge approved={approved} />
        {totalPriceMinor != null ? (
          <span className="text-sm text-neutral-500">
            {t("estimatedFrom")}{" "}
            <strong className="text-cyan-700">{formatMoney(totalPriceMinor, currency, locale)}</strong>
          </span>
        ) : (
          <span className="text-sm text-neutral-500">{t("customQuote")}</span>
        )}
      </div>

      <p className="text-neutral-700 leading-relaxed">{itinerary.summary}</p>

      <ol className="space-y-6 border-l-2 border-cyan-100 ml-1.5">
        {itinerary.days.map((day) => (
          <li key={day.day} className="relative pl-6">
            <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-white" />
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">
              {t("day", { day: day.day })}
            </p>
            <h4 className="font-semibold text-neutral-900 mt-0.5">{day.title}</h4>
            <p className="text-sm text-neutral-600 mt-1 leading-relaxed">{day.detail}</p>
          </li>
        ))}
      </ol>

      {recommended.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-3">
            {t("recommended")}
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {recommended.map((pkg) => (
              <Link
                key={pkg.slug}
                href={`/packages/${pkg.slug}`}
                className="group flex items-center justify-between gap-3 p-4 rounded-2xl border border-neutral-200 hover:border-cyan-300 hover:bg-cyan-50/50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-900 truncate">{pkg.title}</p>
                  <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {pkg.destination}
                  </p>
                </div>
                <span className="text-xs font-semibold text-cyan-700 flex items-center gap-1 shrink-0">
                  {t("viewPackage")}
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!approved && <p className="text-sm text-neutral-500 italic">{t("reviewNote")}</p>}
    </div>
  );
}
