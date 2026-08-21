import { Metadata } from 'next';
import { FileText, Flag, UserPlus, Users } from 'lucide-react';

import { MonthlyTrendChart } from './_components/monthly-trend-chart';
import { QuickActionsCard } from './_components/quick-actions-card';
import { StatCard } from './_components/stat-card';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

const STATS = [
  {
    label: 'ผู้ใช้ทั้งหมด',
    value: '12,480 คน',
    changeLabel: '+12.4% จากเดือนก่อน',
    changeDirection: 'up',
    icon: Users,
    tone: 'emerald',
  },
  {
    label: 'โพสต์ทั้งหมด',
    value: '3,842 รายการ',
    changeLabel: '+8.3% จากเดือนก่อน',
    changeDirection: 'up',
    icon: FileText,
    tone: 'blue',
  },
  {
    label: 'รายงานรอตรวจสอบ',
    value: '18 เคส',
    changeLabel: '-15.2% จากสัปดาห์ก่อน',
    changeDirection: 'down',
    icon: Flag,
    tone: 'red',
  },
  {
    label: 'สมาชิกใหม่วันนี้',
    value: '145 คน',
    changeLabel: '+24.3% เมื่อเทียบเมื่อวาน',
    changeDirection: 'up',
    icon: UserPlus,
    tone: 'amber',
  },
] as const;

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            แดชบอร์ดผู้ดูแลระบบ
          </h1>
          <p className="text-sm text-muted-foreground">
            สถิติการใช้งานและภาพรวม Pawnd และกิจกรรมล่าสุดนี้
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          ADMIN PANEL
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MonthlyTrendChart />
        </div>
        <QuickActionsCard />
      </div>
    </div>
  );
}
