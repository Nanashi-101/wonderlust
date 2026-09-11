"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth/admin";
import { deleteFromR2 } from "@/lib/r2";
import { z } from "zod";

const NOT_AUTHORIZED = "Not authorized. Admin access required.";

const createAdvertisementSchema = z.object({
  imageUrl: z.string().min(1, "Image URL is required"),
  imageKey: z.string().min(1, "Image key is required"),
});

// ─────────────────────────────────────────────────────────────────────────────
// Mutations / Server Actions
// ─────────────────────────────────────────────────────────────────────────────

export async function createAdvertisementAction(input: { imageUrl: string; imageKey: string }) {
  if (!(await getCurrentAdmin())) return { success: false, error: NOT_AUTHORIZED };

  try {
    const validated = createAdvertisementSchema.parse(input);

    const maxOrder = await prisma.advertisement.aggregate({
      _max: { order: true },
    });

    const created = await prisma.advertisement.create({
      data: {
        ...validated,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });

    revalidatePath("/[locale]", "page");
    revalidatePath("/[locale]/admin", "page");

    return { success: true, advertisement: created };
  } catch (error: any) {
    console.error("Error creating advertisement:", error);
    return {
      success: false,
      error: error?.message || "Failed to save advertisement. Please try again.",
    };
  }
}

export async function deleteAdvertisementAction(id: string) {
  if (!(await getCurrentAdmin())) return { success: false, error: NOT_AUTHORIZED };

  try {
    const ad = await prisma.advertisement.delete({ where: { id } });

    // Best-effort: an orphaned R2 object is harmless clutter, a failed delete
    // shouldn't block removing the ad from the site.
    try {
      await deleteFromR2(ad.imageKey);
    } catch (err) {
      console.error("Failed to delete advertisement image from R2:", err);
    }

    revalidatePath("/[locale]", "page");
    revalidatePath("/[locale]/admin", "page");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting advertisement:", error);
    return {
      success: false,
      error: error?.message || "Failed to delete advertisement.",
    };
  }
}

export async function toggleAdvertisementActiveAction(id: string) {
  if (!(await getCurrentAdmin())) return { success: false, error: NOT_AUTHORIZED };

  try {
    const ad = await prisma.advertisement.findUnique({ where: { id } });
    if (!ad) return { success: false, error: "Advertisement not found." };

    const updated = await prisma.advertisement.update({
      where: { id },
      data: { active: !ad.active },
    });

    revalidatePath("/[locale]", "page");
    revalidatePath("/[locale]/admin", "page");

    return { success: true, active: updated.active };
  } catch (error: any) {
    console.error("Error toggling advertisement:", error);
    return { success: false, error: error?.message || "Failed to update advertisement." };
  }
}

/** Swaps this advertisement's order with its neighbour in the given direction. */
export async function moveAdvertisementAction(id: string, direction: "up" | "down") {
  if (!(await getCurrentAdmin())) return { success: false, error: NOT_AUTHORIZED };

  try {
    const all = await prisma.advertisement.findMany({ orderBy: { order: "asc" } });
    const index = all.findIndex((ad) => ad.id === id);
    if (index === -1) return { success: false, error: "Advertisement not found." };

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= all.length) return { success: true };

    const current = all[index];
    const swapWith = all[swapIndex];

    await prisma.$transaction([
      prisma.advertisement.update({ where: { id: current.id }, data: { order: swapWith.order } }),
      prisma.advertisement.update({ where: { id: swapWith.id }, data: { order: current.order } }),
    ]);

    revalidatePath("/[locale]", "page");
    revalidatePath("/[locale]/admin", "page");

    return { success: true };
  } catch (error: any) {
    console.error("Error reordering advertisements:", error);
    return { success: false, error: error?.message || "Failed to reorder advertisements." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

/** Active advertisements, ordered for the public homepage gallery. */
export async function getActiveAdvertisements() {
  return prisma.advertisement.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
}

/** All advertisements (incl. inactive), for the admin panel. */
export async function getAllAdvertisementsAction() {
  if (!(await getCurrentAdmin())) return [];

  return prisma.advertisement.findMany({
    orderBy: { order: "asc" },
  });
}
