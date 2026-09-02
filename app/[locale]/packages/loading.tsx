import Skeleton from "@/app/components/skeleton";

// Mirrors the real packages page (navbar → hero → card grid) so the layout
// doesn't jump when PackageGrid's database query resolves.
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="min-h-screen bg-white">
      <span className="sr-only">Loading packages</span>

      {/* Navbar */}
      <div className="flex items-center justify-between px-6 py-6 md:px-12">
        <Skeleton className="h-6 w-36" />
        <div className="hidden gap-8 md:flex">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </div>
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-12 w-full max-w-xl" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap justify-center gap-3 px-6 pb-14">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>

      {/* Card grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-neutral-200">
            <Skeleton className="h-56 w-full rounded-none" />
            <div className="space-y-3 p-6">
              <Skeleton className="h-5 w-3/4" />
              <div className="flex gap-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <div className="flex items-center justify-between pt-3">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
