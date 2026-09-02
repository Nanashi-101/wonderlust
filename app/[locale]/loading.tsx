// Route-level loading UI for every page under /[locale] that doesn't define
// its own. Next.js renders this while the segment's server components stream,
// so navigation gives immediate feedback instead of a frozen page.
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-white"
    >
      <span
        className="text-3xl tracking-wide text-neutral-900"
        style={{ fontFamily: "var(--font-logo)" }}
      >
        Wonderlust
      </span>

      <div className="h-0.5 w-40 overflow-hidden rounded-full bg-neutral-200">
        <div className="animate-loading-sweep h-full w-1/4 rounded-full bg-cyan-500" />
      </div>

      <span className="sr-only">Loading</span>
    </div>
  );
}
