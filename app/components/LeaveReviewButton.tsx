"use client";

import { useState } from "react";
import { Star, Check } from "lucide-react";
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
import { createReviewAction } from "@/lib/actions/reviews";

export default function LeaveReviewButton({
  bookingId,
  alreadyReviewed,
  labels,
}: {
  bookingId: string;
  alreadyReviewed: boolean;
  labels: {
    leaveReview: string;
    alreadyReviewed: string;
    rating: string;
    comment: string;
    submit: string;
    submitting: string;
    thankYou: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (alreadyReviewed) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
        <Check className="w-3.5 h-3.5" /> {labels.alreadyReviewed}
      </span>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await createReviewAction({ bookingId, rating, comment: comment.trim() || undefined });
    setPending(false);
    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    setDone(true);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full">
          {labels.leaveReview}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{labels.leaveReview}</DialogTitle>
        </DialogHeader>

        {done ? (
          <p className="text-sm text-emerald-600 py-4">{labels.thankYou}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{labels.rating}</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    aria-label={`${value} star${value > 1 ? "s" : ""}`}
                    className="p-0.5"
                  >
                    <Star
                      className={`w-6 h-6 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-neutral-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-comment">{labels.comment}</Label>
              <Input
                id="review-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-cyan-600 font-bold hover:bg-cyan-500"
            >
              {pending ? labels.submitting : labels.submit}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
