import { Resend } from "resend";

let client: Resend | null = null;

/**
 * Created lazily and allowed to be absent. Without this, importing anything
 * in lib/email would throw at build time on machines with no RESEND_API_KEY.
 */
export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;

  if (!client) client = new Resend(apiKey);
  return client;
}
