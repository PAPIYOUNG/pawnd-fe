export function CommunityFeedSkeleton() {
  return (
    <div role="status" aria-label="กำลังโหลดโพสต์" className="space-y-6">
      {[0, 1, 2].map((item) => (
        <article
          key={item}
          className="animate-pulse rounded-3xl bg-card p-5 sm:p-6"
        >
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-full bg-muted" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="h-3 w-28 rounded bg-muted" />
            </div>

            <div className="h-7 w-20 rounded-full bg-muted" />
          </div>

          <div className="mt-6 space-y-3">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-4/5 rounded bg-muted" />
          </div>

          <div className="mt-5 aspect-16/7 rounded-2xl bg-muted" />

          <div className="mt-4 flex gap-5 border-t pt-4">
            <div className="h-4 w-12 rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-4 w-12 rounded bg-muted" />
          </div>
        </article>
      ))}

      <span className="sr-only">กำลังโหลด...</span>
    </div>
  );
}
