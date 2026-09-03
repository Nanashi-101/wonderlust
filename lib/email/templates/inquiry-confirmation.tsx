import * as React from "react";
import { Link, Section, Text } from "@react-email/components";
import { SITE_URL } from "../config";
import { EmailLayout, text } from "./layout";

export interface InquiryConfirmationProps {
  name: string;
  message: string;
  destination?: string | null;
}

/** Sent to the customer immediately after they submit an enquiry. */
export function InquiryConfirmation({
  name,
  message,
  destination,
}: InquiryConfirmationProps) {
  const firstName = name.trim().split(/\s+/)[0] || name;

  return (
    <EmailLayout preview={`Thanks ${firstName} — we've got your enquiry and will reply shortly.`}>
      <Text style={text.heading}>Thanks, {firstName}.</Text>

      <Text style={text.paragraph}>
        We&apos;ve received your enquiry{destination ? ` about ${destination}` : ""} and a member
        of our team will get back to you personally, usually within one business day.
      </Text>

      <Text style={text.label}>What you told us</Text>
      <Text style={text.quote}>{message}</Text>

      <Text style={text.paragraph}>
        There&apos;s nothing you need to do in the meantime. If you&apos;d like to keep exploring,
        our current journeys are below.
      </Text>

      <Section style={{ margin: "0 0 8px" }}>
        <Link href={`${SITE_URL}/en/packages`} style={text.button}>
          Browse journeys
        </Link>
      </Section>
    </EmailLayout>
  );
}

export default InquiryConfirmation;
