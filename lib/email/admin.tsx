import { EMAIL_FROM, EMAIL_REPLY_TO } from "./config";
import { sendEmail } from "./send";
import { AdminInvite } from "./templates/admin-invite";
import { AdminReply } from "./templates/admin-reply";

export interface AdminReplyEmailPayload {
  to: string;
  name: string;
  reply: string;
  destination?: string | null;
  /** Subject composed in the Email Studio; a default is used when blank. */
  subject?: string | null;
}

/** Notifies the customer that an admin has responded to their enquiry. */
export async function sendAdminReplyEmail(payload: AdminReplyEmailPayload) {
  const { to, name, reply, destination, subject } = payload;

  return sendEmail({
    from: EMAIL_FROM.customer,
    to: [to],
    subject:
      subject?.trim() ||
      (destination
        ? `Re: your enquiry about ${destination}`
        : "A reply from the Wonderlust team"),
    replyTo: EMAIL_REPLY_TO,
    react: <AdminReply name={name} reply={reply} destination={destination} />,
  });
}

export interface AdminInviteEmailPayload {
  to: string;
  role: string;
  name?: string | null;
  grantedBy?: string | null;
}

/** Tells a newly granted admin that they have access. */
export async function sendAdminInviteEmail(payload: AdminInviteEmailPayload) {
  const { to, role, name, grantedBy } = payload;

  return sendEmail({
    from: EMAIL_FROM.alerts,
    to: [to],
    subject: "You've been given access to the Wonderlust admin panel",
    react: <AdminInvite email={to} role={role} name={name} grantedBy={grantedBy} />,
  });
}
