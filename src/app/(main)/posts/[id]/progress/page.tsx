import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Clock } from 'lucide-react';

import { ApiError } from '@/lib/api/api-error';
import { getPostEvents } from '@/services/post-event.service';
import { getPostById } from '@/services/post.service';
import type { PostStatus } from '@/types/post';
import type { PostEvent } from '@/types/posts-event';

import { PostEventsCard } from '../_components/post-events-card';

interface ProgressPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'ไทม์ไลน์ความคืบหน้าการค้นหา | PAWND',
  description: 'ติดตามเหตุการณ์ล่าสุดของประกาศสัตว์เลี้ยงผ่านระบบ PAWND',
};

/** ป้ายสถานะภาษาไทยของประกาศ ตาม PostStatus ที่ Backend ส่งกลับ */
const POST_STATUS_LABEL: Record<PostStatus, string> = {
  ACTIVE: 'กำลังติดตามประกาศ',
  REUNITED: 'พบสัตว์เลี้ยงแล้ว',
  CLOSED: 'ปิดประกาศแล้ว',
  HIDDEN: 'ประกาศไม่เปิดเผย',
  DELETED: 'ประกาศถูกลบ',
};

/**
 * หน้าแสดงไทม์ไลน์ความคืบหน้าแบบเต็ม (Server Component)
 * - อ่าน post และ event จริงจาก Backend แทน mock data
 * - ใช้ PostEventsCard ตัวเดียวกับ sidebar เพื่อให้การแปล event type สอดคล้องกัน
 * - แยกข้อผิดพลาดของ Timeline ออกจากหน้า detail เพื่อแสดงข้อความที่สุภาพ
 */
export default async function PostProgressPage({ params }: ProgressPageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) notFound();

  // ดึง event หลังยืนยันว่า post เป็นประกาศ public ที่มีอยู่จริง
  let events: PostEvent[] = [];
  let eventsError: string | null = null;
  try {
    events = await getPostEvents(id);
  } catch (error) {
    eventsError =
      error instanceof ApiError && error.statusCode === 404
        ? 'ไม่พบข้อมูลความคืบหน้าของประกาศนี้'
        : 'ไม่สามารถโหลดความคืบหน้าของประกาศได้ในขณะนี้';
  }

  const petName = post.petName ?? post.pet?.name ?? 'สัตว์เลี้ยง';

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      {/* ลิงก์ย้อนกลับไปยังรายละเอียดประกาศ */}
      <Link
        href={`/posts/${id}`}
        className="mb-4 inline-flex min-h-10 items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        <span>กลับหน้ารายละเอียดประกาศ</span>
      </Link>

      {/* ส่วนหัวของหน้า Progress */}
      <header className="flex flex-col gap-2 border-b border-border/60 pb-6">
        <div className="flex items-center gap-2 text-primary">
          <Clock className="size-5" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Case Timeline &amp; Progress
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          ความคืบหน้าประกาศ: {petName}
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          สถานะปัจจุบัน:{' '}
          <span className="font-semibold text-primary">
            {POST_STATUS_LABEL[post.status]}
          </span>
        </p>
      </header>

      {/* Timeline แบบเต็มจาก GET /posts/:id/events */}
      <section className="mt-8" aria-label="ความคืบหน้าประกาศแบบเต็ม">
        <PostEventsCard
          events={events}
          errorMessage={eventsError}
          compact={false}
        />
      </section>
    </div>
  );
}
