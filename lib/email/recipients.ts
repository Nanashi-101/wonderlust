import { prisma } from "@/lib/db";
import { ADMIN_ALERT_TO } from "./config";

// getAdminUsersAction() cannot be reused for notifications: it is gated behind
// requireSuperAdmin() and throws for the anonymous visitors who trigger these
// emails. It also substitutes two placeholder rows when AdminUser is empty, so
// we query directly and filter those addresses out defensively.
const PLACEHOLDER_ADMIN_EMAILS = new Set([
  "admin@wonderlust.com",
  "expeditions@wonderlust.com",
]);

/** Real admin addresses to notify. Returns [] rather than throwing. */
export async function getAdminRecipients(): Promise<string[]> {
  // An explicit list wins, so alerts can go to a dedicated inbox without
  // every admin-panel user receiving a copy at their personal address.
  if (ADMIN_ALERT_TO.length > 0) return ADMIN_ALERT_TO;

  try {
    const admins = await prisma.adminUser.findMany({ select: { email: true } });

    return admins
      .map((admin) => admin.email?.trim().toLowerCase())
      .filter((email): email is string => Boolean(email))
      .filter((email) => !PLACEHOLDER_ADMIN_EMAILS.has(email));
  } catch (error) {
    console.error("[email] could not load admin recipients:", error);
    return [];
  }
}
