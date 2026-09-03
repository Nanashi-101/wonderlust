import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/user";
import { pickProvider } from "@/lib/payments/provider";
import { stripeAdapter } from "@/lib/payments/stripe";
import { razorpayAdapter } from "@/lib/payments/razorpay";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

const Body = z.object({
  bookingId: z.string().min(1),
  locale: z.enum(["en", "hi", "bn", "pl", "fr"]).default("en"),
});

export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(`checkout:${user.id}`, {
    key: "checkout",
    limit: 10,
    windowSec: 60,
  });
  if (!rateLimit.success) return rateLimitResponse(rateLimit);

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "INVALID_INPUT", issues: parsed.error.issues }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.data.bookingId },
    include: { package: true },
  });

  if (!booking) return Response.json({ error: "NOT_FOUND" }, { status: 404 });
  if (booking.userId !== user.id) return Response.json({ error: "FORBIDDEN" }, { status: 403 });
  if (booking.status === "CONFIRMED") {
    return Response.json({ error: "ALREADY_PAID" }, { status: 409 });
  }

  const provider = pickProvider(booking.currency);
  const adapter = provider === "RAZORPAY" ? razorpayAdapter : stripeAdapter;

  let session;
  try {
    session = await adapter.createCheckout({
      bookingId: booking.id,
      bookingReference: booking.id,
      amountMinor: booking.totalPriceMinor, // server-authoritative
      currency: booking.currency,
      customerEmail: user.email,
      locale: parsed.data.locale,
      description: `${booking.package.title} — ${booking.guests} traveller(s)`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[checkout]", message);
    return Response.json({ error: "PROVIDER_NOT_CONFIGURED", message }, { status: 503 });
  }

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        bookingId: booking.id,
        provider: adapter.name,
        providerOrderId: session.providerOrderId,
        amountMinor: booking.totalPriceMinor,
        currency: booking.currency,
        status: "CREATED",
      },
    }),
    prisma.booking.update({
      where: { id: booking.id },
      data: { status: "AWAITING_PAYMENT" },
    }),
  ]);

  return Response.json(session);
}
