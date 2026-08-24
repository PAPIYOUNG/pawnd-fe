import Link from 'next/link';
import { Eye, Clock, FileText, ChevronRight } from 'lucide-react';

import { LatestPostItem } from '@/types/post';
import { cn } from '@/lib/utils';

interface UserPostHistoryTableProps {
  posts?: LatestPostItem[];
}

/**
 * UserPostHistoryTable Component (Server Component)
 * - ตารางแสดง "ประวัติการแจ้งประกาศตามหา" (Lost & Found Posts History Table)
 * - บน Desktop: แสดงผลเป็นตารางข้อมูล (Table View) คมชัด เรียบหรู
 * - บน Mobile: แสดงผลเป็นการ์ดรายการ (Mobile Card View) อ่านง่าย พอดีจอ ไม่ต้องเลื่อนจอซ้ายขวา
 */
export function UserPostHistoryTable({ posts = [] }: UserPostHistoryTableProps) {
  // ฟังก์ชันกำหนดป้ายสถานะ
  const getStatusBadge = (idx: number) => {
    if (idx === 0) {
      return {
        label: 'กำลังตามหา',
        className: 'bg-destructive/10 text-destructive',
      };
    }
    if (idx === 1 || idx === 3) {
      return {
        label: 'พากลับบ้านแล้ว',
        className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      };
    }
    if (idx === 2) {
      return {
        label: 'ปิดประกาศแล้ว',
        className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
      };
    }
    return {
      label: 'ส่งมอบเจ้าของ',
      className: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    };
  };

  const getMockViews = (idx: number) => {
    const views = [243, 412, 98, 580, 150];
    return `${views[idx % views.length]} ครั้ง`;
  };

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold tracking-tight text-foreground sm:text-xl">
          ประวัติการแจ้งประกาศตามหา
        </h3>
        <Link
          href="/posts/create?type=LOST"
          className="text-xs font-semibold text-primary transition-colors hover:underline sm:text-sm"
        >
          + สร้างประกาศใหม่
        </Link>
      </div>

      {/* 1. มุมมองแบบการ์ดบนหน้าจอมือถือ (Mobile Card List View - แสดงเฉพาะ < md) */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {posts.map((post, idx) => {
          const status = getStatusBadge(idx);
          const views = getMockViews(idx);

          return (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="group flex flex-col gap-2 rounded-2xl border border-border/80 bg-card p-3.5 shadow-2xs transition-all hover:border-primary/50"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold',
                    status.className
                  )}
                >
                  {status.label}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {post.timeAgo}
                </span>
              </div>

              <span className="font-bold text-foreground group-hover:text-primary line-clamp-1 text-sm">
                {post.petName}
              </span>

              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-2">
                <span className="flex items-center gap-1">
                  <Eye className="size-3.5 text-primary" />
                  ยอดดู {views}
                </span>
                <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* 2. มุมมองแบบตารางบนคอมพิวเตอร์ (Desktop Table View - แสดงเฉพาะ >= md) */}
      <div className="hidden overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xs md:block dark:border-border/60">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/60 bg-muted/40 text-xs font-semibold text-muted-foreground">
            <tr>
              <th scope="col" className="px-6 py-4">
                ชื่อประกาศ / หัวข้อสถานะการติดตาม
              </th>
              <th scope="col" className="px-6 py-4">
                สถานะ
              </th>
              <th scope="col" className="px-6 py-4">
                วันที่สร้าง
              </th>
              <th scope="col" className="px-6 py-4 text-right">
                ยอดผู้เข้าดู
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {posts.map((post, idx) => {
              const status = getStatusBadge(idx);
              const views = getMockViews(idx);

              return (
                <tr
                  key={post.id}
                  className="group transition-colors hover:bg-muted/40"
                >
                  <td className="px-6 py-4 font-medium text-foreground">
                    <Link
                      href={`/posts/${post.id}`}
                      className="transition-colors group-hover:text-primary hover:underline line-clamp-1"
                    >
                      {post.petName}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold',
                        status.className
                      )}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {post.timeAgo}
                  </td>
                  <td className="px-6 py-4 text-right text-xs font-medium text-muted-foreground">
                    {views}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
