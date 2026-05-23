interface CardSkeletonProps {
  variant?: 'compact' | 'tall';
}

export default function CardSkeleton({ variant = 'compact' }: CardSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="h-5 w-20 animate-pulse rounded-full bg-zinc-800" />
        <div className="h-4 w-4 animate-pulse rounded bg-zinc-800" />
      </div>

      <div className="mb-3 h-6 w-3/4 animate-pulse rounded-md bg-zinc-800" />
      <div className="space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-zinc-800/80" />
        <div className="h-3 w-full animate-pulse rounded bg-zinc-800/80" />
        <div
          className={`h-3 animate-pulse rounded bg-zinc-800/80 ${
            variant === 'tall' ? 'w-2/3' : 'w-5/6'
          }`}
        />
        {variant === 'tall' && (
          <>
            <div className="h-3 w-full animate-pulse rounded bg-zinc-800/80" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-800/80" />
          </>
        )}
      </div>

      <div className="mt-5 flex gap-2">
        <div className="h-6 w-14 animate-pulse rounded-full bg-zinc-800" />
        <div className="h-6 w-16 animate-pulse rounded-full bg-zinc-800" />
        <div className="h-6 w-12 animate-pulse rounded-full bg-zinc-800" />
      </div>
    </div>
  );
}
