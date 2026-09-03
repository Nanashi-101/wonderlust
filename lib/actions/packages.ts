"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { packageInputSchema, type PackageInput } from "@/lib/package-utils";
import { getCurrentAdmin } from "@/lib/auth/admin";
import { toMinor } from "@/lib/payments/money";
import type { PackageCategory } from "@prisma/client";

const NOT_AUTHORIZED = "Not authorized. Admin access required.";

// ─────────────────────────────────────────────────────────────────────────────
// Mutations / Server Actions
// ─────────────────────────────────────────────────────────────────────────────

export async function createPackageAction(input: PackageInput) {
  if (!(await getCurrentAdmin())) return { success: false, error: NOT_AUTHORIZED };

  try {
    const validated = packageInputSchema.parse(input);

    const formattedSlug = validated.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    const existing = await prisma.package.findUnique({
      where: { slug: formattedSlug },
    });

    if (existing) {
      return {
        success: false,
        error: `A package with slug "${formattedSlug}" already exists. Please choose a unique title/slug.`,
      };
    }

    const { priceFrom, ...rest } = validated;

    const created = await prisma.package.create({
      data: {
        ...rest,
        slug: formattedSlug,
        priceFromMinor: toMinor(priceFrom, "INR"),
      },
    });

    revalidatePath("/[locale]/packages", "page");
    revalidatePath("/[locale]", "page");

    return {
      success: true,
      packageSlug: created.slug,
    };
  } catch (error: any) {
    console.error("Error creating package:", error);
    return {
      success: false,
      error: error?.message || "Failed to create package. Please try again.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

/** All active packages, ordered by creation date */
export async function getPackages() {
  return prisma.package.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });
}

/** Active packages filtered by category */
export async function getPackagesByCategory(category: PackageCategory) {
  return prisma.package.findMany({
    where: { active: true, category },
    orderBy: { createdAt: "asc" },
  });
}

/** First 4 featured packages for the homepage */
export async function getFeaturedPackages() {
  return prisma.package.findMany({
    where: { active: true, featured: true },
    take: 4,
    orderBy: { createdAt: "asc" },
  });
}

/** Single package by slug (used in /packages/[packageId]) */
export async function getPackageBySlug(slug: string) {
  return prisma.package.findUnique({
    where: { slug },
  });
}

/** Update existing package by ID */
export async function updatePackageAction(id: string, input: PackageInput) {
  if (!(await getCurrentAdmin())) return { success: false, error: NOT_AUTHORIZED };

  try {
    const validated = packageInputSchema.parse(input);

    const formattedSlug = validated.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    const { priceFrom, ...rest } = validated;

    const updated = await prisma.package.update({
      where: { id },
      data: {
        ...rest,
        slug: formattedSlug,
        priceFromMinor: toMinor(priceFrom, "INR"),
      },
    });

    revalidatePath("/[locale]/packages", "page");
    revalidatePath("/[locale]", "page");
    revalidatePath("/[locale]/admin", "page");

    return {
      success: true,
      packageSlug: updated.slug,
    };
  } catch (error: any) {
    console.error("Error updating package:", error);
    return {
      success: false,
      error: error?.message || "Failed to update package. Please try again.",
    };
  }
}

/** Delete package by ID */
export async function deletePackageAction(id: string) {
  if (!(await getCurrentAdmin())) return { success: false, error: NOT_AUTHORIZED };

  try {
    await prisma.package.delete({
      where: { id },
    });

    revalidatePath("/[locale]/packages", "page");
    revalidatePath("/[locale]", "page");
    revalidatePath("/[locale]/admin", "page");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting package:", error);
    return {
      success: false,
      error: error?.message || "Failed to delete package.",
    };
  }
}


