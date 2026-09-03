import { razorpayAdapter } from "@/lib/payments/razorpay";
import { handlePaymentEvent } from "@/lib/payments/handle-event";

export const runtime = "nodejs"; // NOT edge — needs crypto + Prisma
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rawBody = await req.text(); // MUST be raw, never req.json()
  try {
    const event = await razorpayAdapter.verifyWebhook(rawBody, req.headers);
    await handlePaymentEvent("RAZORPAY", event);
    return new Response(null, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    const status = message.includes("SIGNATURE") ? 400 : 500;
    console.error("[razorpay-webhook]", message);
    return Response.json({ error: message }, { status });
  }
}
