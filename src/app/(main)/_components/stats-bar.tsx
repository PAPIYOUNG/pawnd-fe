'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { SummaryStats } from '@/types/home';
import { cn } from '@/lib/utils';

interface StatsBarProps {
  stats: SummaryStats;
}

export function StatsBar({ stats: initialStats }: StatsBarProps) {
  // Live stats directly initialized with actual values (no count-up from 0)
  const [liveStats, setLiveStats] = useState(initialStats);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  // Periodic Live Ticker Simulation (increments +1 periodically)
  useEffect(() => {
    const interval = setInterval(() => {
      const randomStatIndex = Math.floor(Math.random() * 4);
      setHighlightedIndex(randomStatIndex);

      setLiveStats((prev) => {
        switch (randomStatIndex) {
          case 0:
            return { ...prev, totalLost: prev.totalLost + 1 };
          case 1:
            return { ...prev, totalFound: prev.totalFound + 1 };
          case 2:
            return { ...prev, totalReunited: prev.totalReunited + 1 };
          case 3:
            return { ...prev, totalUsers: prev.totalUsers + 1 };
          default:
            return prev;
        }
      });

      // Clear highlight after 1.5s
      const timeout = setTimeout(() => {
        setHighlightedIndex(null);
      }, 1500);

      return () => clearTimeout(timeout);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const statItems = [
    {
      label: 'สัตว์เลี้ยงกำลังตามหา',
      value: liveStats.totalLost.toLocaleString(),
      unit: 'รายการ',
      subtitle: 'กำลังดำเนินการค้นหา',
      valueColor: 'text-[#EF4444]',
    },
    {
      label: 'แจ้งพบสัตว์พลัดหลง',
      value: liveStats.totalFound.toLocaleString(),
      unit: 'ครั้ง',
      subtitle: 'พบสัตว์และรอเจ้าของ',
      valueColor: 'text-primary',
    },
    {
      label: 'พากลับบ้านสำเร็จแล้ว',
      value: liveStats.totalReunited.toLocaleString(),
      unit: 'ตัว',
      subtitle: 'ได้กลับไปหาเจ้าของปลอดภัย',
      valueColor: 'text-primary',
    },
    {
      label: 'สมาชิกในชุมชน',
      value: liveStats.totalUsers.toLocaleString(),
      unit: 'คน',
      subtitle: 'ร่วมมือช่วยเหลือในชุมชน',
      valueColor: 'text-[#164E36]',
    },
  ];

  return (
    <section className="w-full py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statItems.map((item, index) => {
            const isHighlighted = highlightedIndex === index;

            return (
              <Card
                key={index}
                className={cn(
                  'relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-2xs transition-all duration-500 hover:shadow-sm',
                  isHighlighted && 'ring-2 ring-primary/50 bg-primary/5 scale-[1.02] shadow-md'
                )}
              >
                {/* Header & Status Indicator */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isHighlighted && (
                      <span className="animate-bounce text-[11px] font-bold text-primary">
                        +1
                      </span>
                    )}
                    <span className="flex size-2">
                      <span className="size-2 animate-ping rounded-full bg-primary opacity-60" />
                    </span>
                  </div>
                </div>

                {/* Stat Numbers */}
                <div className="my-2 flex items-baseline gap-1.5">
                  <span
                    className={cn(
                      'text-3xl font-extrabold tracking-tight transition-all duration-300',
                      item.valueColor,
                      isHighlighted && 'scale-105'
                    )}
                  >
                    {item.value}
                  </span>
                  <span className={cn('text-sm font-semibold', item.valueColor)}>
                    {item.unit}
                  </span>
                </div>

                {/* Subtitle */}
                <div className="text-xs text-muted-foreground/80">
                  {item.subtitle}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
