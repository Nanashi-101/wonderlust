"use client";

import { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "@/i18n/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBookingAction } from "@/lib/actions/bookings";

export default function BookNowButton({
  packageId,
  className,
  children,
}: {
  packageId: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [guests, setGuests] = useState(2);
  const [startDate, setStartDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setRequiresLogin(false);
    setPending(true);

    const result = await createBookingAction({
      packageId,
      guests,
      startDate: startDate ? new Date(startDate) : undefined,
      notes: notes.trim() || undefined,
    });

    setPending(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong. Please try again.");
      setRequiresLogin(Boolean(result.requiresLogin));
      return;
    }

    setOpen(false);
    router.push("/bookings");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className}>{children}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reserve your spot</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="booking-guests">Travellers</Label>
            <Input
              id="booking-guests"
              type="number"
              min={1}
              max={20}
              value={guests}
              onChange={(event) => setGuests(Number(event.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-date">Preferred departure date (optional)</Label>
            <Input
              id="booking-date"
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-notes">Notes (optional)</Label>
            <Input
              id="booking-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Dietary needs, group details, anything we should know"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
              {requiresLogin && (
                <>
                  {" "}
                  <NextLink href="/api/auth/login" className="font-semibold underline">
                    Sign in
                  </NextLink>
                </>
              )}
            </p>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-cyan-600 font-bold hover:bg-cyan-500"
          >
            {pending ? "Requesting…" : "Confirm request"}
          </Button>

          <p className="text-center text-xs text-neutral-400">
            This reserves your request — checkout and payment are coming soon.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
