import { Card } from '@/components/ui/card';
import { SummaryStats } from '@/types/home';

interface StatsBarProps {
  stats: SummaryStats;
}

export function StatsBar({ stats }: StatsBarProps) {
  const statItems = [
    {
      label: 'สัตว์เลี้ยงกำลังตามหา',
      value: stats.totalLost.toLocaleString(),
      unit: 'รายการ',
      subtitle: 'กำลังดำเนินการค้นหา',
      valueColor: 'text-[#EF4444]',
    },
    {
      label: 'แจ้งพบสัตว์พลัดหลง',
      value: stats.totalFound.toLocaleString(),
      unit: 'ครั้ง',
      subtitle: 'พบสัตว์และรอเจ้าของ',
      valueColor: 'text-primary',
    },
    {
      label: 'พากลับบ้านสำเร็จแล้ว',
      value: stats.totalReunited.toLocaleString(),
      unit: 'ตัว',
      subtitle: 'ได้กลับไปหาเจ้าของปลอดภัย',
      valueColor: 'text-primary',
    },
    {
      label: 'สมาชิกในชุมชน',
      value: stats.totalUsers.toLocaleString(),
      unit: 'คน',
      subtitle: 'ร่วมมือช่วยเหลือในชุมชน',
      valueColor: 'text-[#164E36]',
    },
  ];

  return (
    <section className="w-full py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statItems.map((item, index) => (
            <Card
              key={index}
              className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 shadow-2xs transition-shadow hover:shadow-sm"
            >
              <div className="text-xs font-medium text-muted-foreground">
                {item.label}
              </div>

              <div className="my-2 flex items-baseline gap-1.5">
                <span className={`text-3xl font-extrabold tracking-tight ${item.valueColor}`}>
                  {item.value}
                </span>
                <span className={`text-sm font-semibold ${item.valueColor}`}>
                  {item.unit}
                </span>
              </div>

              <div className="text-xs text-muted-foreground/80">
                {item.subtitle}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
