import * as React from "react";
import { Text } from "@react-email/components";
import { EmailLayout, Detail, text } from "./layout";

export interface PaymentReceiptProps {
  firstName: string;
  packageTitle: string;
  guests: number;
  totalDisplay: string;
  bookingId: string;
}

/** Sent to the customer once the payment webhook confirms the charge (status: CONFIRMED). */
export function PaymentReceipt({
  firstName,
  packageTitle,
  guests,
  totalDisplay,
  bookingId,
}: PaymentReceiptProps) {
  return (
    <EmailLayout preview={`Payment received — ${packageTitle} is confirmed.`}>
      <Text style={text.heading}>You&apos;re confirmed, {firstName}.</Text>

      <Text style={text.paragraph}>
        Payment for <strong>{packageTitle}</strong> went through and your booking is now
        confirmed. We can&apos;t wait to have you on this one.
      </Text>

      <Detail label="Travellers">{guests}</Detail>
      <Detail label="Amount charged">{totalDisplay}</Detail>
      <Detail label="Booking reference">{bookingId}</Detail>

      <Text style={text.paragraph}>
        We&apos;ll follow up with trip logistics closer to departure. Reach out any time if
        something changes.
      </Text>
    </EmailLayout>
  );
}

export default PaymentReceipt;
