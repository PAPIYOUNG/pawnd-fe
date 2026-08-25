import { Metadata } from 'next';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  MapPin,
  Sparkles,
  AlertCircle,
  ChevronLeft,
  Calendar,
  MessageSquare,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ProgressPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'ไทม์ไลน์ความคืบหน้าการค้นหา (Case Progress) | PAWND',
  description: 'ติดตามความคืบหน้า เหตุการณ์ และเบาะแสการตามหาสัตว์เลี้ยงแบบเรียลไทม์',
};

// Mock Events ตาม Backend PostEvents DTO
const MOCK_EVENTS = [
  {
    id: 'evt-4',
    title: 'AI ตรวจพบเคสที่ตรงกัน 94%',
    description: 'ระบบตรวจพบแมวที่มีลักษณะตรงกันในพื้นที่ใกล้เคียง (ราชเทวี)',
    timestamp: '12 ต.ค. 2026 • 15:45 น.',
    type: 'AI_MATCH',
    isDone: true,
  },
  {
    id: 'evt-3',
    title: 'มีผู้แจ้งเบาะแสพบเห็นตัว (Sighting)',
    description: 'พลเมืองดีแจ้งพบเห็นแมววิเชียรมาศแอบอยู่ใต้สะพานลอยพญาไท',
    timestamp: '12 ต.ค. 2026 • 14:20 น.',
    type: 'SIGHTING',
    isDone: true,
  },
  {
    id: 'evt-2',
    title: 'เริ่มกระจายสัญญาณ AI & การแจ้งเตือนชุมชน',
    description: 'ส่งการแจ้งเตือนไปยังผู้ใช้ PAWND ในรัศมี 5 กิโลเมตรรอบจุดเกิดเหตุ',
    timestamp: '12 ต.ค. 2026 • 12:10 น.',
    type: 'ALERT',
    isDone: true,
  },
  {
    id: 'evt-1',
    title: 'สร้างประกาศแจ้งหายในระบบ',
    description: 'เจ้าของสร้างประกาศตามหาน้อง Luna',
    timestamp: '12 ต.ค. 2026 • 12:00 น.',
    type: 'CREATED',
    isDone: true,
  },
];

/**
 * PostProgressPage (Server Component - RSC)
 * - หน้าแสดงไทม์ไลน์ความคืบหน้าและเหตุการณ์ของประกาศ (Case Timeline & Progress Events)
 * - ตรงตาม Backend post-events.controller.ts (GET /posts/:postId/events)
 */
export default async function PostProgressPage({ params }: ProgressPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <Link
        href="/posts"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="size-4" />
        <span>กลับหน้ารวมประกาศ</span>
      </Link>

      {/* ส่วนหัวของหน้า Progress */}
      <div className="flex flex-col gap-2 border-b border-border/60 pb-6">
        <div className="flex items-center gap-2 text-primary">
          <Clock className="size-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Case Timeline & Progress
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          ความคืบหน้าการค้นหา: น้องลูน่า (Luna)
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          สถานะปัจจุบัน: <span className="font-bold text-emerald-600">กำลังติดตามเบาะแสร่วมกับชุมชน</span>
        </p>
      </div>

      {/* Timeline เส้นทางความคืบหน้า */}
      <div className="mt-8 relative flex flex-col gap-8 pl-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/80">
        {MOCK_EVENTS.map((evt, idx) => (
          <div key={evt.id} className="relative flex flex-col gap-1.5">
            {/* จุด Marker บน Timeline */}
            <div className="absolute -left-[29px] top-0.5 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
              <CheckCircle2 className="size-3.5" />
            </div>

            <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <h3 className="text-sm font-bold text-foreground sm:text-base">
                  {evt.title}
                </h3>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {evt.timestamp}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {evt.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
