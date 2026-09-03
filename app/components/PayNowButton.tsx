"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface RazorpayCheckoutOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  prefill?: { email?: string };
  notes?: Record<string, string>;
  handler?: () => void;
}

interface RazorpayCheckoutInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load the Razorpay checkout script."));
    document.body.appendChild(script);
  });
}

export default function PayNowButton({
  bookingId,
  locale,
  labels,
}: {
  bookingId: string;
  locale: string;
  labels: { payNow: string; pending: string };
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, locale }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message ?? data?.error ?? "Unable to start checkout.");
        return;
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      if (data.clientPayload) {
        await loadRazorpayScript();
        if (!window.Razorpay) throw new Error("Razorpay checkout failed to load.");
        const rzp = new window.Razorpay({
          ...(data.clientPayload as RazorpayCheckoutOptions),
          handler: () => window.location.reload(),
        });
        rzp.open();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        disabled={pending}
        onClick={handlePay}
        className="rounded-full bg-cyan-600 hover:bg-cyan-500 font-bold"
      >
        {pending ? labels.pending : labels.payNow}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
