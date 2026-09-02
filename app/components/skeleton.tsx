interface Props {
  className?: string;
}

// Shared shimmer block used by the route-level loading screens.
export default function Skeleton({ className = "" }: Props) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-neutral-200 ${className}`}
    />
  );
}
