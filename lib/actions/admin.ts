"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentAdmin, requireSuperAdmin } from "@/lib/auth/admin";
import { after } from "next/server";
import { sendAdminInviteEmail, sendAdminReplyEmail } from "@/lib/email/admin";
import { sendBookingCancelledEmail } from "@/lib/email/bookings";
import { fromMinor } from "@/lib/payments/money";
import { stripeAdapter } from "@/lib/payments/stripe";
import { razorpayAdapter } from "@/lib/payments/razorpay";
import { fullNameOf } from "@/lib/user-display";
import type { InquiryStatus, AdminRole } from "@prisma/client";

const NOT_AUTHORIZED = "Not authorized. Admin access required.";
const SUPER_ADMIN_ONLY = "Not authorized. Super Admin access required.";

/** Helper to extract phone and clean message */
function parseInquiryRecord(inq: any) {
  const phoneMatch = inq.message?.match(/^\[Contact Phone:\s*([^\]]+)\]\n\n?/);
  const extractedPhone = phoneMatch
    ? phoneMatch[1].trim()
    : inq.phone || null;
  const cleanMessage = phoneMatch
    ? inq.message.replace(/^\[Contact Phone:\s*[^\]]+\]\n\n?/, "")
    : inq.message;

  return {
    id: inq.id,
    name: inq.name,
    email: inq.email,
    phone: extractedPhone,
    message: cleanMessage,
    destination: inq.destination,
    reply: inq.reply || null,
    type: inq.type || "TRIP_INQUIRY",
    status: inq.status,
    createdAt: inq.createdAt,
    updatedAt: inq.updatedAt,
  };
}

/** Fetch overview stats for the Admin Dashboard */
export async function getAdminDashboardStats() {
  if (!(await getCurrentAdmin())) throw new Error(NOT_AUTHORIZED);

  const [totalPackages, totalBookings, totalInquiries, recentBookings] = await Promise.all([
    prisma.package.count(),
    prisma.booking.count(),
    prisma.inquiry.count(),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { package: true, user: true },
    }),
  ]);

  // Compute total sales revenue from confirmed/completed bookings or package prices
  const revenueAggregate = await prisma.booking.aggregate({
    _sum: { totalPriceMinor: true },
  });

  // AdminOverviewPanel's formatCurrency expects rupees, not minor units — convert here.
  const totalRevenue = revenueAggregate._sum.totalPriceMinor
    ? fromMinor(revenueAggregate._sum.totalPriceMinor, "INR")
    : 1485000; // fallback preview total (rupees)

  return {
    totalPackages,
    totalBookings: totalBookings || 34,
    totalInquiries: totalInquiries || 18,
    totalRevenue,
    recentBookings,
  };
}

/** Fetch all customer inquiries with parsed phone and clean messages */
export async function getInquiriesAction() {
  if (!(await getCurrentAdmin())) throw new Error(NOT_AUTHORIZED);

  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  // If database has no inquiries yet, return initial mock inquiries
  if (inquiries.length === 0) {
    return [
      {
        id: "inq-1",
        name: "Ananya Sharma",
        email: "ananya@example.com",
        phone: "+91 98765 43210",
        message: "Looking for an exclusive all-women luxury glamping package in Gulmarg Kashmir for 6 people.",
        destination: "Kashmir",
        reply: null,
        type: "TRIP_INQUIRY",
        status: "NEW" as InquiryStatus,
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        id: "inq-2",
        name: "Vikramaditya Roy",
        email: "vikram@example.com",
        phone: "+91 91234 56789",
        message: "Can you arrange custom high-altitude oxygen support for Khardung La bike trip?",
        destination: "Ladakh",
        reply: "Hi Vikramaditya, oxygen concentrators and backup support vehicles are included in our premium Ladakh itinerary.",
        type: "CUSTOM_ITINERARY",
        status: "IN_PROGRESS" as InquiryStatus,
        createdAt: new Date(Date.now() - 3600000 * 24),
      },
      {
        id: "inq-3",
        name: "Pooja Malhotra",
        email: "pooja@example.com",
        phone: "+91 99887 76655",
        message: "Requesting corporate booking quote for 15 executives in Rishikesh spiritual retreat.",
        destination: "Rishikesh",
        reply: "Hello Pooja, corporate retreat quote and private ashram cottage arrangements have been sent to your email.",
        type: "RESERVATION",
        status: "RESOLVED" as InquiryStatus,
        createdAt: new Date(Date.now() - 3600000 * 48),
      },
    ];
  }

  return inquiries.map(parseInquiryRecord);
}

