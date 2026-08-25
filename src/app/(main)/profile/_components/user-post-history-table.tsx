'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Eye, MapPin, Calendar, FileText, ArrowRight } from 'lucide-react';

import { LatestPostItem } from '@/types/post';

interface UserPostHistoryTableProps {
  posts?: LatestPostItem[];
}

/**
 * UserPostHistoryTable Component (Client Component)
 * - แสดงประวัติการสร้างประกาศตามหาของฉันในรูปแบบการ์ด (Rich Post Card Grid)
 * - มีรูปภาพสัตว์เลี้ยง, ป้าย LOST/FOUND, ป้ายสถานะการตามหา, พิกัดสถานที่, วันที่ และยอดผู้เข้าชม
 * - ปุ่มลัดไปยังใบปลิว (Flyer), ไทม์ไลน์ประกาศ (Timeline/Progress) และหน้ารายละเอียดประกาศ
 */
export function UserPostHistoryTable({ posts = [] }: UserPostHistoryTableProps) {
  // ฟังก์ชันกำหนดป้ายสถานะ
  const getStatusBadge = (idx: number) => {
    if (idx === 0) {
      return {
        label: 'กำลังตามหา',
        className: 'bg-destructive text-white',
      };
    }
    if (idx === 1 || idx === 3) {
      return {
        label: 'พากลับบ้านแล้ว',
        className: 'bg-emerald-600 text-white',
      };
    }
    if (idx === 2) {
      return {
        label: 'ปิดประกาศแล้ว',
        className: 'bg-slate-600 text-white',
      };
    }
    return {
      label: 'พากลับบ้านแล้ว',
      className: 'bg-teal-600 text-white',
    };
  };

  const getMockViews = (idx: number) => {
    const views = [243, 412, 98, 580, 150];
    return `${views[idx % views.length]} ครั้ง`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ส่วนหัวของ Section */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold tracking-tight text-foreground sm:text-xl">
          ประวัติการแจ้งประกาศตามหา
        </h3>
        <Link
          href="/posts/create?type=LOST"
          className="text-xs font-bold text-primary transition-colors hover:underline sm:text-sm"
        >
          + สร้างประกาศใหม่
        </Link>
      </div>

      {/* เมื่อไม่มีประวัติประกาศ */}
      {posts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 text-center">
          <p className="text-sm font-semibold text-muted-foreground">
            ยังไม่มีประวัติการสร้างประกาศตามหา
          </p>
          <Link
            href="/posts/create"
            className="mt-3 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90"
          >
            สร้างประกาศแรกของคุณ
          </Link>
        </div>
      )}

      {/* กริดการ์ดประวัติประกาศตามหา (Grid View 1-3 Columns) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, idx) => {
          const status = getStatusBadge(idx);
          const views = getMockViews(idx);
          const isLost = post.type === 'LOST';

          return (
            <div
              key={post.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xs transition-all hover:border-primary/50 hover:shadow-md"
            >
              {/* รูปภาพสัตว์เลี้ยงพร้อมป้ายสถานะคู่ (LOST/FOUND และ Status Badge) */}
              <div className="relative h-44 w-full overflow-hidden bg-muted">
                <Image
                  src={
                    post.coverImageUrl ||
                    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600&auto=format&fit=crop'
                  }
                  alt={post.petName}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* ป้ายประเภทประกาศมุมซ้ายบน */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs ${
                      isLost ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                  >
                    {isLost ? 'LOST' : 'FOUND'}
                  </span>
                </div>

                {/* ป้ายสถานะการติดตามมุมขวาบน */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-xs ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
              </div>

              {/* เนื้อหาการ์ด */}
              <div className="flex flex-1 flex-col p-4">
                <Link
                  href={`/posts/${post.id}`}
                  className="font-bold text-foreground transition-colors hover:text-primary line-clamp-1 text-sm sm:text-base"
                >
                  {post.petName}
                </Link>

                <p className="text-xs text-muted-foreground mt-0.5">
                  {post.petType === 'CAT' ? 'แมว' : 'สุนัข'} • {post.breed || 'ไม่ระบุพันธุ์'}
                </p>

                {/* พิกัดสถานที่และวันที่สร้าง */}
                <div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground border-t border-border/60 pt-3">
                  <span className="flex items-center gap-1.5 truncate">
                    <MapPin className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">{post.locationDetail || post.province}</span>
                  </span>
                  <span className="flex items-center gap-1.5 truncate">
                    <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{post.timeAgo}</span>
                  </span>
                </div>

                {/* แถบล่างสุด: ยอดดู และปุ่มทางลัด */}
                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                  {/* ยอดดู */}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="size-3.5 text-primary" />
                    {views}
                  </span>

                  {/* ปุ่มทางลัด: ใบปลิว & ไทม์ไลน์ */}
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/posts/${post.id}/flyer`}
                      className="rounded-xl border border-border/80 bg-muted/50 px-2.5 py-1 text-[11px] font-bold text-foreground transition-colors hover:bg-primary/20 hover:text-primary"
                      title="ดูใบปลิว"
                    >
                      <FileText className="mr-1 inline size-3" />
                      ใบปลิว
                    </Link>

                    <Link
                      href={`/posts/${post.id}`}
                      className="flex size-7 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform hover:scale-105"
                      title="ดูรายละเอียด"
                    >
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
