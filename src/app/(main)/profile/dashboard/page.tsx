import { Metadata } from 'next';
import Link from 'next/link';
import {
  LayoutDashboard,
  TrendingUp,
  Activity,
  Heart,
  Megaphone,
  CheckCircle,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

import { getCurrentUser } from '@/services/user.service';
import { UserStatsGrid } from '../_components/user-stats-grid';
import { UserMyPetsGrid } from '../_components/user-my-pets-grid';
import { UserPostHistoryTable } from '../_components/user-post-history-table';

export const metadata: Metadata = {
  title: 'แดชบอร์ดสรุป | PAWND',
  description: 'แดชบอร์ดสรุปภาพรวมกิจกรรม ประกาศ และการจับคู่สัตว์เลี้ยงด้วย AI',
};

/**
 * DashboardPage (Server Component - RSC)
 * - หน้าแดชบอร์ดสรุปผลการทำงานและกิจกรรมของผู้ใช้งาน (Dashboard Overview)
 */
export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-8">
      {/* ส่วนหัวหน้าแดชบอร์ด */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary">
          <LayoutDashboard className="size-6" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Dashboard Overview
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          ยินดีต้อนรับ, คุณ{user.firstName} 👋
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          ติดตามสถานะสัตว์เลี้ยง ประกาศตามหา และการแจ้งเตือน AI Matching แบบเรียลไทม์
        </p>
      </div>

      {/* แบนเนอร์ AI Model Active Status */}
      <div className="flex items-center justify-between rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 dark:bg-emerald-950/30">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xs">
            <Activity className="size-5" />
          </div>
          <div>
            <h4 className="font-bold text-foreground">
              AI Smart Matching Model v2.4 (Active)
            </h4>
            <p className="text-xs text-muted-foreground">
              ระบบกำลังสแกนและจับคู่ภาพสัตว์เลี้ยงในระบบแบบอัตโนมัติตลอด 24 ชม.
            </p>
          </div>
        </div>
        <span className="hidden rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-700 sm:inline-block dark:text-emerald-300">
          ระบบทำงานปกติ 100%
        </span>
      </div>

      {/* สถิติ 3 กล่อง */}
      <UserStatsGrid
        totalPets={user.stats?.totalPets}
        totalLostPosts={user.stats?.totalLostPosts}
        totalReunited={user.stats?.totalReunited}
      />

      {/* สัตว์เลี้ยงของฉัน */}
      <UserMyPetsGrid pets={user.pets} />

      {/* ประวัติประกาศ */}
      <UserPostHistoryTable posts={user.postsHistory} />
    </div>
  );
}
