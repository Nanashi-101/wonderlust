"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { InquiryStatus, AdminRole } from "@prisma/client";

/** Fetch overview stats for the Admin Dashboard */
export async function getAdminDashboardStats() {
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

/** Fetch all customer inquiries */
export async function getInquiriesAction() {
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
        message: "Looking for an exclusive all-women luxury glamping package in Gulmarg Kashmir for 6 people.",
        destination: "Kashmir",
        type: "TRIP_INQUIRY",
        status: "NEW" as InquiryStatus,
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        id: "inq-2",
        name: "Vikramaditya Roy",
        email: "vikram@example.com",
        message: "Can you arrange custom high-altitude oxygen support for Khardung La bike trip?",
        destination: "Ladakh",
        type: "CUSTOM_ITINERARY",
        status: "IN_PROGRESS" as InquiryStatus,
        createdAt: new Date(Date.now() - 3600000 * 24),
      },
      {
        id: "inq-3",
        name: "Pooja Malhotra",
        email: "pooja@example.com",
        message: "Requesting corporate booking quote for 15 executives in Rishikesh spiritual retreat.",
        destination: "Rishikesh",
        type: "RESERVATION",
        status: "RESOLVED" as InquiryStatus,
        createdAt: new Date(Date.now() - 3600000 * 48),
      },
    ];
  }

  return inquiries;
}

/** Update inquiry status */
export async function updateInquiryStatusAction(id: string, status: InquiryStatus) {
  try {
    await prisma.inquiry.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/[locale]/admin", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}

/** Fetch admin users directory */
export async function getAdminUsersAction() {
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
