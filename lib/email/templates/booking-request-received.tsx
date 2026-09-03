import * as React from "react";
import { Text } from "@react-email/components";
import { EmailLayout, Detail, text } from "./layout";

export interface BookingRequestReceivedProps {
  firstName: string;
  packageTitle: string;
  guests: number;
  totalDisplay: string;
  startDateDisplay: string | null;
}

/** Sent to the customer the moment a booking request is created (status: PENDING). */
export function BookingRequestReceived({
  firstName,
  packageTitle,
  guests,
  totalDisplay,
  startDateDisplay,
}: BookingRequestReceivedProps) {
  return (
    <EmailLayout preview={`We've got your request for ${packageTitle} — next up is payment.`}>
      <Text style={text.heading}>Thanks, {firstName}.</Text>

      <Text style={text.paragraph}>
        We&apos;ve received your request to reserve <strong>{packageTitle}</strong>. Your spot is
        held as pending until checkout is completed — we&apos;ll send a separate receipt the
        moment payment goes through.
      </Text>

      <Detail label="Travellers">{guests}</Detail>
      <Detail label="Departure">{startDateDisplay ?? "Flexible"}</Detail>
      <Detail label="Total due">{totalDisplay}</Detail>
    </EmailLayout>
  );
}

export default BookingRequestReceived;
