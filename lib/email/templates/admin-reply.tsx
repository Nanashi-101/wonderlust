import * as React from "react";
import { Link, Section, Text } from "@react-email/components";
import { SITE_URL } from "../config";
import { EmailLayout, text } from "./layout";

export interface AdminReplyProps {
  name: string;
  reply: string;
  destination?: string | null;
}

/** Sent to the customer when an admin replies to their enquiry. */
export function AdminReply({ name, reply, destination }: AdminReplyProps) {
  const firstName = name.trim().split(/\s+/)[0] || name;

  return (
    <EmailLayout preview={`A reply from the Wonderlust team${destination ? ` about ${destination}` : ""}`}>
      <Text style={text.heading}>Hi {firstName},</Text>

      <Text style={text.paragraph}>
        Thanks for your patience — here&apos;s an update from our team
        {destination ? ` on your enquiry about ${destination}` : ""}.
      </Text>

      <Text style={text.quote}>{reply}</Text>

      <Text style={text.paragraph}>
        Just reply to this email if you&apos;d like to take things further, or if
        anything above needs clarifying.
      </Text>

      <Section style={{ margin: "0 0 8px" }}>
        <Link href={`${SITE_URL}/en/packages`} style={text.button}>
          Browse journeys
        </Link>
      </Section>
    </EmailLayout>
  );
}

export default AdminReply;
