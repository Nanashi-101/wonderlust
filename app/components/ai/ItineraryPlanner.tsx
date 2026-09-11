"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Baby,
  Compass,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Shuffle,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import ItineraryView, { type PlannerPackage } from "./ItineraryView";
import TripTicket from "./TripTicket";
import { usePlannerLabels } from "./usePlannerLabels";
import {
  BUDGET_TIERS,
  DAY_PICKS,
  GROUP_TYPES,
  INTERESTS,
  PLACES,
  REGIONS,
  hasPackageFor,
  seasonOf,
  type GroupType,
  type Interest,
  type Place,
  type Region,
  type TripAnswers,
} from "./planner-data";
import type { Currency } from "@prisma/client";
import type { ItineraryContent } from "@/lib/ai/itinerary";

const STEPS = ["destination", "days", "group", "budget", "month", "interests", "notes"] as const;
type StepId = (typeof STEPS)[number];
type Phase = "asking" | "review" | "generating" | "result";

type PlannerResult = {
  id: string;
  itinerary: ItineraryContent;
  totalPriceMinor: number | null;
  currency: Currency;
};
type PlannerError = "login" | "notConfigured" | "rateLimited" | "dailyLimit" | "failed";

const EASE = [0.22, 1, 0.36, 1] as const;
const EN_MONTH = new Intl.DateTimeFormat("en-US", { month: "long" });

const QUESTION_KEY = {
  destination: "qDestination",
  days: "qDays",
  group: "qGroup",
  budget: "qBudget",
  month: "qMonth",
  interests: "qInterests",
  notes: "qNotes",
} as const;

const REGION_LABEL = {
  north: "regionNorth",
  west: "regionWest",
  south: "regionSouth",
  east: "regionEast",
  northeast: "regionNortheast",
  central: "regionCentral",
} as const;

const REGION_COMMENT = {
  north: "commentNorth",
  west: "commentWest",
  south: "commentSouth",
  east: "commentEast",
  northeast: "commentNortheast",
  central: "commentCentral",
} as const;

const GROUP_COMMENT = {
  solo: "commentSolo",
  couple: "commentCouple",
  family: "commentFamily",
  friends: "commentFriends",
} as const;

const BUDGET_COMMENT = {
  budget: "commentBudget",
  comfort: "commentComfort",
  premium: "commentPremium",
  luxury: "commentLuxury",
  unsure: "commentUnsure",
} as const;

const SEASON_COMMENT = {
  winter: "commentWinter",
  summer: "commentSummer",
  monsoon: "commentMonsoon",
  postMonsoon: "commentPostMonsoon",
} as const;

const GROUP_ICON = { solo: User, couple: Heart, family: Baby, friends: Users } as const;

function errorFor(status: number, code: unknown): PlannerError {
  if (status === 401) return "login";
  if (code === "AI_DAILY_LIMIT") return "dailyLimit";
  if (status === 429) return "rateLimited";
  if (status === 503) return "notConfigured";
  return "failed";
}

/** Scrolls through Lenis when it's driving the page, natively otherwise. */
function smoothScrollTo(el: Element, offset = -160) {
  const lenis = (window as unknown as { lenis?: { scrollTo: (target: Element, opts?: { offset?: number }) => void } })
    .lenis;
  if (lenis) lenis.scrollTo(el, { offset });
  else el.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ─── Small building blocks ───────────────────────────────────────────────────

function TypingDots() {
  return (
    <span className="inline-flex gap-1 py-1.5" aria-hidden>
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-50" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-50 [animation-delay:120ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-50 [animation-delay:240ms]" />
    </span>
  );
}

/** The trip designer "speaking". With `typing`, it shows dots first, then the text. */
function GuideBubble({
  children,
  delay = 0,
  typing = false,
  emphasis = false,
}: {
  children: React.ReactNode;
  delay?: number;
  typing?: boolean;
  emphasis?: boolean;
}) {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(!typing);

  useEffect(() => {
    if (ready) return;
    const id = window.setTimeout(() => setReady(true), reduce ? 0 : (delay + 0.6) * 1000);
    return () => window.clearTimeout(id);
  }, [ready, delay, reduce]);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduce ? 0 : delay, duration: 0.4, ease: EASE }}
      className="flex items-start gap-3"
    >
      <span
        aria-hidden
        className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-neutral-900 text-cyan-400"
      >
        <Compass className="h-4 w-4" />
      </span>
      <div
        className={`rounded-2xl rounded-tl-md px-4 py-2.5 ${
          emphasis
            ? "border border-neutral-200 bg-white text-lg font-semibold leading-snug text-neutral-900 shadow-sm sm:text-xl"
            : "bg-cyan-50 text-sm leading-relaxed text-cyan-950"
        }`}
      >
        {ready ? children : <TypingDots />}
      </div>
    </motion.div>
  );
}

