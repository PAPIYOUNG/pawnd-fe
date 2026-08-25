import { Metadata } from 'next';
import { FileText, Flag, PawPrint, Users } from 'lucide-react';

import { MonthlyTrendChart } from './_components/monthly-trend-chart';
import { QuickActionsCard } from './_components/quick-actions-card';
import { StatCard } from './_components/stat-card';
import { summaryAction } from '@/lib/action/admin.action';
import { DashboardSummary } from '@/types/admin';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

// สร้างรายการข้อมูลสำหรับการ์ดสถิติ (StatCard) จากข้อมูลสรุปที่ได้จาก Backend
// หมายเหตุ: Backend ยังไม่มีค่าเปอร์เซ็นต์การเปลี่ยนแปลง (trend) จึงแสดงเฉพาะจำนวนรวม
function buildStats(summary: DashboardSummary) {
  return [
    {
      label: 'ผู้ใช้ทั้งหมด',
      value: `${summary.users.total.toLocaleString('th-TH')} คน`,
      icon: Users,
      tone: 'emerald',
    },
    {
      label: 'โพสต์ทั้งหมด',
      value: `${summary.posts.total.toLocaleString('th-TH')} รายการ`,
      icon: FileText,
      tone: 'blue',
    },
    {
      label: 'รายงานรอตรวจสอบ',
      value: `${summary.reports.pending.toLocaleString('th-TH')} เคส`,
      icon: Flag,
      tone: 'red',
    },
    {
      label: 'สัตว์เลี้ยงทั้งหมด',
      value: `${summary.pets.total.toLocaleString('th-TH')} ตัว`,
      icon: PawPrint,
      tone: 'amber',
    },
  ] as const;
}

export default async function AdminPage() {
  const summary = await summaryAction();

  // Error State: เรียก API ไม่สำเร็จ ให้แสดงข้อความที่สุภาพแทน Raw Error
  if ('success' in summary) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            แดชบอร์ดผู้ดูแลระบบ
          </h1>
          <p className="text-sm text-muted-foreground">
            สถิติการใช้งานและภาพรวม Pawnd และกิจกรรมล่าสุดนี้
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-destructive/20 bg-destructive/5 p-10 text-center">
          <span className="text-sm font-medium text-destructive">
            ไม่สามารถโหลดข้อมูลสรุปแดชบอร์ดได้
          </span>
          <p className="text-xs text-muted-foreground">{summary.message}</p>
        </div>
      </div>
    );
  }

  const stats = buildStats(summary);

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
        {stats.map((stat) => (
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
