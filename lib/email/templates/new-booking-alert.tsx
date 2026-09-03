import * as React from "react";
import { Text } from "@react-email/components";
import { EmailLayout, Detail, text } from "./layout";

export interface NewBookingAlertProps {
  customerName: string;
  customerEmail: string;
  packageTitle: string;
  guests: number;
  totalDisplay: string;
  startDateDisplay: string | null;
  bookingId: string;
}

/** Sent to the admin team the moment a new booking request comes in. */
export function NewBookingAlert({
  customerName,
  customerEmail,
  packageTitle,
  guests,
  totalDisplay,
  startDateDisplay,
  bookingId,
}: NewBookingAlertProps) {
  return (
    <EmailLayout preview={`New booking request: ${packageTitle} from ${customerName}`}>
      <Text style={text.heading}>New booking request</Text>

      <Detail label="Package">{packageTitle}</Detail>
      <Detail label="Customer">
        {customerName} ({customerEmail})
      </Detail>
      <Detail label="Travellers">{guests}</Detail>
      <Detail label="Departure">{startDateDisplay ?? "Flexible"}</Detail>
      <Detail label="Total">{totalDisplay}</Detail>
      <Detail label="Booking ID">{bookingId}</Detail>

      <Text style={text.paragraph}>
        Status is PENDING until the customer completes checkout — no action needed unless they
        reach out.
      </Text>
    </EmailLayout>
  );
}

export default NewBookingAlert;