function Tile({
  selected,
  onClick,
  children,
  className = "",
}: {
  selected?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`cursor-pointer rounded-2xl border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 ${
        selected
          ? "border-cyan-600 bg-cyan-50 text-cyan-900"
          : "border-neutral-200 bg-white text-neutral-800 hover:border-cyan-400"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
  decreaseLabel,
  increaseLabel,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  decreaseLabel: string;
  increaseLabel: string;
}) {
  const button =
    "grid h-10 w-10 cursor-pointer place-items-center rounded-full text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent";
  return (
    <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white p-0.5">
      <button type="button" aria-label={decreaseLabel} disabled={value <= min} onClick={() => onChange(value - 1)} className={button}>
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-10 text-center font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" aria-label={increaseLabel} disabled={value >= max} onClick={() => onChange(value + 1)} className={button}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

const primaryButton =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-cyan-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-cyan-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600";
const secondaryButton =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 font-semibold text-neutral-700 transition-colors hover:bg-neutral-50";

// ─── The planner ─────────────────────────────────────────────────────────────

export default function ItineraryPlanner({ packages }: { packages: PlannerPackage[] }) {
  const t = useTranslations("Wizard");
  const tp = useTranslations("Planner");
  const labels = usePlannerLabels();
  const router = useRouter();
  const reduce = useReducedMotion();

  const [phase, setPhase] = useState<Phase>("asking");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<TripAnswers>({});
  const [justAnswered, setJustAnswered] = useState(false);
  const [error, setError] = useState<PlannerError | null>(null);
  const [result, setResult] = useState<PlannerResult | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);

  // Drafts for the multi-input steps
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<Region | "all">("all");
  const [draftDays, setDraftDays] = useState(7);
  const [pendingGroup, setPendingGroup] = useState<GroupType | null>(null);
  const [draftSize, setDraftSize] = useState(4);
  const [draftInterests, setDraftInterests] = useState<Interest[]>([]);
  const [draftNotes, setDraftNotes] = useState("");

  const currentRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const reviewTimer = useRef<number | null>(null);

  // Catalog destinations we don't list yet still show up (region-less, under "All").
  const places = useMemo<Place[]>(() => {
    const known = PLACES.map((p) => p.name.toLowerCase());
    const extra = [...new Set(packages.map((p) => p.destination))]
      .filter((d) => !known.some((k) => k.includes(d.toLowerCase()) || d.toLowerCase().includes(k)))
      .map((name) => ({ name, region: null }));
    return [...PLACES, ...extra];
  }, [packages]);

  const trimmedQuery = query.trim();
  const filteredPlaces = places.filter(
    (p) =>
      (region === "all" || p.region === region) &&
      p.name.toLowerCase().includes(trimmedQuery.toLowerCase())
  );
  const exactMatch = places.some((p) => p.name.toLowerCase() === trimmedQuery.toLowerCase());
  const hasPackage = hasPackageFor(answers.place, packages);
  const isFirstQuestion = step === 0 && Object.keys(answers).length === 0;

  useEffect(() => {
    if (!justAnswered) return;
    const id = window.setTimeout(() => {
      if (currentRef.current) smoothScrollTo(currentRef.current);
    }, reduce ? 0 : 700);
    return () => window.clearTimeout(id);
  }, [step, justAnswered, reduce]);

  useEffect(() => {
    if (phase === "asking" || !topRef.current) return;
    smoothScrollTo(topRef.current, -110);
  }, [phase]);

  useEffect(() => {
    if (phase !== "generating") return;
    const id = window.setInterval(() => setStatusIndex((i) => (i + 1) % 3), 2600);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => () => {
    if (reviewTimer.current) window.clearTimeout(reviewTimer.current);
  }, []);

  function answer(patch: Partial<TripAnswers>) {
    setAnswers((prev) => ({ ...prev, ...patch }));
    setJustAnswered(true);
    setPendingGroup(null);
    const next = step + 1;
    setStep(next);
    if (next >= STEPS.length) {
      reviewTimer.current = window.setTimeout(() => setPhase("review"), reduce ? 0 : 1600);
    }
  }

  function goTo(index: number) {
    if (reviewTimer.current) window.clearTimeout(reviewTimer.current);
    setJustAnswered(false);
    setError(null);
    setStep(index);
    setPhase("asking");
  }

  function restart() {
    setAnswers({});
    setResult(null);
    setError(null);
    setQuery("");
    setRegion("all");
    setDraftInterests([]);
    setDraftNotes("");
    setJustAnswered(false);
    setStep(0);
    setPhase("asking");
  }

  function questionText(id: StepId) {
    return t(QUESTION_KEY[id]);
  }

  function answerText(id: StepId, a: TripAnswers): string {
    switch (id) {
      case "destination":
        return labels.place(a.place);
      case "days":
        return a.days ? labels.days(a.days) : "";
      case "group":
        return a.groupType ? labels.group(a.groupType, a.groupSize ?? 1) : "";
      case "budget":
        return a.budget ? [labels.tierName(a.budget), labels.tierRange(a.budget)].filter(Boolean).join(", ") : "";
      case "month":
        return a.month !== undefined ? labels.month(a.month) : "";
      case "interests":
        return labels.interests(a.interests ?? []);
      case "notes":
        return a.notes || t("nothingElse");
    }
  }

  function commentFor(id: StepId, a: TripAnswers): string {
    switch (id) {
      case "destination":
        if (!a.place) return "";
        if (a.place === "surprise") return t("commentSurprise");
        return a.place.region
          ? t(REGION_COMMENT[a.place.region], { place: a.place.name })
          : t("commentCustom", { place: a.place.name });
      case "days": {
        const days = a.days ?? 0;
        if (days <= 3) return t("commentDaysShort");
        return days <= 7 ? t("commentDaysMedium", { count: days }) : t("commentDaysLong", { count: days });
      }
      case "group":
        return t(GROUP_COMMENT[a.groupType ?? "solo"]);
      case "budget":
        return t(BUDGET_COMMENT[a.budget ?? "unsure"]);
      case "month":
        return a.month === undefined || a.month === "any"
          ? t("commentAnyTime")
          : t(SEASON_COMMENT[seasonOf(a.month)]);
      case "interests":
        return a.interests?.length
          ? t("commentInterests", { list: labels.interests(a.interests) })
          : t("commentInterestsNone");
      case "notes":
        return a.notes ? t("commentNotes") : t("commentNoNotes");
    }
  }

  async function generate() {
    setStatusIndex(0);
    setError(null);
    setPhase("generating");

    const place = answers.place;
    const tier = BUDGET_TIERS.find((b) => b.id === answers.budget);
    // JSON.stringify drops undefined fields, which the route treats as "no preference".
    const body = {
      destination: place && place !== "surprise" ? place.name : undefined,
      durationDays: answers.days,
      groupSize: answers.groupSize,
      groupType: answers.groupType,
      budgetINR: tier?.hint,
      budgetTier: answers.budget && answers.budget !== "unsure" ? answers.budget : undefined,
      travelMonth: typeof answers.month === "number" ? EN_MONTH.format(new Date(2026, answers.month, 1)) : undefined,
      interests: answers.interests?.length ? answers.interests : undefined,
      notes: answers.notes || undefined,
    };

    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        setError(errorFor(res.status, payload?.error));
        setPhase("review");
        return;
      }
      setResult((await res.json()) as PlannerResult);
      setPhase("result");
      router.refresh(); // pull the new draft into "Your itineraries" below
    } catch {
      setError("failed");
      setPhase("review");
    }
  }

  const errorMessages: Record<PlannerError, string> = {
    login: tp("errorLogin"),
    notConfigured: tp("errorNotConfigured"),
    rateLimited: tp("errorRateLimited"),
    dailyLimit: tp("errorDailyLimit"),
    failed: tp("errorFailed"),
  };

  function renderControls(id: StepId) {
    switch (id) {
      case "destination":
        return (
          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                aria-label={t("searchPlaceholder")}
                className="w-full rounded-full border border-neutral-200 bg-white py-3 pl-11 pr-4 text-neutral-900 placeholder:text-neutral-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
            </div>

            <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist">
              {(["all", ...REGIONS] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={region === r}
                  onClick={() => setRegion(r)}
                  className={`shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    region === r ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {r === "all" ? t("regionAll") : t(REGION_LABEL[r])}
                </button>
              ))}
            </div>

            <div data-lenis-prevent className="flex max-h-72 flex-wrap gap-2 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => answer({ place: "surprise" })}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                <Shuffle className="h-3.5 w-3.5" /> {t("surpriseMe")}
              </button>
              {filteredPlaces.map((place) => {
                const selected = typeof answers.place === "object" && answers.place.name === place.name;
                return (
                  <button
                    key={place.name}
                    type="button"
                    onClick={() => answer({ place })}
                    aria-pressed={selected}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                      selected
                        ? "border-cyan-600 bg-cyan-50 text-cyan-900"
                        : "border-neutral-200 bg-white text-neutral-800 hover:border-cyan-400"
                    }`}
                  >
                    {place.name}
                    {hasPackageFor(place, packages) && (
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" title={t("packageAvailable")} />
                    )}
                  </button>
                );
              })}
              {trimmedQuery && !exactMatch && (
                <button
                  type="button"
                  onClick={() => answer({ place: { name: trimmedQuery, region: null } })}
                  className="cursor-pointer rounded-full border border-dashed border-cyan-400 px-4 py-2 text-sm font-medium text-cyan-800 hover:bg-cyan-50"
                >
                  {t("useCustomPlace", { place: trimmedQuery })}
                </button>
              )}
            </div>

            <p className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" /> {t("packageAvailable")}
            </p>
          </div>
        );

      case "days":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {DAY_PICKS.map((d) => (
                <Tile key={d} selected={answers.days === d} onClick={() => answer({ days: d })} className="text-center">
                  <span className="block text-2xl font-semibold tabular-nums">{d}</span>
                  <span className="block text-xs text-neutral-500">{t("daysUnit")}</span>
                </Tile>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-neutral-500">{t("orExactly")}</span>
              <Stepper
                value={draftDays}
                min={1}
                max={30}
                onChange={setDraftDays}
                decreaseLabel={t("decrease")}
                increaseLabel={t("increase")}
              />
              <button type="button" onClick={() => answer({ days: draftDays })} className={primaryButton}>
                {t("continue")}
              </button>
            </div>
          </div>
        );

      case "group":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {GROUP_TYPES.map((type) => {
                const Icon = GROUP_ICON[type];
                const selected = pendingGroup ? pendingGroup === type : answers.groupType === type;
                return (
                  <Tile
                    key={type}
                    selected={selected}
                    onClick={() => {
                      if (type === "solo") answer({ groupType: type, groupSize: 1 });
                      else if (type === "couple") answer({ groupType: type, groupSize: 2 });
                      else setPendingGroup(type);
                    }}
                  >
                    <Icon className="mb-2 h-5 w-5 text-cyan-700" />
                    <span className="block font-medium">{labels.groupName(type)}</span>
                  </Tile>
                );
              })}
            </div>
            <AnimatePresence>
              {pendingGroup && (
                <motion.div
                  initial={reduce ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap items-center gap-3 overflow-hidden"
                >
                  <span className="text-sm text-neutral-600">{t("howMany")}</span>
                  <Stepper
                    value={draftSize}
                    min={2}
                    max={20}
                    onChange={setDraftSize}
                    decreaseLabel={t("decrease")}
                    increaseLabel={t("increase")}
                  />
                  <button
                    type="button"
                    onClick={() => answer({ groupType: pendingGroup, groupSize: draftSize })}
                    className={primaryButton}
                  >
                    {t("continue")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case "budget":
        return (
          <div className="grid gap-2 sm:grid-cols-2">
            {BUDGET_TIERS.map((tier) => (
              <Tile
                key={tier.id}
                selected={answers.budget === tier.id}
                onClick={() => answer({ budget: tier.id })}
                className={tier.id === "unsure" ? "sm:col-span-2" : ""}
              >
                <span className="block font-semibold">{labels.tierName(tier.id)}</span>
                {labels.tierRange(tier.id) && (
                  <span className="mt-0.5 block text-sm text-neutral-500">{labels.tierRange(tier.id)}</span>
                )}
              </Tile>
            ))}
          </div>
        );

      case "month":
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {Array.from({ length: 12 }, (_, m) => (
                <Tile
                  key={m}
                  selected={answers.month === m}
                  onClick={() => answer({ month: m })}
                  className="py-2.5 text-center text-sm font-medium"
                >
                  {labels.monthShort(m)}
                </Tile>
              ))}
            </div>
            <Tile
              selected={answers.month === "any"}
              onClick={() => answer({ month: "any" })}
              className="w-full py-2.5 text-center text-sm font-medium"
            >
              {t("anyTime")}
            </Tile>
          </div>
        );

      case "interests":
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => {
                const selected = draftInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      setDraftInterests((prev) =>
                        prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
                      )
                    }
                    className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      selected
                        ? "border-cyan-600 bg-cyan-600 text-white"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-cyan-400"
                    }`}
                  >
                    {labels.interest(interest)}
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => answer({ interests: draftInterests })} className={primaryButton}>
              {draftInterests.length > 0 ? t("continue") : t("interestsNone")}
            </button>
          </div>
        );

      case "notes":
        return (
          <div className="space-y-3">
            <textarea
              rows={3}
              maxLength={1000}
              value={draftNotes}
              onChange={(e) => setDraftNotes(e.target.value)}
              placeholder={t("notesPlaceholder")}
              aria-label={t("qNotes")}
              className="w-full resize-none rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => answer({ notes: draftNotes.trim() })}
                disabled={!draftNotes.trim()}
                className={`${primaryButton} disabled:cursor-not-allowed disabled:bg-neutral-300`}
              >
                {t("continue")}
              </button>
              <button type="button" onClick={() => answer({ notes: "" })} className={secondaryButton}>
                {t("skip")}
              </button>
            </div>
          </div>
        );
    }
  }

  // ─── Phases ────────────────────────────────────────────────────────────────

  if (phase === "result" && result) {
    return (
      <motion.section
        ref={topRef}
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="mx-auto max-w-3xl space-y-8 rounded-[28px] border border-neutral-200 bg-white p-6 sm:p-10"
      >
        <h2 style={{ fontFamily: "var(--font-logo)" }} className="text-3xl leading-tight text-neutral-900 sm:text-4xl">
          {result.itinerary.title}
        </h2>
        <ItineraryView
          itinerary={result.itinerary}
          packages={packages}
          totalPriceMinor={result.totalPriceMinor}
          currency={result.currency}
          approved={false}
        />
        <button type="button" onClick={restart} className={secondaryButton}>
          <RotateCcw className="h-4 w-4" /> {tp("newPlan")}
        </button>
      </motion.section>
    );
  }

  if (phase === "review" || phase === "generating") {
    const statuses = [t("generating1"), t("generating2"), t("generating3")];
    return (
      <div ref={topRef} className="mx-auto max-w-xl space-y-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={phase === "generating" ? `status-${statusIndex}` : "review"}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <GuideBubble emphasis>{phase === "generating" ? statuses[statusIndex] : t("qReview")}</GuideBubble>
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30, rotate: -1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className={phase === "generating" ? "pointer-events-none" : ""}
        >
          <TripTicket variant="full" answers={answers} hasPackage={hasPackage} />
        </motion.div>

        {phase === "generating" ? (
          <div className="px-2" aria-live="polite">
            <svg viewBox="0 0 300 28" className="h-7 w-full text-cyan-600" aria-hidden>
              <path
                d="M4 18 C 60 2, 90 30, 150 14 S 240 0, 296 14"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.2"
                strokeWidth="2"
                strokeDasharray="4 6"
              />
              <motion.path
                d="M4 18 C 60 2, 90 30, 150 14 S 240 0, 296 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: reduce ? 1 : [0, 1] }}
                transition={{ duration: 2.6, repeat: reduce ? 0 : Infinity, ease: "easeInOut" }}
              />
            </svg>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span>{errorMessages[error]}</span>
                {error === "login" && (
                  <NextLink href="/api/auth/login" className="font-semibold underline">
                    {tp("login")}
                  </NextLink>
                )}
              </div>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={generate} className={`${primaryButton} flex-1 py-4 text-base`}>
                <Sparkles className="h-5 w-5" /> {t("planCta")}
              </button>
              <button type="button" onClick={() => goTo(STEPS.length - 1)} className={secondaryButton}>
                {t("changeAnswers")}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Asking
  const animateIn = justAnswered || isFirstQuestion;
  const questionDelay = justAnswered ? 1.1 : 0.15;

  return (
    <div ref={topRef} className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
      <div className="min-h-[30rem] space-y-8">
        <div className="flex gap-1.5" aria-hidden>
          {STEPS.map((id, i) => (
            <span
              key={id}
              className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i < step ? "bg-cyan-600" : "bg-neutral-200"}`}
            />
          ))}
        </div>

        {STEPS.slice(0, step).map((id, i) => {
          const fresh = justAnswered && i === step - 1;
          return (
            <div key={id} className="space-y-3">
              <p className="pl-12 text-sm text-neutral-400">{questionText(id)}</p>
              <motion.div
                initial={fresh && !reduce ? { opacity: 0, x: 16 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="flex items-center justify-end gap-3"
              >
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  className="cursor-pointer text-xs font-medium text-neutral-400 hover:text-cyan-700"
                >
                  {t("change")}
                </button>
                <p className="max-w-[80%] rounded-2xl rounded-tr-md bg-neutral-900 px-4 py-2.5 text-sm text-white">
                  {answerText(id, answers)}
                </p>
              </motion.div>
              <GuideBubble typing={fresh} delay={fresh ? 0.3 : 0}>
                {commentFor(id, answers)}
              </GuideBubble>
            </div>
          );
        })}

        {step < STEPS.length && (
          <div key={STEPS[step]} ref={currentRef} className="space-y-4">
            <GuideBubble emphasis typing={animateIn} delay={animateIn ? questionDelay : 0}>
              {questionText(STEPS[step])}
            </GuideBubble>
            <motion.div
              initial={animateIn && !reduce ? { opacity: 0, y: 16 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: animateIn && !reduce ? questionDelay + 0.75 : 0, duration: 0.4, ease: EASE }}
              className="sm:pl-12"
            >
              {renderControls(STEPS[step])}
            </motion.div>
          </div>
        )}
      </div>

      <aside className="sticky top-28 hidden lg:block">
        <TripTicket variant="side" answers={answers} hasPackage={hasPackage} />
      </aside>
    </div>
  );
}
