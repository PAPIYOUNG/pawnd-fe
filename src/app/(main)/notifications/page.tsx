import { Metadata } from 'next';
import Link from 'next/link';
import {
  Bell,
  Sparkles,
  MapPin,
  MessageCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'การแจ้งเตือน | PAWND',
  description: 'ศูนย์รวมการแจ้งเตือน AI Matching เบาะแสสัตว์เลี้ยง และข้อความ',
};

// Mock ข้อมูลการแจ้งเตือน
const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'AI_MATCH',
    title: 'AI ตรวจพบสัตว์เลี้ยงที่มีลักษณะตรงกัน 94%!',
    description: 'พบเคสประกาศสัตว์เลี้ยงหลงทางใหม่ในรัศมี 3 กม. ที่มีลักษณะคล้ายน้อง Luna',
    timeAgo: '10 นาทีที่แล้ว',
    read: false,
    link: '/matches',
  },
  {
    id: 'notif-2',
    type: 'SIGHTING',
    title: 'มีผู้แจ้งเบาะแสใหม่ใกล้พิกัดของคุณ',
    description: 'มีผู้พบเห็นสุนัขพุดเดิลสีน้ำตาล สวมเสื้อเหลือง บริเวณลาดพร้าว 101',
    timeAgo: '2 ชั่วโมงที่แล้ว',
    read: false,
    link: '/map',
  },
  {
    id: 'notif-3',
    type: 'CHAT',
    title: 'ข้อความใหม่จากคุณ อารยา',
    description: '"สวัสดีค่ะ พอดีเห็นน้องแมวตรงซอย 4 คล้ายกับในประกาศเลยค่ะ"',
    timeAgo: 'เมื่อวานนี้',
    read: true,
    link: '/chat',
  },
  {
    id: 'notif-4',
    type: 'SYSTEM',
    title: 'ประกาศของคุณได้รับการเผยแพร่แล้ว',
    description: 'ประกาศตามหา "น้องส้มส้ม" พร้อมใช้งานในระบบและเริ่มค้นหาด้วย AI ทันที',
    timeAgo: '3 วันที่แล้ว',
    read: true,
    link: '/posts',
  },
];

/**
 * NotificationsPage (Server Component - RSC)
 * - หน้าศูนย์การแจ้งเตือนทั้งหมดของระบบ (Notifications Center)
 */
export default function NotificationsPage() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'AI_MATCH':
        return <Sparkles className="size-5 text-emerald-500" />;
      case 'SIGHTING':
        return <MapPin className="size-5 text-amber-500" />;
      case 'CHAT':
        return <MessageCircle className="size-5 text-primary" />;
      default:
        return <Bell className="size-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      {/* 1. ส่วนหัวของการแจ้งเตือน */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Bell className="size-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Notifications
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            การแจ้งเตือน
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            ติดตามผลการจับคู่ AI ข่าวสารเบาะแส และข้อความสำคัญ
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-2xl text-xs font-semibold"
        >
          อ่านทั้งหมดแล้ว
        </Button>
      </div>

      {/* 2. รายการการแจ้งเตือน */}
      <div className="mt-6 flex flex-col gap-3">
        {MOCK_NOTIFICATIONS.map((item) => (
          <Link
            key={item.id}
            href={item.link}
            className={cn(
              'group flex items-start gap-4 rounded-2xl border p-4 transition-all hover:shadow-md sm:p-5',
              item.read
                ? 'border-border/70 bg-card/60'
                : 'border-primary/40 bg-primary/5 dark:bg-primary/10'
            )}
          >
            {/* ไอคอนประเภทการแจ้งเตือน */}
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-card shadow-2xs">
              {getIcon(item.type)}
            </div>

            {/* ข้อความการแจ้งเตือน */}
            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-foreground group-hover:text-primary">
                  {item.title}
                </h4>
                {!item.read && (
                  <span className="size-2 rounded-full bg-primary" />
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                {item.description}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Clock className="size-3" />
                <span>{item.timeAgo}</span>
              </div>
            </div>

            <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary self-center" />
          </Link>
        ))}
      </div>
    </div>
  );
}
