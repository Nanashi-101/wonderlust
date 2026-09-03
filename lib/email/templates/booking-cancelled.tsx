import * as React from "react";
import { Text } from "@react-email/components";
import { EmailLayout, Detail, text } from "./layout";

export interface BookingCancelledProps {
  firstName: string;
  packageTitle: string;
  bookingId: string;
  refunded: boolean;
}

/** Sent to the customer on cancellation, whether or not a refund was involved. */
export function BookingCancelled({
  firstName,
  packageTitle,
  bookingId,
  refunded,
}: BookingCancelledProps) {
  return (
    <EmailLayout preview={`${packageTitle} has been cancelled.`}>
      <Text style={text.heading}>Your booking is cancelled, {firstName}.</Text>

      <Text style={text.paragraph}>
        <strong>{packageTitle}</strong> has been cancelled as requested.
        {refunded
          ? " Since this booking was already paid for, our team will process your refund to the original payment method shortly."
          : ""}
      </Text>

      <Detail label="Booking reference">{bookingId}</Detail>

      <Text style={text.paragraph}>
        Changed your mind? You&apos;re welcome to book again any time — we&apos;d love to have
        you.
      </Text>
    </EmailLayout>
  );
}

export default BookingCancelled;
