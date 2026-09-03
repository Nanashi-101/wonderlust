import Stripe from "stripe";
import { env } from "@/lib/env";
import { getSiteUrl } from "@/lib/site-url";
import type {
  PaymentProviderAdapter,
  CheckoutInput,
  CheckoutSession,
  VerifiedEvent,
  RefundInput,
} from "./provider";

let client: Stripe | null = null;

/** Lazy — STRIPE_SECRET_KEY is optional until M5 goes live (see lib/env.ts). */
function getStripeClient(): Stripe {
  if (client) return client;
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Payments via Stripe aren't configured yet — see .env.example."
    );
  }
  client = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-08-26.dahlia", // pin; bump deliberately
    typescript: true,
  });
  return client;
}

export const stripeAdapter: PaymentProviderAdapter = {
  name: "STRIPE",

  async createCheckout(input: CheckoutInput): Promise<CheckoutSession> {
    const stripe = getStripeClient();

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: input.customerEmail,
        locale: input.locale as Stripe.Checkout.SessionCreateParams.Locale,
        client_reference_id: input.bookingId,
        metadata: { bookingId: input.bookingId, reference: input.bookingReference },
        payment_intent_data: { metadata: { bookingId: input.bookingId } },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: input.currency.toLowerCase(),
              unit_amount: input.amountMinor,
              product_data: { name: input.description },
            },
          },
        ],
        success_url: `${getSiteUrl()}/${input.locale}/bookings?paid=1`,
        cancel_url: `${getSiteUrl()}/${input.locale}/bookings?cancelled=1`,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      },
      // Retry-safe: the same booking never creates two Stripe charges.
      { idempotencyKey: `checkout_${input.bookingId}` }
    );

    return {
      provider: "STRIPE",
      providerOrderId: session.id,
      redirectUrl: session.url,
    };
  },

  async verifyWebhook(rawBody: string, headers: Headers): Promise<VerifiedEvent> {
    const stripe = getStripeClient();
    const signature = headers.get("stripe-signature");
    if (!signature) throw new Error("MISSING_SIGNATURE");
    if (!env.STRIPE_WEBHOOK_SECRET) throw new Error("STRIPE_WEBHOOK_SECRET is not set.");

    const event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        return {
          providerEventId: event.id,
          type: event.type,
          bookingId: s.metadata?.bookingId,
          providerPaymentId: typeof s.payment_intent === "string" ? s.payment_intent : undefined,
          amountMinor: s.amount_total ?? undefined,
          status: s.payment_status === "paid" ? "SUCCEEDED" : "FAILED",
          raw: event,
        };
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        return {
          providerEventId: event.id,
          type: event.type,
          bookingId: pi.metadata?.bookingId,
          providerPaymentId: pi.id,
          status: "FAILED",
          raw: event,
        };
      }
      case "charge.refunded": {
        const c = event.data.object as Stripe.Charge;
        return {
          providerEventId: event.id,
          type: event.type,
          providerPaymentId: typeof c.payment_intent === "string" ? c.payment_intent : undefined,
          amountMinor: c.amount_refunded,
          status: "REFUNDED",
          raw: event,
        };
      }
      default:
        return { providerEventId: event.id, type: event.type, status: "IGNORED", raw: event };
    }
  },

  async refund({ providerPaymentId, amountMinor, reason }: RefundInput) {
    const stripe = getStripeClient();
    const refund = await stripe.refunds.create(
      {
        payment_intent: providerPaymentId,
        amount: amountMinor,
        reason: "requested_by_customer",
        metadata: { note: reason ?? "" },
      },
      { idempotencyKey: `refund_${providerPaymentId}_${amountMinor}` }
    );
    return { refundId: refund.id, refundedMinor: refund.amount };
  },
};
