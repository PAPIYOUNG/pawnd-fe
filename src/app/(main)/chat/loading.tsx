import { Skeleton } from '@/components/ui/skeleton';

/** Loading state ระดับ route ก่อนหน้า Chat Client พร้อมใช้งาน */
export default function ChatLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="grid h-[75vh] grid-cols-1 overflow-hidden rounded-3xl border sm:grid-cols-[20rem_1fr]">
        <div className="space-y-3 border-r p-4">
          <Skeleton className="h-8 w-36" />
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="hidden h-full rounded-none sm:block" />
      </div>
    </div>
  );
}
