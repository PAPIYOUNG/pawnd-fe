import { Skeleton } from '@/components/ui/skeleton';

/** Loading state ของหน้า post detail ระหว่างรอ Backend */
export default function PostDetailLoading() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1.4fr_0.8fr]">
      <Skeleton className="h-[32rem] rounded-3xl" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4 rounded-xl" />
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-12 rounded-2xl" />
        {/* พื้นที่สำรองของการ์ดความคืบหน้าระหว่างรอ GET /posts/:id/events */}
        <Skeleton className="h-36 rounded-lg" />
      </div>
    </div>
  );
}
