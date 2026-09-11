import Image from "next/image";
import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { ChevronDown } from "lucide-react";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import ItineraryPlanner from "@/app/components/ai/ItineraryPlanner";
import ItineraryView, { ApprovalBadge } from "@/app/components/ai/ItineraryView";
import { getCurrentUser } from "@/lib/auth/user";
import { getMyItinerariesAction, getPlannerPackagesAction } from "@/lib/actions/itineraries";
import { staticImage } from "@/lib/static-images";
import type { ItineraryContent } from "@/lib/ai/itinerary";

export default async function PlanPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/api/auth/login");

  const [t, locale, packages, itineraries] = await Promise.all([
    getTranslations("Planner"),
    getLocale(),
    getPlannerPackagesAction(),
    getMyItinerariesAction(),
  ]);

  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Navbar />

      <header className="relative flex min-h-[380px] items-end overflow-hidden h-[52vh]">
        <Image
          src={staticImage("gallery/ladakh_pangong.png")}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/30 to-neutral-950/50" />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-12">
          <h1
            style={{ fontFamily: "var(--font-logo)" }}
            className="max-w-3xl text-4xl leading-[1.05] text-white sm:text-6xl"
          >
            {t("title")}
          </h1>
          <p className="mt-4 max-w-xl leading-relaxed text-white/75">{t("subtitle")}</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-grow space-y-20 px-6 py-14">
        <ItineraryPlanner packages={packages} />

        <section className="mx-auto max-w-3xl space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">{t("pastTitle")}</h2>

          {itineraries.length === 0 ? (
            <p className="text-neutral-500">{t("pastEmpty")}</p>
          ) : (
            <div className="space-y-4">
              {itineraries.map((row) => {
                const content = row.itinerary as unknown as ItineraryContent;
                return (
                  <details key={row.id} className="group rounded-3xl border border-neutral-100 bg-white shadow-sm">
                    <summary className="flex cursor-pointer list-none flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between [&::-webkit-details-marker]:hidden">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-neutral-900">{row.title ?? content.title}</h3>
                        <p className="mt-0.5 text-sm text-neutral-500">
                          {dateFormat.format(row.createdAt)}, {t("days", { count: content.days.length })}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <ApprovalBadge approved={row.approved} />
                        <ChevronDown className="h-5 w-5 text-neutral-400 transition-transform group-open:rotate-180" />
                      </div>
                    </summary>
                    <div className="border-t border-neutral-100 px-6 pb-8 pt-6">
                      <ItineraryView
                        itinerary={content}
                        packages={packages}
                        totalPriceMinor={row.totalPriceMinor}
                        currency={row.currency}
                        approved={row.approved}
                      />
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
