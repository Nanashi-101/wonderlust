import { beforeAll, describe, expect, it } from "vitest";
import crypto from "node:crypto";
import Stripe from "stripe";

// Stub every var lib/env.ts requires, BEFORE the adapters (which import it)
// are loaded, so this file never depends on a developer's real .env — and
// never touches a real DB or a real Stripe/Razorpay account. Payload signing
// below is pure local HMAC, no network calls.
beforeAll(() => {
  const stub = (key: string, value: string) => {
    if (!process.env[key]) process.env[key] = value;
  };
  stub("DATABASE_URL", "postgresql://test:test@localhost:5432/test");
  stub("DIRECT_URL", "postgresql://test:test@localhost:5432/test");
  stub("KINDE_CLIENT_ID", "test");
  stub("KINDE_CLIENT_SECRET", "test");
  stub("KINDE_ISSUER_URL", "https://test.kinde.com");
  stub("KINDE_SITE_URL", "http://localhost:3000");
  stub("CLOUDFLARE_R2_ACCOUNT_ID", "test");
  stub("CLOUDFLARE_R2_ACCESS_KEY_ID", "test");
  stub("CLOUDFLARE_R2_SECRET_ACCESS_KEY", "test");
  stub("CLOUDFLARE_R2_BUCKET_NAME", "test");
  stub("STRIPE_SECRET_KEY", "sk_test_dummy");
  stub("STRIPE_WEBHOOK_SECRET", "whsec_test_dummy_secret");
  stub("RAZORPAY_KEY_ID", "rzp_test_dummy");
  stub("RAZORPAY_KEY_SECRET", "test_secret");
  stub("RAZORPAY_WEBHOOK_SECRET", "razorpay_test_webhook_secret");
});

describe("pickProvider", () => {
  it("routes INR to Razorpay and EUR/USD to Stripe", async () => {
    const { pickProvider } = await import("@/lib/payments/provider");
    expect(pickProvider("INR")).toBe("RAZORPAY");
    expect(pickProvider("EUR")).toBe("STRIPE");
    expect(pickProvider("USD")).toBe("STRIPE");
  });
});

describe("Stripe webhook verification", () => {
  it("rejects a missing signature header", async () => {
    const { stripeAdapter } = await import("@/lib/payments/stripe");
    await expect(stripeAdapter.verifyWebhook("{}", new Headers())).rejects.toThrow(/MISSING_SIGNATURE/);
  });

  it("rejects an invalid signature", async () => {
    const { stripeAdapter } = await import("@/lib/payments/stripe");
    const headers = new Headers({ "stripe-signature": "t=1,v1=deadbeef" });
    await expect(stripeAdapter.verifyWebhook("{}", headers)).rejects.toThrow();
  });

  it("confirms a booking on a validly signed checkout.session.completed event", async () => {
    const { stripeAdapter } = await import("@/lib/payments/stripe");
    const secret = process.env.STRIPE_WEBHOOK_SECRET!;

    const payload = JSON.stringify({
      id: "evt_test_123",
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { bookingId: "booking_abc" },
          payment_intent: "pi_test_123",
          amount_total: 149900,
          payment_status: "paid",
        },
      },
    });

    // Pure local signing — no network call, doesn't need a real Stripe account.
    const signingClient = new Stripe("sk_test_dummy");
    const signature = signingClient.webhooks.generateTestHeaderString({ payload, secret });
    const headers = new Headers({ "stripe-signature": signature });

    const result = await stripeAdapter.verifyWebhook(payload, headers);
    expect(result.status).toBe("SUCCEEDED");
    expect(result.bookingId).toBe("booking_abc");
    expect(result.amountMinor).toBe(149900);
    expect(result.providerPaymentId).toBe("pi_test_123");
  });

  it("rejects a JSON-parsed-and-reserialized body even with an otherwise valid signature — the classic req.json() regression", async () => {
    const { stripeAdapter } = await import("@/lib/payments/stripe");
    const secret = process.env.STRIPE_WEBHOOK_SECRET!;
    // Pretty-printed on purpose — re-compacting it below must change the bytes,
    // or this test can't actually distinguish "verified" from "coincidentally identical".
    const original = JSON.stringify({ id: "evt_1", type: "ping" }, null, 2);

    const signingClient = new Stripe("sk_test_dummy");
    const signature = signingClient.webhooks.generateTestHeaderString({ payload: original, secret });
    const headers = new Headers({ "stripe-signature": signature });

    // Re-serializing valid JSON changes byte layout even when semantically
    // identical — exactly what happens if a route handler calls req.json()
    // instead of req.text() and re-stringifies before verifying.
    const reserialized = JSON.stringify(JSON.parse(original));
    await expect(stripeAdapter.verifyWebhook(reserialized, headers)).rejects.toThrow();
  });
});

describe("Razorpay webhook verification", () => {
  it("rejects a missing signature header", async () => {
    const { razorpayAdapter } = await import("@/lib/payments/razorpay");
    await expect(razorpayAdapter.verifyWebhook("{}", new Headers())).rejects.toThrow(/MISSING_SIGNATURE/);
  });

  it("rejects a signature computed with the wrong secret", async () => {
    const { razorpayAdapter } = await import("@/lib/payments/razorpay");
    const body = JSON.stringify({ event: "ping" });
    const wrongSignature = crypto.createHmac("sha256", "the-wrong-secret").update(body).digest("hex");
    const headers = new Headers({ "x-razorpay-signature": wrongSignature });
    await expect(razorpayAdapter.verifyWebhook(body, headers)).rejects.toThrow(/INVALID_SIGNATURE/);
  });

  it("rejects a length-mismatched signature without throwing an unrelated error", async () => {
    const { razorpayAdapter } = await import("@/lib/payments/razorpay");
    const headers = new Headers({ "x-razorpay-signature": "short" });
    await expect(razorpayAdapter.verifyWebhook("{}", headers)).rejects.toThrow(/INVALID_SIGNATURE/);
  });

  it("confirms a booking on a validly signed payment.captured event", async () => {
    const { razorpayAdapter } = await import("@/lib/payments/razorpay");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const body = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: { entity: { id: "pay_123", amount: 149900, notes: { bookingId: "booking_abc" } } },
      },
    });
    const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");
    const headers = new Headers({ "x-razorpay-signature": signature });

    const result = await razorpayAdapter.verifyWebhook(body, headers);
    expect(result.status).toBe("SUCCEEDED");
    expect(result.bookingId).toBe("booking_abc");
    expect(result.amountMinor).toBe(149900);
    expect(result.providerPaymentId).toBe("pay_123");
  });

  it("returns IGNORED for an unknown event type, without throwing", async () => {
    const { razorpayAdapter } = await import("@/lib/payments/razorpay");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const body = JSON.stringify({ event: "some.unhandled.event", payload: {} });
    const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");
    const headers = new Headers({ "x-razorpay-signature": signature });

    const result = await razorpayAdapter.verifyWebhook(body, headers);
    expect(result.status).toBe("IGNORED");
  });
});
