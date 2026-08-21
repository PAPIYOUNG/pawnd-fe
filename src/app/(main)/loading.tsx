import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex w-full flex-col animate-pulse">
      {/* 1. Hero Banner Skeleton */}
      <section className="w-full bg-[#ECF5EE]/60 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Skeleton Content */}
            <div className="flex flex-col gap-5 lg:col-span-7">
              <Skeleton className="h-10 w-3/4 rounded-2xl bg-muted/80 sm:h-12" />
              <Skeleton className="h-5 w-full rounded-lg bg-muted/60" />
              <Skeleton className="h-5 w-4/5 rounded-lg bg-muted/60" />
              <div className="flex items-center gap-4 pt-4">
                <Skeleton className="h-12 w-44 rounded-2xl bg-primary/20" />
                <Skeleton className="h-12 w-40 rounded-2xl bg-muted/80" />
              </div>
            </div>

            {/* Right Skeleton Image */}
            <div className="flex justify-center lg:col-span-5">
              <Skeleton className="aspect-[4/3] w-full max-w-lg rounded-3xl bg-muted/80 shadow-md" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Stats Bar Skeleton */}
      <section className="w-full py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="size-2.5 rounded-full" />
                </div>
                <div className="my-3 flex items-baseline gap-2">
                  <Skeleton className="h-8 w-24 rounded-lg" />
                  <Skeleton className="h-4 w-10 rounded-md" />
                </div>
                <Skeleton className="h-3 w-32 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Latest Posts Section Skeleton */}
      <section className="w-full py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-2.5 text-center">
            <Skeleton className="h-8 w-64 rounded-xl" />
            <Skeleton className="h-4 w-96 max-w-full rounded-md" />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xs"
              >
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="flex flex-col gap-3 p-4">
                  <Skeleton className="h-5 w-32 rounded-md" />
                  <Skeleton className="h-3.5 w-44 rounded-md" />
                  <div className="flex flex-col gap-1.5 border-t border-border/40 pt-2">
                    <Skeleton className="h-3 w-36 rounded-md" />
                    <Skeleton className="h-3 w-28 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Reunited Stories Skeleton */}
      <section className="w-full bg-[#ECF5EE]/40 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-2.5 text-center">
            <Skeleton className="h-8 w-56 rounded-xl" />
            <Skeleton className="h-4 w-80 max-w-full rounded-md" />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-3xl border border-border/50 bg-white p-0 shadow-xs"
              >
                <Skeleton className="aspect-[16/10] w-full rounded-none" />
                <div className="flex flex-col gap-2.5 p-5">
                  <Skeleton className="h-5 w-40 rounded-md" />
                  <Skeleton className="h-3.5 w-full rounded-md" />
                  <Skeleton className="h-3.5 w-5/6 rounded-md" />
                  <Skeleton className="mt-2 h-4 w-44 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
