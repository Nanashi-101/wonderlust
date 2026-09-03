import { after } from "next/server";
import { prisma } from "@/lib/db";
import type { VerifiedEvent } from "./provider";
import { BookingStatus, PaymentStatus, type PaymentProvider } from "@prisma/client";
import { sendPaymentReceiptEmail, sendBookingCancelledEmail } from "@/lib/email/bookings";
import { fullNameOf } from "@/lib/user-display";

/**
 * Idempotent. Safe to call twice with the same event — providers WILL retry.
 * The webhook, not the browser redirect, is the source of truth for payment
 * success. See CLAUDE.md M5/M6 before touching this.
 */
export async function handlePaymentEvent(
  provider: PaymentProvider,
  event: VerifiedEvent
): Promise<{ handled: boolean; reason?: string }> {
  if (event.status === "IGNORED") return { handled: false, reason: "unhandled_type" };

  const existing = await prisma.webhookEvent.findUnique({
    where: { providerEventId: event.providerEventId },
  });
  if (existing?.processedAt) return { handled: false, reason: "duplicate" };

  return prisma.$transaction(async (tx) => {
    await tx.webhookEvent.upsert({
      where: { providerEventId: event.providerEventId },
      create: {
        provider,
        providerEventId: event.providerEventId,
        type: event.type,
        payload: event.raw as object,
      },
      update: {},
    });

    if (event.status === "SUCCEEDED" && event.bookingId) {
      const booking = await tx.booking.findUnique({
        where: { id: event.bookingId },
        include: { user: true, package: true },
      });
      if (!booking) throw new Error(`BOOKING_NOT_FOUND: ${event.bookingId}`);

      // Amount tampering check — the provider must have charged what we asked for.
      if (event.amountMinor != null && event.amountMinor !== booking.totalPriceMinor) {
        throw new Error(
          `AMOUNT_MISMATCH: expected=${booking.totalPriceMinor} got=${event.amountMinor}`
        );
      }

      // Already confirmed by an earlier delivery of this event — nothing to do.
      if (booking.status === BookingStatus.CONFIRMED) {
        await tx.webhookEvent.update({
          where: { providerEventId: event.providerEventId },
          data: { processedAt: new Date() },
        });
        return { handled: true, reason: "already_confirmed" };
      }

      await tx.payment.updateMany({
        where: {
          bookingId: booking.id,
          status: { in: [PaymentStatus.CREATED, PaymentStatus.PENDING] },
        },
        data: {
          status: PaymentStatus.SUCCEEDED,
          providerPaymentId: event.providerPaymentId,
          raw: event.raw as object,
        },
      });

      await tx.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.CONFIRMED },
      });

      // No per-departure capacity model yet (§M2's optional Departure) — once
      // it exists, decrement seats here, in this same transaction.

      // Email failure must never roll back a successful payment — after()
      // runs post-response, and sendPaymentReceiptEmail() never throws.
      after(async () => {
        await sendPaymentReceiptEmail({
          bookingId: booking.id,
          customerName: fullNameOf(booking.user),
          customerEmail: booking.user.email,
          packageTitle: booking.package.title,
          guests: booking.guests,
          totalMinor: booking.totalPriceMinor,
          currency: booking.currency,
        });
      });
    }

    if (event.status === "FAILED" && event.bookingId) {
      await tx.payment.updateMany({
        where: { bookingId: event.bookingId },
        data: { status: PaymentStatus.FAILED, providerPaymentId: event.providerPaymentId },
      });
      await tx.booking.update({
        where: { id: event.bookingId },
        data: { status: BookingStatus.PENDING },
      });
    }

    if (event.status === "REFUNDED" && event.providerPaymentId) {
      const payment = await tx.payment.findUnique({
        where: { providerPaymentId: event.providerPaymentId },
      });
      if (payment) {
        const refunded = payment.refundedMinor + (event.amountMinor ?? 0);
        const fullyRefunded = refunded >= payment.amountMinor;

        await tx.payment.update({
          where: { id: payment.id },
          data: {
            refundedMinor: refunded,
            status: fullyRefunded ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED,
          },
        });

        // A partial refund doesn't cancel the booking — only a full one does.
        if (fullyRefunded) {
          const booking = await tx.booking.update({
            where: { id: payment.bookingId },
            data: { status: BookingStatus.REFUNDED },
            include: { user: true, package: true },
          });

          after(async () => {
            await sendBookingCancelledEmail({
              bookingId: booking.id,
              customerName: fullNameOf(booking.user),
              customerEmail: booking.user.email,
              packageTitle: booking.package.title,
              refunded: true,
            });
          });
        }
      }
    }

    await tx.webhookEvent.update({
      where: { providerEventId: event.providerEventId },
      data: { processedAt: new Date() },
    });

    return { handled: true };
  });
}
