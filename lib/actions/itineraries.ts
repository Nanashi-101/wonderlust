"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/user";

/** The current user's own AI-generated itineraries, most recent first. */
export async function getMyItinerariesAction() {
  const user = await requireUser();
  return prisma.generatedItinerary.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

/** Active catalog packages, for the planner's destination picker and recommendation cards. */
export async function getPlannerPackagesAction() {
  return prisma.package.findMany({
    where: { active: true },
    select: { slug: true, title: true, destination: true },
    orderBy: { createdAt: "asc" },
  });
}
