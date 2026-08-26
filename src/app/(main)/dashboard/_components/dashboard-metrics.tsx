import { Heart, Megaphone, Home, MessageSquare } from 'lucide-react';

interface DashboardMetricsProps {
  totalPets?: number;
  activePosts?: number;
  totalReunited?: number;
  unreadMessages?: number;
  dogCount?: number;
  catCount?: number;
}

/**
 * DashboardMetrics Component (Server/Client Compatible Component)
 * - การ์ดสถิติ 4 ใบในแถวแรกของหน้าแดชบอร์ด ตรงตาม UI Mockup:
 *   1. สัตว์เลี้ยงของฉัน (3) - สุนัข 2, แมว 1 ตัว
 *   2. ประกาศที่ใช้งาน (2) - กำลังเร่งดำเนินการตามหา
 *   3. กลับบ้านแล้ว (5) - ส่งคืนเจ้าของสำเร็จ
 *   4. ข้อความที่ยังไม่อ่าน (12) - เบาะแสใหม่จากชุมชน
 */
export function DashboardMetrics({
  totalPets = 3,
  activePosts = 2,
  totalReunited = 5,
  unreadMessages = 12,
  dogCount = 2,
  catCount = 1,
}: DashboardMetricsProps) {
  const metrics = [
    {
      title: 'สัตว์เลี้ยงของฉัน',
      value: totalPets,
      subtitle: `สุนัข ${dogCount}, แมว ${catCount} ตัว`,
      icon: Heart,
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    },
    {
      title: 'ประกาศที่ใช้งาน',
      value: activePosts,
      subtitle: 'กำลังเร่งดำเนินการตามหา',
      icon: Megaphone,
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    },
    {
      title: 'กลับบ้านแล้ว',
      value: totalReunited,
      subtitle: 'ส่งคืนเจ้าของสำเร็จ',
      icon: Home,
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
