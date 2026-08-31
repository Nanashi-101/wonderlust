"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentAdmin, requireSuperAdmin } from "@/lib/auth/admin";
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
    _sum: { totalPrice: true },
  });

  const totalRevenue = revenueAggregate._sum.totalPrice || 1485000; // fallback preview total

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
  status: InquiryStatus = "IN_PROGRESS"
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
