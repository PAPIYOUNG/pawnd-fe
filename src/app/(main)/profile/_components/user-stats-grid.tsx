import { Heart, Megaphone, CheckCircle } from 'lucide-react';

interface UserStatsGridProps {
  totalPets?: number;
  totalLostPosts?: number;
  totalReunited?: number;
}

/**
 * UserStatsGrid Component (Server Component)
 * - ส่วนแสดงสถิติสรุป 3 กล่องข้อมูล (Summary Stats Grid) ของผู้ใช้
 * - ปรับขนาด Responsive ให้พอดีและสวยงามทั้งบนหน้าจอมือถือ (3 คอลัมน์) และคอมพิวเตอร์
 */
export function UserStatsGrid({
  totalPets = 3,
  totalLostPosts = 5,
  totalReunited = 2,
}: UserStatsGridProps) {
  const stats = [
    {
      value: `${totalPets} ตัว`,
      label: 'สัตว์เลี้ยงทั้งหมด',
      icon: Heart,
    },
    {
      value: `${totalLostPosts} รายการ`,
      label: 'ประกาศแจ้งหาย',
      icon: Megaphone,
    },
    {
      value: `${totalReunited} ตัว`,
      label: 'กลับบ้านสำเร็จ',
      icon: CheckCircle,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-6">
      {stats.map((stat, idx) => {
        return (
          <div
            key={idx}
            className="flex flex-col justify-center rounded-2xl border border-border/80 bg-card p-3 text-center shadow-2xs transition-all hover:shadow-md sm:rounded-3xl sm:p-6 sm:text-left dark:border-border/60"
          >
            <span className="text-xl font-extrabold tracking-tight text-emerald-600 sm:text-4xl dark:text-emerald-400">
              {stat.value}
            </span>
            <span className="mt-1 text-[11px] font-medium text-muted-foreground sm:mt-2 sm:text-sm line-clamp-1">
              {stat.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
