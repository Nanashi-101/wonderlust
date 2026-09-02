import * as React from "react";
import { Link, Section, Text } from "@react-email/components";
import { SITE_URL } from "../config";
import { Detail, EmailLayout, text } from "./layout";

export interface NewInquiryAlertProps {
  name: string;
  email: string;
  message: string;
  phone?: string | null;
  destination?: string | null;
  type?: string | null;
  submittedAt: Date;
}

/** Internal alert sent to every real admin when an enquiry comes in. */
export function NewInquiryAlert({
  name,
  email,
  message,
  phone,
  destination,
  type,
  submittedAt,
}: NewInquiryAlertProps) {
  return (
    <EmailLayout preview={`${name} enquired${destination ? ` about ${destination}` : ""}`}>
      <Text style={text.heading}>New enquiry from {name}</Text>

      <Text style={text.paragraph}>
        Submitted {submittedAt.toUTCString()}.
      </Text>

      <Detail label="Email">
        <Link href={`mailto:${email}`} style={{ color: "#0891b2", textDecoration: "none" }}>
          {email}
        </Link>
      </Detail>

      {phone ? <Detail label="Phone">{phone}</Detail> : null}
      {destination ? <Detail label="Destination">{destination}</Detail> : null}
      {type ? <Detail label="Type">{type.replace(/_/g, " ")}</Detail> : null}

      <Text style={text.label}>Message</Text>
      <Text style={text.quote}>{message}</Text>

      <Section style={{ margin: "0 0 8px" }}>
        <Link href={`${SITE_URL}/en/admin`} style={text.button}>
          Open admin panel
        </Link>
      </Section>
    </EmailLayout>
  );
}

export default NewInquiryAlert;
