import { Metadata } from 'next';
import Link from 'next/link';
import {
  LayoutDashboard,
  TrendingUp,
  Activity,
  Heart,
  Megaphone,
  CheckCircle,
  Bell,
  Sparkles,
  MapPin,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

import { getCurrentUser } from '@/services/user.service';
import { UserStatsGrid } from '../profile/_components/user-stats-grid';
import { UserMyPetsGrid } from '../profile/_components/user-my-pets-grid';
import { UserPostHistoryTable } from '../profile/_components/user-post-history-table';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'แดชบอร์ดหลัก | PAWND',
  description: 'แดชบอร์ดสรุปภาพรวมระบบ ประกาศ และการจับคู่สัตว์เลี้ยงด้วย AI',
};

/**
 * DashboardMainPage (Server Component - RSC)
 * - โครงสร้างหน้าแดชบอร์ดหลักของระบบ (Main Dashboard)
 * - แสดงสถิติรวม แบนเนอร์สถานะ AI Matching กิจกรรมล่าสุด และทางลัดจัดการ
 */
export default async function DashboardMainPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* 1. ส่วนหัวของหน้าแดชบอร์ด */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <LayoutDashboard className="size-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Main Dashboard
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            แดชบอร์ดภาพรวมระบบ
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            ยินดีต้อนรับ คุณ{user.firstName} • ติดตามสถานะสัตว์เลี้ยงและประกาศแบบเรียลไทม์
          </p>
        </div>

        {/* ทางลัด CTA */}
        <div className="flex items-center gap-2.5">
          <Link href="/posts/create">
            <Button className="h-10 rounded-2xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90">
              <Megaphone className="mr-1.5 size-4" />
              <span>สร้างประกาศแจ้งหาย</span>
            </Button>
          </Link>
          <Link href="/profile/pets">
            <Button variant="outline" className="h-10 rounded-2xl px-4 text-xs font-semibold">
              <Heart className="mr-1.5 size-4 text-primary" />
              <span>โปรไฟล์สัตว์เลี้ยง</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. แบนเนอร์สถานะระบบ AI Smart Matching */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 sm:flex-row sm:items-center dark:bg-emerald-950/25">
        <div className="flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xs">
            <Sparkles className="size-6" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">
              AI Smart Matching System (Active)
            </h3>
            <p className="text-xs text-muted-foreground">
              ระบบกำลังสแกนเปรียบเทียบภาพสัตว์เลี้ยงและพิกัดแผนที่เพื่อจับคู่เคสอัตโนมัติ
            </p>
          </div>
        </div>
        <Link
          href="/matches"
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-300"
        >
          <span>ดูผลการจับคู่ AI</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* 3. สถิติ 3 กล่องข้อมูล */}
      <UserStatsGrid
        totalPets={user.stats?.totalPets}
        totalLostPosts={user.stats?.totalLostPosts}
        totalReunited={user.stats?.totalReunited}
      />

      {/* 4. สัตว์เลี้ยงของฉัน */}
      <UserMyPetsGrid pets={user.pets} />

      {/* 5. ประวัติและสถานะประกาศ */}
      <UserPostHistoryTable posts={user.postsHistory} />
    </div>
  );
}
