import CardSkeleton from './CardSkeleton';

export default function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading moodboard" className="space-y-8">
      <div className="space-y-4">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-zinc-800" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-zinc-800/80" />
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-8 w-20 animate-pulse rounded-full bg-zinc-800"
          />
        ))}
      </div>

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
        <div className="mb-4 break-inside-avoid">
          <CardSkeleton variant="tall" />
        </div>
        <div className="mb-4 break-inside-avoid">
          <CardSkeleton />
        </div>
        <div className="mb-4 break-inside-avoid">
          <CardSkeleton variant="tall" />
        </div>
        <div className="mb-4 break-inside-avoid">
          <CardSkeleton />
        </div>
        <div className="mb-4 break-inside-avoid">
          <CardSkeleton />
        </div>
        <div className="mb-4 break-inside-avoid">
          <CardSkeleton variant="tall" />
        </div>
      </div>
    </div>
  );
}
