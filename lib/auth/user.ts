import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";

/**
 * Returns the local User row for the current Kinde session, upserting it on
 * the way (same shape as app/api/auth/creation/route.ts's first-login upsert)
 * so this works even if that route hasn't fired yet for this session. Returns
 * null if the visitor isn't logged in.
 */
export async function getCurrentUser(): Promise<User | null> {
  const { isAuthenticated, getUser } = getKindeServerSession();

  const authenticated = await isAuthenticated();
  if (!authenticated) return null;

  const kindeUser = await getUser();
  if (!kindeUser?.id) return null;

  return prisma.user.upsert({
    where: { id: kindeUser.id },
    update: {
      email: kindeUser.email ?? "",
      firstName: kindeUser.given_name ?? null,
      lastName: kindeUser.family_name ?? null,
      picture: kindeUser.picture ?? null,
    },
    create: {
      id: kindeUser.id,
      email: kindeUser.email ?? "",
      firstName: kindeUser.given_name ?? null,
      lastName: kindeUser.family_name ?? null,
      picture: kindeUser.picture ?? null,
    },
  });
}

/**
 * Same as getCurrentUser(), but throws for routes/actions that require a
 * signed-in visitor (booking creation, checkout, my-bookings). Never trust a
 * user id sent from the client instead of this.
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}
