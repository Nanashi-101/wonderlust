"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, getCurrentUser } from "@/lib/auth/user";
import { getCurrentAdmin } from "@/lib/auth/admin";
import { sendBookingRequestEmails, sendBookingCancelledEmail } from "@/lib/email/bookings";
import { fullNameOf } from "@/lib/user-display";
import type { BookingStatus } from "@prisma/client";

const NOT_AUTHORIZED = "Not authorized.";

const createBookingSchema = z.object({
  packageId: z.string().min(1),
  guests: z.number().int().min(1, "At least 1 guest is required.").max(20),
  startDate: z.coerce.date().optional(),
  notes: z.string().max(2000).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

/**
 * Creates a PENDING booking with a server-computed total. A client-supplied
 * price is never accepted here — see CLAUDE.md M4. Capacity checking is not
 * enforced yet: Package has no seat-count field today, and a real per-departure
 * capacity model (§M2's optional `Departure`) is future work, not this PR.
 */
export async function createBookingAction(input: CreateBookingInput) {
  // Not requireUser(): this runs from a dialog on the public package page,
  // reachable while signed out. A thrown error there surfaces to the client
  // as a generic, digest-stripped message — return a real one instead so the
  // UI can prompt sign-in.
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Please sign in to reserve a spot.", requiresLogin: true };
  }

  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { packageId, guests, startDate, notes } = parsed.data;

  if (startDate && startDate.getTime() < Date.now()) {
    return { success: false, error: "Departure date must be in the future." };
  }

  const pkg = await prisma.package.findUnique({ where: { id: packageId } });
  if (!pkg || !pkg.active) {
    return { success: false, error: "This package is not available." };
  }

  const totalPriceMinor = pkg.priceFromMinor * guests;

  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      packageId: pkg.id,
      guests,
      startDate,
      notes,
      totalPriceMinor,
      currency: pkg.currency,
      status: "PENDING",
    },
  });

  revalidatePath("/[locale]/bookings", "page");

  // Scheduled with after() so the Resend round-trip never delays the booking
  // response — the booking is already persisted, so a mail failure here must
  // never surface as a failed booking. sendBookingRequestEmails() never throws.
  after(async () => {
    await sendBookingRequestEmails({
      bookingId: booking.id,
      customerName: fullNameOf(user),
      customerEmail: user.email,
      packageTitle: pkg.title,
      guests,
      totalMinor: totalPriceMinor,
      currency: pkg.currency,
      startDate: startDate ?? null,
    });
  });

  return { success: true, bookingId: booking.id };
}

/** The current user's own bookings, most recent first. */
export async function getMyBookingsAction() {
  const user = await requireUser();
  return prisma.booking.findMany({
    where: { userId: user.id },
    include: { package: true, review: true },
    orderBy: { createdAt: "desc" },
  });
}

/** A single booking — owner or admin only. */
export async function getBookingAction(id: string) {
  const [user, admin] = await Promise.all([getCurrentUser(), getCurrentAdmin()]);
  if (!user && !admin) throw new Error(NOT_AUTHORIZED);

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { package: true },
  });
  if (!booking) return null;
  if (!admin && booking.userId !== user!.id) throw new Error(NOT_AUTHORIZED);
  return booking;
}

const CANCELLABLE_STATUSES: BookingStatus[] = ["PENDING", "AWAITING_PAYMENT", "CONFIRMED"];
const CANCELLATION_WINDOW_HOURS = 48;

/** Owner-only, policy-gated cancellation. */
export async function cancelBookingAction(id: string) {
  const user = await requireUser();

  const booking = await prisma.booking.findUnique({ where: { id }, include: { package: true } });
  if (!booking || booking.userId !== user.id) {
    return { success: false, error: NOT_AUTHORIZED };
  }
  if (!CANCELLABLE_STATUSES.includes(booking.status)) {
    return { success: false, error: `A ${booking.status.toLowerCase()} booking can't be cancelled.` };
  }
  if (booking.startDate) {
    const hoursUntilDeparture = (booking.startDate.getTime() - Date.now()) / 3_600_000;
    if (hoursUntilDeparture < CANCELLATION_WINDOW_HOURS) {
      return {
        success: false,
        error: `Cancellations must be made at least ${CANCELLATION_WINDOW_HOURS} hours before departure.`,
      };
    }
  }

  await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });

  revalidatePath("/[locale]/bookings", "page");

  after(async () => {
    await sendBookingCancelledEmail({
      bookingId: booking.id,
      customerName: fullNameOf(user),
      customerEmail: user.email,
      packageTitle: booking.package.title,
      refunded: booking.status === "CONFIRMED",
    });
  });

  return { success: true };
}
