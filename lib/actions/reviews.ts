"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/user";
import { getCurrentAdmin } from "@/lib/auth/admin";

const NOT_AUTHORIZED = "Not authorized.";

const createReviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().int().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5"),
  comment: z.string().max(2000).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

/**
 * Verified-booking-gated: a review can only be left against the reviewer's
 * own COMPLETED booking, and only once (Review.bookingId is @unique — the DB
 * enforces this even if two requests race).
 */
export async function createReviewAction(input: CreateReviewInput) {
  const user = await requireUser();

  const parsed = createReviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { bookingId, rating, comment } = parsed.data;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== user.id) {
    return { success: false, error: NOT_AUTHORIZED };
  }
  if (booking.status !== "COMPLETED") {
    return { success: false, error: "You can only review a completed trip." };
  }

  try {
    const review = await prisma.review.create({
      data: {
        bookingId,
        userId: user.id,
        packageId: booking.packageId,
        rating,
        comment: comment?.trim() || null,
        // Unpublished by default — an admin moderates before it goes live.
        published: false,
      },
    });
    revalidatePath("/[locale]/bookings", "page");
    return { success: true, reviewId: review.id };
  } catch {
    // Review.bookingId is unique — this booking already has a review.
    return { success: false, error: "You've already reviewed this booking." };
  }
}

/** Published reviews for a package's public listing, most recent first. */
export async function getPackageReviewsAction(packageId: string) {
  return prisma.review.findMany({
    where: { packageId, published: true },
    include: { user: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
  });
}

/** Admin moderation: publish or unpublish a review. */
export async function setReviewPublishedAction(reviewId: string, published: boolean) {
  if (!(await getCurrentAdmin())) return { success: false, error: NOT_AUTHORIZED };

  await prisma.review.update({ where: { id: reviewId }, data: { published } });
  revalidatePath("/[locale]/packages/[packageId]", "page");
  return { success: true };
}
