import type { ReactElement } from "react";
import { getResendClient } from "./client";

export type SendEmailResult =
  | { sent: true; id?: string }
  | { sent: false; reason: "no-recipients" | "not-configured" | "provider-error" | "exception" };

interface SendEmailOptions {
  from: string;
  to: string[];
  subject: string;
  react: ReactElement;
  replyTo?: string;
}

/**
 * Sends an email and never throws.
 *
 * Callers live inside server actions where the email is a side effect of the
 * user's real request. A Resend outage, a missing API key or an empty
 * recipient list must degrade to a logged warning, never to a failed enquiry
 * that was already written to the database.
 */
export async function sendEmail({
  from,
  to,
  subject,
  react,
  replyTo,
}: SendEmailOptions): Promise<SendEmailResult> {
  const recipients = [...new Set(to.map((address) => address?.trim()).filter(Boolean))] as string[];

  if (recipients.length === 0) {
    console.warn(`[email] skipped "${subject}": no recipients`);
    return { sent: false, reason: "no-recipients" };
  }

  const resend = getResendClient();
  if (!resend) {
    console.warn(`[email] skipped "${subject}": RESEND_API_KEY is not set`);
    return { sent: false, reason: "not-configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: recipients,
      subject,
      react,
      ...(replyTo ? { replyTo } : {}),
    });

    if (error) {
      console.error(`[email] rejected "${subject}":`, error);
      return { sent: false, reason: "provider-error" };
    }

    return { sent: true, id: data?.id };
  } catch (error) {
    console.error(`[email] threw while sending "${subject}":`, error);
    return { sent: false, reason: "exception" };
  }
}
