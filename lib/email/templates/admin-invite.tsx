import * as React from "react";
import { Link, Section, Text } from "@react-email/components";
import { SITE_URL } from "../config";
import { EmailLayout, text } from "./layout";

export interface AdminInviteProps {
  email: string;
  role: string;
  name?: string | null;
  grantedBy?: string | null;
}

/** Sent to someone who has just been granted access to the admin panel. */
export function AdminInvite({ email, role, name, grantedBy }: AdminInviteProps) {
  const greetingName = name?.trim().split(/\s+/)[0] || email.split("@")[0];
  const readableRole = role.replace(/_/g, " ").toLowerCase();

  return (
    <EmailLayout preview={`You now have ${readableRole} access to the Wonderlust admin panel`}>
      <Text style={text.heading}>You&apos;ve been given admin access</Text>

      <Text style={text.paragraph}>
        Hi {greetingName} — {grantedBy ? `${grantedBy} has` : "someone has"} granted{" "}
        <strong>{email}</strong> the <strong>{readableRole}</strong> role on the Wonderlust
        admin panel.
      </Text>

      <Text style={text.paragraph}>
        Sign in with this email address to manage enquiries, packages and bookings.
      </Text>

      <Section style={{ margin: "0 0 24px" }}>
        <Link href={`${SITE_URL}/en/admin`} style={text.button}>
          Open the admin panel
        </Link>
      </Section>

      <Text style={{ ...text.paragraph, color: "#a3a3a3", fontSize: "13px", margin: 0 }}>
        If you weren&apos;t expecting this, you can ignore this email — access can only be used
        by someone who can sign in as {email}.
      </Text>
    </EmailLayout>
  );
}

export default AdminInvite;