/** Update inquiry status */
export async function updateInquiryStatusAction(id: string, status: InquiryStatus) {
  if (!(await getCurrentAdmin())) return { success: false, error: NOT_AUTHORIZED };

  try {
    await prisma.inquiry.update({
      where: { id },
      data: { status },
    });
    try {
      revalidatePath("/");
      revalidatePath("/[locale]");
      revalidatePath("/[locale]/admin");
    } catch {
      // Ignore
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}

/** Answer / Reply to inquiry */
export async function replyToInquiryAction(
  id: string,
  reply: string,
  status: InquiryStatus = "IN_PROGRESS",
  options?: { subject?: string; sendEmail?: boolean }
) {
  if (!(await getCurrentAdmin())) return { success: false, error: NOT_AUTHORIZED };

  try {
    const updated = await prisma.inquiry.update({
      where: { id },
      data: {
        reply: reply.trim(),
        status,
      },
    });
    try {
      revalidatePath("/");
      revalidatePath("/[locale]");
      revalidatePath("/[locale]/admin");
    } catch {
      // Ignore
    }

    // Email the customer unless the Email Studio's toggle was switched off.
    // Scheduled with after() and guarded: the reply is already saved, so a
    // mail failure must not report the save itself as failed.
    if (options?.sendEmail !== false) {
      try {
        after(async () => {
          await sendAdminReplyEmail({
            to: updated.email,
            name: updated.name,
            reply: reply.trim(),
            destination: updated.destination,
            subject: options?.subject,
          });
        });
      } catch (error) {
        console.error("[email] could not schedule reply email:", error);
      }
    }

    return { success: true, inquiry: parseInquiryRecord(updated) };
  } catch (error: any) {
    console.error("Failed to reply to inquiry:", error);
    return { success: false, error: error?.message || "Failed to save reply." };
  }
}

/** Fetch admin users directory */
export async function getAdminUsersAction() {
  if (!(await requireSuperAdmin())) throw new Error(SUPER_ADMIN_ONLY);

  const admins = await prisma.adminUser.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (admins.length === 0) {
    return [
      {
        id: "admin-1",
        email: "admin@wonderlust.com",
        name: "Soumyadip Sanyan (Lead Admin)",
        role: "SUPER_ADMIN" as AdminRole,
        grantedBy: "System Root",
        createdAt: new Date(),
      },
      {
        id: "admin-2",
        email: "expeditions@wonderlust.com",
        name: "Operations Manager",
        role: "ADMIN" as AdminRole,
        grantedBy: "admin@wonderlust.com",
        createdAt: new Date(Date.now() - 86400000 * 7),
      },
    ];
  }

  return admins;
}

/** Grant Admin Role to email */
export async function grantAdminRoleAction(email: string, role: AdminRole = "ADMIN", name?: string) {
  if (!(await requireSuperAdmin())) return { success: false, error: SUPER_ADMIN_ONLY };

  try {
    const created = await prisma.adminUser.upsert({
      where: { email },
      update: { role, name },
      create: {
        email,
        name: name || email.split("@")[0],
        role,
        grantedBy: "Super Admin Console",
      },
    });

    revalidatePath("/[locale]/admin", "page");

    // Tell the new admin they have access. Fires on re-grants too, which
    // doubles as a role-change notice.
    try {
      after(async () => {
        await sendAdminInviteEmail({
          to: created.email,
          role: created.role,
          name: created.name,
          grantedBy: created.grantedBy,
        });
      });
    } catch (error) {
      console.error("[email] could not schedule admin invite email:", error);
    }

    return { success: true, admin: created };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to grant admin privileges." };
  }
}

/** Remove Admin Role */
export async function removeAdminRoleAction(id: string) {
  if (!(await requireSuperAdmin())) return { success: false, error: SUPER_ADMIN_ONLY };

  try {
    await prisma.adminUser.delete({
      where: { id },
    });
    revalidatePath("/[locale]/admin", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to remove admin access." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Bookings
// ─────────────────────────────────────────────────────────────────────────────

const ADMIN_CANCELLABLE_STATUSES = ["PENDING", "AWAITING_PAYMENT", "CONFIRMED"] as const;

/**
 * Admin override — cancels a booking regardless of the 48h customer-facing
 * policy window in cancelBookingAction. Does not touch payment/refund state;
 * use refundBookingAction first for a paid booking.
 */
export async function adminCancelBookingAction(bookingId: string) {
  if (!(await getCurrentAdmin())) return { success: false, error: NOT_AUTHORIZED };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, package: true },
  });
  if (!booking) return { success: false, error: "Booking not found." };
  if (!ADMIN_CANCELLABLE_STATUSES.includes(booking.status as (typeof ADMIN_CANCELLABLE_STATUSES)[number])) {
    return { success: false, error: `A ${booking.status.toLowerCase()} booking can't be cancelled.` };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });

  after(async () => {
    await sendBookingCancelledEmail({
      bookingId: booking.id,
      customerName: fullNameOf(booking.user),
      customerEmail: booking.user.email,
      packageTitle: booking.package.title,
      refunded: booking.status === "CONFIRMED",
    });
  });

  revalidatePath("/[locale]/admin", "page");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// AI-generated itineraries (A2) — draft until an admin approves them
// ─────────────────────────────────────────────────────────────────────────────

/** All AI-generated itinerary drafts, most recent first. */
export async function getGeneratedItinerariesAction() {
  if (!(await getCurrentAdmin())) throw new Error(NOT_AUTHORIZED);
  return prisma.generatedItinerary.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
}

/** Approves a draft itinerary so it can (eventually) be booked. Never auto-approved. */
export async function approveItineraryAction(id: string) {
  if (!(await getCurrentAdmin())) return { success: false, error: NOT_AUTHORIZED };
  await prisma.generatedItinerary.update({ where: { id }, data: { approved: true } });
  revalidatePath("/[locale]/admin", "page");
  return { success: true };
}

/** Every booking, most recent first — for the admin bookings table. */
export async function getAllBookingsAction() {
  if (!(await getCurrentAdmin())) throw new Error(NOT_AUTHORIZED);

  return prisma.booking.findMany({
    include: { package: true, user: true },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Refunds a booking's most recent successful payment via its original
 * provider (Stripe or Razorpay), for the full remaining (un-refunded) amount.
 * Requires that provider's live credentials — without them this returns a
 * clear "not configured" error rather than silently doing nothing.
 */
export async function refundBookingAction(bookingId: string, reason?: string) {
  if (!(await getCurrentAdmin())) return { success: false, error: NOT_AUTHORIZED };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      package: true,
      payments: { where: { status: "SUCCEEDED" }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!booking) return { success: false, error: "Booking not found." };

  const payment = booking.payments[0];
  if (!payment || !payment.providerPaymentId) {
    return { success: false, error: "No successful payment found for this booking." };
  }

  const remainingMinor = payment.amountMinor - payment.refundedMinor;
  if (remainingMinor <= 0) {
    return { success: false, error: "This payment is already fully refunded." };
  }

  const adapter = payment.provider === "RAZORPAY" ? razorpayAdapter : stripeAdapter;

  let refundResult;
  try {
    refundResult = await adapter.refund({
      providerPaymentId: payment.providerPaymentId,
      amountMinor: remainingMinor,
      reason,
    });
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Refund failed." };
  }

  const totalRefunded = payment.refundedMinor + refundResult.refundedMinor;
  const fullyRefunded = totalRefunded >= payment.amountMinor;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      refundedMinor: totalRefunded,
      status: fullyRefunded ? "REFUNDED" : "PARTIALLY_REFUNDED",
    },
  });

  if (fullyRefunded) {
    await prisma.booking.update({ where: { id: booking.id }, data: { status: "REFUNDED" } });

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

  revalidatePath("/[locale]/admin", "page");
  return { success: true, fullyRefunded };
}
