"use client";

import { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Loader2,
  ChevronDown,
  Mail,
  MapPin,
  CalendarDays,
  Users,
  Wallet,
} from "lucide-react";
import { formatMoney } from "@/lib/payments/money";
import type { GeneratedItinerary, User } from "@prisma/client";
import type { ItineraryContent } from "@/lib/ai/itinerary";

export type ItineraryRow = GeneratedItinerary & { user: User };

/** Mirrors /api/itinerary's PreferencesSchema — every field is optional. */
type Preferences = {
  destination?: string;
  budgetINR?: number;
  budgetTier?: string;
  durationDays?: number;
  groupSize?: number;
  groupType?: string;
  travelMonth?: string;
  interests?: string[];
  notes?: string;
};

type Filter = "PENDING" | "APPROVED" | "ALL";

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "PENDING", label: "Awaiting review" },
  { id: "APPROVED", label: "Approved" },
  { id: "ALL", label: "All" },
];

interface AdminItinerariesPanelProps {
  itineraries: ItineraryRow[];
  onApprove: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export default function AdminItinerariesPanel({ itineraries, onApprove }: AdminItinerariesPanelProps) {
  const [filter, setFilter] = useState<Filter>("PENDING");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});

  const counts: Record<Filter, number> = {
    PENDING: itineraries.filter((row) => !row.approved).length,
    APPROVED: itineraries.filter((row) => row.approved).length,
    ALL: itineraries.length,
  };

  const filtered = itineraries.filter(
    (row) => filter === "ALL" || (filter === "PENDING" ? !row.approved : row.approved)
  );

  async function handleApprove(id: string) {
    setBusyId(id);
    setRowError((prev) => ({ ...prev, [id]: "" }));
    const result = await onApprove(id);
    if (!result.success) {
      setRowError((prev) => ({ ...prev, [id]: result.error ?? "Approval failed." }));
    }
    setBusyId(null);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> AI Itineraries
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Drafts from the AI trip planner. Nothing is bookable until approved — check the plan
              against real dates and availability first, then email the customer.
            </p>
          </div>

          <div className="flex gap-2">
            {FILTERS.map((option) => (
              <button
                key={option.id}
                onClick={() => setFilter(option.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors cursor-pointer ${
                  filter === option.id
                    ? "bg-cyan-600 border-cyan-600 text-white"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-cyan-400"
                }`}
              >
                {option.label} <span className="opacity-70">({counts[option.id]})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-sm">
          <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filter === "PENDING" ? "No itineraries waiting for review." : "No itineraries here yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((row) => {
            const content = row.itinerary as unknown as ItineraryContent;
            const prefs = (row.preferences ?? {}) as Preferences;
            const title = row.title ?? content.title;
            const customerName = [row.user.firstName, row.user.lastName].filter(Boolean).join(" ");
            const expanded = expandedId === row.id;
            const mailto = `mailto:${row.user.email}?subject=${encodeURIComponent(
              `Your Wonderlust itinerary: ${title}`
            )}`;

            return (
              <div
                key={row.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
                      {row.approved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30">
                          <Clock className="w-3 h-3" /> Awaiting review
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {customerName ? `${customerName} · ` : ""}
                      {row.user.email} ·{" "}
                      {new Date(row.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {prefs.destination && <PrefChip icon={MapPin}>{prefs.destination}</PrefChip>}
                      {prefs.durationDays && <PrefChip icon={CalendarDays}>{prefs.durationDays} days</PrefChip>}
                      {prefs.groupSize && <PrefChip icon={Users}>{prefs.groupSize} travellers</PrefChip>}
                      {prefs.budgetTier ? (
                        <PrefChip icon={Wallet}>{prefs.budgetTier} budget</PrefChip>
                      ) : prefs.budgetINR ? (
                        <PrefChip icon={Wallet}>
                          ₹{prefs.budgetINR.toLocaleString("en-IN")} / person
                        </PrefChip>
                      ) : null}
                      {prefs.groupType && <PrefChip icon={Users}>{prefs.groupType}</PrefChip>}
                      {prefs.travelMonth && <PrefChip icon={CalendarDays}>{prefs.travelMonth}</PrefChip>}
                      {prefs.interests?.map((interest) => (
                        <PrefChip key={interest}>{interest}</PrefChip>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {row.totalPriceMinor != null && (
                      <span className="text-sm font-semibold text-slate-900 dark:text-white mr-2">
                        from {formatMoney(row.totalPriceMinor, row.currency, "en-IN")}
                      </span>
                    )}
                    <a
                      href={mailto}
                      title="Email customer"
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-cyan-600 hover:border-cyan-400 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => setExpandedId(expanded ? null : row.id)}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      Details
                      <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </button>
                    {!row.approved && (
                      <button
                        onClick={() => handleApprove(row.id)}
                        disabled={busyId === row.id}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {busyId === row.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                    )}
                  </div>
                </div>

                {rowError[row.id] && (
                  <p className="px-6 pb-4 text-xs text-red-600 dark:text-red-400">{rowError[row.id]}</p>
                )}

                {expanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 px-6 py-5 space-y-5">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{content.summary}</p>

                    {prefs.notes && (
                      <blockquote className="text-sm text-slate-600 dark:text-slate-400 border-l-2 border-cyan-400 pl-3 italic">
                        Customer notes: {prefs.notes}
                      </blockquote>
                    )}

                    <ol className="space-y-3">
                      {content.days.map((day) => (
                        <li key={day.day} className="text-sm">
                          <span className="font-semibold text-cyan-700 dark:text-cyan-400">Day {day.day}</span>
                          <span className="font-semibold text-slate-900 dark:text-white"> — {day.title}</span>
                          <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{day.detail}</p>
                        </li>
                      ))}
                    </ol>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold uppercase tracking-wider text-slate-500">Packages:</span>
                      {content.recommendedPackageSlugs.length === 0 && (
                        <span className="font-medium text-amber-600 dark:text-amber-400">
                          None matched. Custom trip, needs a quote.
                        </span>
                      )}
                      {content.recommendedPackageSlugs.map((slug) => (
                        <code
                          key={slug}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        >
                          {slug}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PrefChip({ icon: Icon, children }: { icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 capitalize">
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}
