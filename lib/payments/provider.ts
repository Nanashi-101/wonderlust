import type { Currency, PaymentProvider as PaymentProviderName } from "@prisma/client";

export interface CheckoutInput {
  bookingId: string;
  bookingReference: string;
  amountMinor: number;
  currency: Currency;
  customerEmail: string;
  locale: string;
  description: string;
}

export interface CheckoutSession {
  provider: PaymentProviderName;
  providerOrderId: string;
  /** Stripe: hosted URL to redirect to. Razorpay: null — the client opens the SDK modal. */
  redirectUrl: string | null;
  /** Razorpay needs these client-side to open Checkout. */
  clientPayload?: Record<string, unknown>;
}

export interface RefundInput {
  providerPaymentId: string;
  amountMinor: number;
  reason?: string;
}

export interface VerifiedEvent {
  providerEventId: string;
  type: string;
  bookingId?: string;
  providerPaymentId?: string;
  amountMinor?: number;
  status: "SUCCEEDED" | "FAILED" | "REFUNDED" | "IGNORED";
  raw: unknown;
}

export interface PaymentProviderAdapter {
  readonly name: PaymentProviderName;
  createCheckout(input: CheckoutInput): Promise<CheckoutSession>;
  verifyWebhook(rawBody: string, headers: Headers): Promise<VerifiedEvent>;
  refund(input: RefundInput): Promise<{ refundId: string; refundedMinor: number }>;
}

/** INR settles far cheaper through Razorpay; everything else goes to Stripe. */
export function pickProvider(currency: Currency): PaymentProviderName {
  return currency === "INR" ? "RAZORPAY" : "STRIPE";
}
