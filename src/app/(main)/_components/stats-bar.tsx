'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { SummaryStats } from '@/types/home';
import { cn } from '@/lib/utils';

interface StatsBarProps {
  stats: SummaryStats;
}

// Custom hook for smooth ease-out count-up animation
function useCountUp(target: number, duration = 1600, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic: 1 - Math.pow(1 - progress, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration, start]);

  return count;
}

export function StatsBar({ stats: initialStats }: StatsBarProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Live simulation states
  const [liveStats, setLiveStats] = useState(initialStats);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  // Detect when section comes into viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Periodic Live Ticker Simulation (adds +1 occasionally to make it feel real-time)
  useEffect(() => {
    if (!isInView) return;

    const interval = setInterval(() => {
      // Pick a random stat to increment
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

      // Clear highlight after 1.2s
      const timeout = setTimeout(() => {
        setHighlightedIndex(null);
      }, 1200);

      return () => clearTimeout(timeout);
    }, 7000);

    return () => clearInterval(interval);
  }, [isInView]);

  // Animated counters
  const animatedLost = useCountUp(liveStats.totalLost, 1500, isInView);
  const animatedFound = useCountUp(liveStats.totalFound, 1600, isInView);
  const animatedReunited = useCountUp(liveStats.totalReunited, 1700, isInView);
  const animatedUsers = useCountUp(liveStats.totalUsers, 1800, isInView);

  const statItems = [
    {
      label: 'สัตว์เลี้ยงกำลังตามหา',
      value: animatedLost.toLocaleString(),
      unit: 'รายการ',
      subtitle: 'กำลังดำเนินการค้นหา',
      valueColor: 'text-[#EF4444]',
    },
    {
      label: 'แจ้งพบสัตว์พลัดหลง',
      value: animatedFound.toLocaleString(),
      unit: 'ครั้ง',
      subtitle: 'พบสัตว์และรอเจ้าของ',
      valueColor: 'text-primary',
    },
    {
      label: 'พากลับบ้านสำเร็จแล้ว',
      value: animatedReunited.toLocaleString(),
      unit: 'ตัว',
      subtitle: 'ได้กลับไปหาเจ้าของปลอดภัย',
      valueColor: 'text-primary',
    },
    {
      label: 'สมาชิกในชุมชน',
      value: animatedUsers.toLocaleString(),
      unit: 'คน',
      subtitle: 'ร่วมมือช่วยเหลือในชุมชน',
      valueColor: 'text-[#164E36]',
    },
  ];

  return (
    <section ref={sectionRef} className="w-full py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statItems.map((item, index) => {
            const isHighlighted = highlightedIndex === index;

            return (
              <Card
                key={index}
                className={cn(
                  'relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-2xs transition-all duration-500 hover:shadow-sm',
                  isHighlighted && 'ring-2 ring-primary/40 bg-primary/5 scale-[1.02]'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </span>
                  {/* Subtle live indicator dot */}
                  <span className="flex size-2">
                    <span className="size-2 animate-ping rounded-full bg-primary opacity-60" />
                  </span>
                </div>

                <div className="my-2 flex items-baseline gap-1.5">
                  <span
                    className={cn(
                      'text-3xl font-extrabold tracking-tight transition-all duration-300',
                      item.valueColor
                    )}
                  >
                    {item.value}
                  </span>
                  <span className={cn('text-sm font-semibold', item.valueColor)}>
                    {item.unit}
                  </span>
                </div>

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
