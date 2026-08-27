'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LatestPostItem } from '@/types/post';

interface PostCardProps {
  post: LatestPostItem;
}

/**
 * PostCard (Client Component)
 * - การ์ดแสดงประกาศ 1 รายการในหน้ารายการประกาศ (`/posts`)
 * - กดที่ตัวการ์ด (ยกเว้นปุ่ม Action) จะพาไปหน้ารายละเอียดประกาศ `/posts/[id]`
 */
export function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const isLost = post.type === 'LOST';

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/posts/${post.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push(`/posts/${post.id}`);
        }
      }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:shadow-xl dark:border-border/60"
    >
      {/* ภาพหน้าปก */}
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        <Image
          src={post.coverImageUrl}
          alt={post.petName}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* ป้ายประเภทประกาศ */}
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-bold shadow-xs text-white',
              isLost ? 'bg-destructive' : 'bg-emerald-600',
            )}
          >
            {isLost ? 'ตามหา (LOST)' : 'พบเห็น (FOUND)'}
          </span>
        </div>

        {/* ป้ายผลการจับคู่ AI (ถ้ามี) */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-emerald-400 backdrop-blur-xs">
          <Sparkles className="size-3" />
          <span>AI Smart Match</span>
        </div>
      </div>

      {/* ข้อมูลประกาศ */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold text-foreground group-hover:text-primary line-clamp-1">
          {post.petName}
        </h3>
        <span className="text-xs text-muted-foreground mt-0.5">
          {post.breed || 'ไม่ระบุสายพันธุ์'}
        </span>

        <div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 line-clamp-1">
            <MapPin className="size-3.5 text-primary shrink-0" />
            {post.locationDetail || post.province || 'ไม่ระบุสถานที่'}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-primary shrink-0" />
            {post.timeAgo}
          </span>
        </div>

        {/* ปุ่ม Action - หยุด event ไม่ให้ทะลุไปกดเปิดการ์ดซ้ำ */}
        <div
          className="mt-5 flex items-center gap-2 border-t border-border/50 pt-4"
          onClick={(e) => e.stopPropagation()}
        >
          <Link href={`/posts/${post.id}`} className="flex-1">
            <Button
              variant="outline"
              className="h-9 w-full rounded-xl text-xs font-semibold"
            >
              ดูรายละเอียด
            </Button>
          </Link>
          <Link href={`/posts/${post.id}/flyer`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl text-xs text-primary font-semibold"
            >
              ใบปลิว
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
