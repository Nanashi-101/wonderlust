"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { staticImage } from "@/lib/static-images";
import { REGION_ART, type TripAnswers } from "./planner-data";
import { usePlannerLabels } from "./usePlannerLabels";

/** Stable, human-looking reference for the ticket stub. */
function tripCode(answers: TripAnswers): string {
  const place = typeof answers.place === "object" ? answers.place.name : answers.place ?? "";
  const seed = `${place}|${answers.days ?? ""}|${answers.groupSize ?? ""}|${answers.budget ?? ""}`;
  let hash = 7;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return `WL-${hash.toString(36).toUpperCase().padStart(5, "0").slice(-5)}`;
}

/** A value that "lands" on the ticket with a small stamp whenever it changes. */
function Field({ label, value, className = "" }: { label: string; value?: string; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className={className}>
      <p className="text-[11px] text-neutral-400">{label}</p>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.p
          key={value ?? "empty"}
          initial={reduce ? false : { opacity: 0, scale: 1.4, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          className={`mt-0.5 origin-left font-semibold leading-snug ${value ? "text-neutral-900" : "text-neutral-300"}`}
        >
          {value ?? "—"}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

interface TripTicketProps {
  answers: TripAnswers;
  hasPackage: boolean;
  variant: "side" | "full";
}

export default function TripTicket({ answers, hasPackage, variant }: TripTicketProps) {
  const t = useTranslations("Wizard");
  const labels = usePlannerLabels();
  const reduce = useReducedMotion();
  const full = variant === "full";

  const place = answers.place;
  const placeName = labels.place(place);
  const image = typeof place === "object" ? place.image : undefined;
  const artKey = typeof place === "object" && place.region ? place.region : "custom";
  const [artLight, artDark] = REGION_ART[artKey];

  return (
    <div className="relative rounded-[28px] bg-white shadow-[0_30px_60px_-30px_rgba(8,51,68,0.55)] ring-1 ring-neutral-900/5">
      {/* Visual */}
      <div className="relative">
        <div className={`relative overflow-hidden rounded-t-[28px] ${full ? "aspect-[16/9]" : "aspect-[16/11]"}`}>
          <AnimatePresence initial={false}>
            <motion.div
              key={image ?? `art-${artKey}`}
              initial={reduce ? false : { opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              {image ? (
                <Image
                  src={staticImage(image)}
                  alt={placeName}
                  fill
                  sizes={full ? "(min-width: 640px) 576px, 100vw" : "360px"}
                  className="object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `repeating-radial-gradient(circle at 25% 125%, rgba(255,255,255,0.09) 0 1.5px, transparent 1.5px 18px), linear-gradient(135deg, ${artLight}, ${artDark})`,
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20" />

          <span className="absolute top-4 right-4 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-medium tabular-nums text-white/85 backdrop-blur-sm">
            {tripCode(answers)}
          </span>
          {hasPackage && (
            <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-cyan-800">
              {t("packageAvailable")}
            </span>
          )}

          <div className="absolute inset-x-5 bottom-4 text-white">
            <p className="text-xs text-white/70">{t("ticketDestination")}</p>
            <p
              style={{ fontFamily: "var(--font-logo)" }}
              className={`leading-tight ${full ? "text-4xl sm:text-5xl" : "text-3xl"} ${placeName ? "" : "text-white/60"}`}
            >
              {placeName || t("ticketPickPlace")}
            </p>
          </div>
        </div>

        {full && (
          <motion.div
            aria-hidden
            initial={reduce ? false : { opacity: 0, scale: 2.2, rotate: -40 }}
            animate={{ opacity: 1, scale: 1, rotate: -12 }}
            transition={{ delay: 0.45, type: "spring", stiffness: 240, damping: 13 }}
            className="absolute -bottom-10 right-5 z-10 grid h-24 w-24 place-items-center rounded-full border-[3px] border-amber-500 bg-white/90 p-3 text-center text-[11px] font-bold leading-tight text-amber-600 shadow-sm"
          >
            {t("stampReady")}
          </motion.div>
        )}
      </div>

      {/* Perforation */}
      <div className="relative h-7" aria-hidden>
        <span className="absolute -left-3.5 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full bg-neutral-50" />
        <span className="absolute -right-3.5 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full bg-neutral-50" />
        <div className="absolute inset-x-6 top-1/2 border-t-2 border-dashed border-neutral-200" />
      </div>

      {/* Fields */}
      <div className={`grid grid-cols-2 gap-x-5 gap-y-4 px-6 pb-6 ${full ? "pr-32 sm:pr-6" : ""}`}>
        <Field label={t("ticketDays")} value={answers.days ? labels.days(answers.days) : undefined} />
        <Field
          label={t("ticketTravellers")}
          value={answers.groupType ? labels.group(answers.groupType, answers.groupSize ?? 1) : undefined}
        />
        <Field label={t("ticketBudget")} value={answers.budget ? labels.tierName(answers.budget) : undefined} />
        <Field
          label={t("ticketWhen")}
          value={answers.month !== undefined ? labels.month(answers.month) : undefined}
        />
        <div className="col-span-2">
          <p className="text-[11px] text-neutral-400">{t("ticketInterests")}</p>
          {answers.interests === undefined ? (
            <p className="mt-0.5 font-semibold text-neutral-300">—</p>
          ) : answers.interests.length === 0 ? (
            <p className="mt-0.5 font-semibold text-neutral-900">{t("interestsNone")}</p>
          ) : (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {answers.interests.map((interest) => (
                <span key={interest} className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-800">
                  {labels.interest(interest)}
                </span>
              ))}
            </div>
          )}
        </div>
        {full && answers.notes && (
          <div className="col-span-2">
            <p className="text-[11px] text-neutral-400">{t("ticketNotes")}</p>
            <p className="mt-0.5 text-sm leading-relaxed text-neutral-700">{answers.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
