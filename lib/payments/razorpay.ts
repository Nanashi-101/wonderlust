import Razorpay from "razorpay";
import crypto from "node:crypto";
import { env } from "@/lib/env";
import type {
  PaymentProviderAdapter,
  CheckoutInput,
  CheckoutSession,
  VerifiedEvent,
  RefundInput,
} from "./provider";

let client: Razorpay | null = null;

/** Lazy — RAZORPAY_KEY_ID/SECRET are optional until M5 goes live (see lib/env.ts). */
function getRazorpayClient(): Razorpay {
  if (client) return client;
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new Error(
      "RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET are not set. Payments via Razorpay aren't configured yet — see .env.example."
    );
  }
  client = new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
  return client;
}

export const razorpayAdapter: PaymentProviderAdapter = {
  name: "RAZORPAY",

  async createCheckout(input: CheckoutInput): Promise<CheckoutSession> {
    const razorpay = getRazorpayClient();

    const order = await razorpay.orders.create({
      amount: input.amountMinor, // already in paise
      currency: input.currency,
      receipt: input.bookingReference.slice(0, 40), // Razorpay caps receipt at 40 chars
      notes: { bookingId: input.bookingId },
      payment_capture: true,
    });

    return {
      provider: "RAZORPAY",
      providerOrderId: order.id,
      redirectUrl: null, // client opens the Razorpay Checkout modal
      clientPayload: {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        name: "Wonderlust Expeditions",
        description: input.description,
        prefill: { email: input.customerEmail },
        notes: { bookingId: input.bookingId },
      },
    };
  },

  async verifyWebhook(rawBody: string, headers: Headers): Promise<VerifiedEvent> {
    const signature = headers.get("x-razorpay-signature");
    if (!signature) throw new Error("MISSING_SIGNATURE");
    if (!env.RAZORPAY_WEBHOOK_SECRET) throw new Error("RAZORPAY_WEBHOOK_SECRET is not set.");

    const valid = Razorpay.validateWebhookSignature(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET);
    if (!valid) throw new Error("INVALID_SIGNATURE");

    const event = JSON.parse(rawBody);
    const entity = event.payload?.payment?.entity;
    const eventId = headers.get("x-razorpay-event-id") ?? `${entity?.id ?? crypto.randomUUID()}:${event.event}`;

    switch (event.event) {
      case "payment.captured":
        return {
          providerEventId: eventId,
          type: event.event,
          bookingId: entity.notes?.bookingId,
          providerPaymentId: entity.id,
          amountMinor: entity.amount,
          status: "SUCCEEDED",
          raw: event,
        };
      case "payment.failed":
        return {
          providerEventId: eventId,
          type: event.event,
          bookingId: entity.notes?.bookingId,
          providerPaymentId: entity.id,
          status: "FAILED",
          raw: event,
        };
      case "refund.processed": {
        const refund = event.payload.refund.entity;
        return {
          providerEventId: eventId,
          type: event.event,
          providerPaymentId: refund.payment_id,
          amountMinor: refund.amount,
          status: "REFUNDED",
          raw: event,
        };
      }
      default:
        return { providerEventId: eventId, type: event.event, status: "IGNORED", raw: event };
    }
  },

  async refund({ providerPaymentId, amountMinor, reason }: RefundInput) {
    const razorpay = getRazorpayClient();
    const refund = await razorpay.payments.refund(providerPaymentId, {
      amount: amountMinor,
      speed: "normal",
      notes: { reason: reason ?? "" },
    });
    return { refundId: refund.id, refundedMinor: Number(refund.amount ?? 0) };
  },
};
