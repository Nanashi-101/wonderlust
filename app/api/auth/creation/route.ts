import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user === null || !user.id) {
    throw new Error("Something went wrong with authentication...");
  }

  // Upsert the user into our database so we have a local record to
  // associate bookings and AI-generated itineraries with.
  await prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email ?? "",
      firstName: user.given_name ?? null,
      lastName: user.family_name ?? null,
      picture: user.picture ?? null,
    },
    create: {
      id: user.id,
      email: user.email ?? "",
      firstName: user.given_name ?? null,
      lastName: user.family_name ?? null,
      picture: user.picture ?? null,
    },
  });

  const siteUrl = process.env.KINDE_SITE_URL ?? "http://localhost:3000";
  return NextResponse.redirect(`${siteUrl}/en`);
}
