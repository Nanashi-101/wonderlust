import Skeleton from "@/app/components/skeleton";

// Detail-view placeholder: wide hero image, then the title/meta/description
// column beside the booking panel.
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="min-h-screen bg-white">
      <span className="sr-only">Loading package details</span>

      {/* Navbar */}
      <div className="flex items-center justify-between px-6 py-6 md:px-12">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>

      {/* Hero image */}
      <Skeleton className="h-[45vh] w-full rounded-none" />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-16 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-5 lg:col-span-2">
          <Skeleton className="h-10 w-3/4" />
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="space-y-3 pt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>

        {/* Booking panel */}
        <div className="h-fit space-y-4 rounded-xl border border-neutral-200 p-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </div>
  );
}
