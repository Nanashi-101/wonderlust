import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@/lib/db";
import type { AdminUser } from "@prisma/client";

/** Returns the AdminUser record for the current session, or null if the visitor isn't logged in or isn't an admin. */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const { isAuthenticated, getUser } = getKindeServerSession();

  const authenticated = await isAuthenticated();
  if (!authenticated) return null;

  const user = await getUser();
  if (!user?.email) return null;

  return prisma.adminUser.findUnique({ where: { email: user.email } });
}

/**
 * Returns the AdminUser record only if they're a Super Admin, or null otherwise.
 * The Admin Panel is Super Admin-only — standard ADMIN accounts can no longer sign in to it.
 */
export async function requireSuperAdmin(): Promise<AdminUser | null> {
  const admin = await getCurrentAdmin();
  if (!admin || admin.role !== "SUPER_ADMIN") return null;
  return admin;
}
