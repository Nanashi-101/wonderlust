"use client";

import { useLocale, useTranslations } from "next-intl";
import { BUDGET_TIERS, type BudgetTier, type GroupType, type Interest, type TripAnswers } from "./planner-data";

/** Human-readable, localised labels for planner answers — shared by the wizard and the ticket. */
export function usePlannerLabels() {
  const t = useTranslations("Wizard");
  const tp = useTranslations("Planner");
  const locale = useLocale();

  const inr = new Intl.NumberFormat(locale, { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  const monthName = new Intl.DateTimeFormat(locale, { month: "long" });
  const list = new Intl.ListFormat(locale, { type: "conjunction" });

  const interestLabel: Record<Interest, string> = {
    trekking: tp("interestTrekking"),
    culture: tp("interestCulture"),
    adventure: tp("interestAdventure"),
    relaxation: tp("interestRelaxation"),
    photography: tp("interestPhotography"),
    spiritual: tp("interestSpiritual"),
    food: tp("interestFood"),
    wildlife: tp("interestWildlife"),
  };

  const tierLabel: Record<BudgetTier, string> = {
    budget: t("tierBudget"),
    comfort: t("tierComfort"),
    premium: t("tierPremium"),
    luxury: t("tierLuxury"),
    unsure: t("tierUnsure"),
  };

  const groupLabel: Record<GroupType, string> = {
    solo: t("groupSolo"),
    couple: t("groupCouple"),
    family: t("groupFamily"),
    friends: t("groupFriends"),
  };

  return {
    place: (place: TripAnswers["place"]) =>
      !place ? "" : place === "surprise" ? t("surprisePlace") : place.name,
    days: (count: number) => tp("days", { count }),
    groupName: (type: GroupType) => groupLabel[type],
    group: (type: GroupType, size: number) =>
      type === "solo" || type === "couple"
        ? groupLabel[type]
        : `${groupLabel[type]}, ${t("people", { count: size })}`,
    tierName: (tier: BudgetTier) => tierLabel[tier],
    tierRange: (tier: BudgetTier) => {
      const band = BUDGET_TIERS.find((b) => b.id === tier);
      if (!band) return "";
      if (band.min == null && band.max != null) return t("rangeUnder", { amount: inr.format(band.max) });
      if (band.min != null && band.max != null)
        return t("rangeBetween", { from: inr.format(band.min), to: inr.format(band.max) });
      if (band.min != null) return t("rangeAbove", { amount: inr.format(band.min) });
      return "";
    },
    month: (month: number | "any") =>
      month === "any" ? t("anyTime") : monthName.format(new Date(2026, month, 1)),
    monthShort: (month: number) =>
      new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(2026, month, 1)),
    interest: (interest: Interest) => interestLabel[interest],
    interests: (items: Interest[]) =>
      items.length > 0 ? list.format(items.map((i) => interestLabel[i])) : t("interestsNone"),
  };
}
