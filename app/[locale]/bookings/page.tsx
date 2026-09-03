import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import CancelBookingButton from "@/app/components/CancelBookingButton";
import PayNowButton from "@/app/components/PayNowButton";
import LeaveReviewButton from "@/app/components/LeaveReviewButton";
import { getCurrentUser } from "@/lib/auth/user";
import { getMyBookingsAction } from "@/lib/actions/bookings";
import { formatMoney } from "@/lib/payments/money";
import { CalendarDays } from "lucide-react";
import type { BookingStatus } from "@prisma/client";

const CANCELLABLE_STATUSES: BookingStatus[] = ["PENDING", "AWAITING_PAYMENT", "CONFIRMED"];

export default async function BookingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/api/auth/login");

  const [t, tReview, locale, bookings] = await Promise.all([
    getTranslations("Bookings"),
    getTranslations("Review"),
    getLocale(),
    getMyBookingsAction(),
  ]);

  const statusLabel: Record<BookingStatus, string> = {
    PENDING: t("statusPending"),
    AWAITING_PAYMENT: t("statusAwaitingPayment"),
    CONFIRMED: t("statusConfirmed"),
    CANCELLED: t("statusCancelled"),
    COMPLETED: t("statusCompleted"),
    REFUNDED: t("statusRefunded"),
  };

  const statusStyle: Record<BookingStatus, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    AWAITING_PAYMENT: "bg-amber-50 text-amber-700 border-amber-200",
    CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-neutral-100 text-neutral-500 border-neutral-200",
    COMPLETED: "bg-cyan-50 text-cyan-700 border-cyan-200",
    REFUNDED: "bg-neutral-100 text-neutral-500 border-neutral-200",
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-6 py-32">
        <h1 className="text-4xl font-bold text-neutral-900 tracking-tight text-center mb-16">
          {t("title")}
        </h1>

        {bookings.length === 0 ? (
          <div className="max-w-2xl mx-auto space-y-6 text-center">
            <div className="w-20 h-20 bg-cyan-100 text-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <CalendarDays className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">{t("emptyTitle")}</h2>
            <p className="text-lg text-neutral-600">{t("emptyDescription")}</p>
            <div className="pt-8">
              <Link
                href="/packages"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-cyan-600 text-white font-bold hover:bg-cyan-500 transition-colors"
              >
                {t("exploreCta")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-neutral-900">{booking.package.title}</h3>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusStyle[booking.status]}`}
                    >
                      {statusLabel[booking.status]}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500">
                    {t("guests")}: {booking.guests} · {t("departure")}:{" "}
                    {booking.startDate
                      ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(booking.startDate)
                      : t("departureUnset")}
                  </p>
                  <p className="text-cyan-600 font-bold mt-1">
                    {t("total")}: {formatMoney(booking.totalPriceMinor, booking.currency, locale)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {(booking.status === "PENDING" || booking.status === "AWAITING_PAYMENT") && (
                    <PayNowButton
                      bookingId={booking.id}
                      locale={locale}
                      labels={{ payNow: t("payNow"), pending: t("payNowPending") }}
                    />
                  )}
                  {CANCELLABLE_STATUSES.includes(booking.status) && (
                    <CancelBookingButton
                      bookingId={booking.id}
                      labels={{
                        cancel: t("cancel"),
                        cancelling: t("cancelling"),
                        confirm: t("cancelConfirm"),
                      }}
                    />
                  )}
                  {booking.status === "COMPLETED" && (
                    <LeaveReviewButton
                      bookingId={booking.id}
                      alreadyReviewed={Boolean(booking.review)}
                      labels={{
                        leaveReview: tReview("leaveReview"),
                        alreadyReviewed: tReview("alreadyReviewed"),
                        rating: tReview("rating"),
                        comment: tReview("comment"),
                        submit: tReview("submit"),
                        submitting: tReview("submitting"),
                        thankYou: tReview("thankYou"),
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
