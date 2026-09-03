"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cancelBookingAction } from "@/lib/actions/bookings";

export default function CancelBookingButton({
  bookingId,
  labels,
}: {
  bookingId: string;
  labels: { cancel: string; cancelling: string; confirm: string };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCancel() {
    if (!window.confirm(labels.confirm)) return;
    setError(null);
    startTransition(async () => {
      const result = await cancelBookingAction(bookingId);
      if (!result.success) {
        setError(result.error ?? null);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={handleCancel}
        className="rounded-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
      >
        {isPending ? labels.cancelling : labels.cancel}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
