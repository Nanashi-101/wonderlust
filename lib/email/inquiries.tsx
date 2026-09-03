import { EMAIL_FROM, EMAIL_REPLY_TO } from "./config";
import { getAdminRecipients } from "./recipients";
import { sendEmail } from "./send";
import { InquiryConfirmation } from "./templates/inquiry-confirmation";
import { NewInquiryAlert } from "./templates/new-inquiry-alert";

export interface InquiryEmailPayload {
  name: string;
  email: string;
  message: string;
  phone?: string | null;
  destination?: string | null;
  type?: string | null;
  submittedAt: Date;
}

/**
 * Fires the two emails triggered by a new enquiry: a confirmation to the
 * customer and an alert to the admin team.
 *
 * The two are independent - a missing admin list must not stop the customer
 * confirmation, and vice versa. sendEmail() never throws, so neither does this.
 */
export async function sendInquiryEmails(payload: InquiryEmailPayload) {
  const { name, email, message, phone, destination, type, submittedAt } = payload;

  const confirmation = sendEmail({
    from: EMAIL_FROM.customer,
    to: [email],
    subject: destination
      ? `We've received your enquiry about ${destination}`
      : "We've received your enquiry",
    replyTo: EMAIL_REPLY_TO,
    react: <InquiryConfirmation name={name} message={message} destination={destination} />,
  });

  const alert = (async () => {
    const admins = await getAdminRecipients();

    // No real admins configured yet - skip rather than mailing the
    // placeholder addresses that getAdminUsersAction() invents.
    if (admins.length === 0) {
      console.warn("[email] no admin recipients configured; skipping new-enquiry alert");
      return { sent: false as const, reason: "no-recipients" as const };
    }

    return sendEmail({
      from: EMAIL_FROM.alerts,
      to: admins,
      subject: `New enquiry: ${name}${destination ? ` - ${destination}` : ""}`,
      // Deliberately no replyTo: replying should happen through the admin
      // panel so the response is recorded against the enquiry.
      react: (
        <NewInquiryAlert
          name={name}
          email={email}
          message={message}
          phone={phone}
          destination={destination}
          type={type}
          submittedAt={submittedAt}
        />
      ),
    });
  })();

  const [confirmationResult, alertResult] = await Promise.all([confirmation, alert]);
  return { confirmation: confirmationResult, alert: alertResult };
}
