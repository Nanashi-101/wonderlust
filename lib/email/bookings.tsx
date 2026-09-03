import { EMAIL_FROM, EMAIL_REPLY_TO } from "./config";
import { getAdminRecipients } from "./recipients";
import { sendEmail } from "./send";
import { BookingRequestReceived } from "./templates/booking-request-received";
import { PaymentReceipt } from "./templates/payment-receipt";
import { BookingCancelled } from "./templates/booking-cancelled";
import { NewBookingAlert } from "./templates/new-booking-alert";
import { formatMoney } from "@/lib/payments/money";
import type { Currency } from "@prisma/client";

function firstNameOf(name: string | null): string {
  if (!name) return "there";
  return name.trim().split(/\s+/)[0] || name;
}

function departureDisplay(startDate: Date | null): string | null {
  if (!startDate) return null;
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(startDate);
}

export interface BookingRequestEmailPayload {
  bookingId: string;
  customerName: string | null;
  customerEmail: string;
  packageTitle: string;
  guests: number;
  totalMinor: number;
  currency: Currency;
  startDate: Date | null;
}

/** Fired right after a PENDING booking is created — request-received to the customer, alert to admins. */
export async function sendBookingRequestEmails(payload: BookingRequestEmailPayload) {
  const totalDisplay = formatMoney(payload.totalMinor, payload.currency, "en-IN");
  const startDateDisplay = departureDisplay(payload.startDate);

  const confirmation = sendEmail({
    from: EMAIL_FROM.customer,
    to: [payload.customerEmail],
    subject: `We've received your request for ${payload.packageTitle}`,
    replyTo: EMAIL_REPLY_TO,
    react: (
      <BookingRequestReceived
        firstName={firstNameOf(payload.customerName)}
        packageTitle={payload.packageTitle}
        guests={payload.guests}
        totalDisplay={totalDisplay}
        startDateDisplay={startDateDisplay}
      />
    ),
  });

  const alert = (async () => {
    const admins = await getAdminRecipients();
    if (admins.length === 0) {
      console.warn("[email] no admin recipients configured; skipping new-booking alert");
      return { sent: false as const, reason: "no-recipients" as const };
    }
    return sendEmail({
      from: EMAIL_FROM.alerts,
      to: admins,
      subject: `New booking request: ${payload.packageTitle}`,
      react: (
        <NewBookingAlert
          customerName={payload.customerName ?? payload.customerEmail}
          customerEmail={payload.customerEmail}
          packageTitle={payload.packageTitle}
          guests={payload.guests}
          totalDisplay={totalDisplay}
          startDateDisplay={startDateDisplay}
          bookingId={payload.bookingId}
        />
      ),
    });
  })();

  const [confirmationResult, alertResult] = await Promise.all([confirmation, alert]);
  return { confirmation: confirmationResult, alert: alertResult };
}

export interface PaymentReceiptEmailPayload {
  bookingId: string;
  customerName: string | null;
  customerEmail: string;
  packageTitle: string;
  guests: number;
  totalMinor: number;
  currency: Currency;
}

/** Fired from the webhook handler once a payment is confirmed (booking -> CONFIRMED). */
export async function sendPaymentReceiptEmail(payload: PaymentReceiptEmailPayload) {
  return sendEmail({
    from: EMAIL_FROM.customer,
    to: [payload.customerEmail],
    subject: `Payment received — ${payload.packageTitle} is confirmed`,
    replyTo: EMAIL_REPLY_TO,
    react: (
      <PaymentReceipt
        firstName={firstNameOf(payload.customerName)}
        packageTitle={payload.packageTitle}
        guests={payload.guests}
        totalDisplay={formatMoney(payload.totalMinor, payload.currency, "en-IN")}
        bookingId={payload.bookingId}
      />
    ),
  });
}

export interface BookingCancelledEmailPayload {
  bookingId: string;
  customerName: string | null;
  customerEmail: string;
  packageTitle: string;
  refunded: boolean;
}

/** Fired on cancellation — whether the customer cancelled it or a refund webhook did. */
export async function sendBookingCancelledEmail(payload: BookingCancelledEmailPayload) {
  return sendEmail({
    from: EMAIL_FROM.customer,
    to: [payload.customerEmail],
    subject: `${payload.packageTitle} — booking cancelled`,
    replyTo: EMAIL_REPLY_TO,
    react: (
      <BookingCancelled
        firstName={firstNameOf(payload.customerName)}
        packageTitle={payload.packageTitle}
        bookingId={payload.bookingId}
        refunded={payload.refunded}
      />
    ),
  });
}
