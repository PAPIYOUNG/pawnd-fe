import { Heart, Megaphone, Search, MessageSquare } from 'lucide-react';

interface DashboardMetricsProps {
  totalPets?: number;
  activeLostPosts?: number;
  activeFoundPosts?: number;
  unreadMessages?: number;
}

/**
 * DashboardMetrics Component (Server/Client Compatible Component)
 * - การ์ดสถิติ 4 ใบในแถวแรกของหน้าแดชบอร์ด:
 *   1. สัตว์เลี้ยงของฉัน (จำนวนรวม ไม่แยกชนิด)
 *   2. ประกาศตามหา (LOST) ที่ Active
 *   3. ประกาศพบเจอ (FOUND) ที่ Active
 *   4. ข้อความที่ยังไม่อ่าน
 */
export function DashboardMetrics({
  totalPets = 3,
  activeLostPosts = 1,
  activeFoundPosts = 1,
  unreadMessages = 12,
}: DashboardMetricsProps) {
  const metrics = [
    {
      title: 'สัตว์เลี้ยงของฉัน',
      value: totalPets,
      subtitle: 'สัตว์เลี้ยงทั้งหมดของคุณ',
      icon: Heart,
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    },
    {
      title: 'ประกาศตามหา (LOST)',
      value: activeLostPosts,
      subtitle: 'กำลังเร่งดำเนินการตามหา',
      icon: Megaphone,
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    },
    {
      title: 'ประกาศพบเจอ (FOUND)',
      value: activeFoundPosts,
      subtitle: 'แจ้งพบเห็นที่ยังไม่จบเคส',
      icon: Search,
      iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    },
    {
      title: 'ข้อความที่ยังไม่อ่าน',
      value: unreadMessages,
      subtitle: 'เบาะแสใหม่จากชุมชน',
      icon: MessageSquare,
      iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={index}
            className="flex items-center gap-4 rounded-3xl border border-border/80 bg-card p-5 shadow-2xs transition-all hover:shadow-sm"
          >
            {/* กล่องไอคอนมนกลม */}
            <div
              className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${item.iconBg}`}
            >
              <Icon className="size-6 stroke-[2.2]" />
            </div>

            {/* ข้อมูลตัวเลขและคำอธิบาย */}
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-muted-foreground">
                {item.title}
              </span>
              <span className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {item.value}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {item.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
