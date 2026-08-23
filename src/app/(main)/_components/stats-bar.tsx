'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { SummaryStats } from '@/types/home';
import { cn } from '@/lib/utils';

interface StatsBarProps {
  stats: SummaryStats;
}

/**
 * StatsBar Component (Client Component)
 * - แสดงแถบตัวเลขสถิติ 4 ช่อง (กำลังตามหา, แจ้งพบ, พากลับบ้านสำเร็จ, สมาชิกชุมชน)
 * - แสดงค่ายอดรวมจริงทันทีเมื่อโหลดหน้าเว็บ
 * - มีระบบ Realtime Live Ticker Simulation สุ่มจำลองการเพิ่มขึ้นของตัวเลข (+1) ทุกๆ 6 วินาที
 *   พร้อมแอนิเมชัน Highlight และป้ายเตือน `+1` เพื่อให้หน้าเว็บดูมีความเคลื่อนไหวของคอมมูนิตี้
 */
export function StatsBar({ stats: initialStats }: StatsBarProps) {
  // State เก็บตัวเลขสถิติที่แสดงผลแบบ Realtime (เริ่มต้นจากค่าที่ Fetch มาจาก Backend)
  const [liveStats, setLiveStats] = useState(initialStats);
  // State เก็บ Index ของการ์ดที่กำลังได้รับการ Highlight เมื่อมีตัวเลขเพิ่มขึ้น (+1)
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  // ระบบจำลอง Realtime Live Ticker สุ่มขยับตัวเลขเพิ่มขึ้นเป็นระยะ
  useEffect(() => {
    const interval = setInterval(() => {
      // สุ่มเลือกการ์ดสถิติ 1 ใน 4 ช่อง
      const randomStatIndex = Math.floor(Math.random() * 4);
      setHighlightedIndex(randomStatIndex);

      // อัปเดตยอดตัวเลขเพิ่มขึ้น +1 ในช่องที่สุ่มได้
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

      // ปลดสถานะ Highlight หลังผ่านไป 1.5 วินาที
      const timeout = setTimeout(() => {
        setHighlightedIndex(null);
      }, 1500);

      return () => clearTimeout(timeout);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // โครงสร้างข้อมูลสำหรับวนลูปเรนเดอร์การ์ดสถิติทั้ง 4 ช่อง
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
      valueColor: 'text-[#164E36] dark:text-[#6EE7B7]',
    },
  ];

  return (
    <section className="w-full py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Grid Responsive: 1 คอลัมน์บนมือถือ, 2 คอลัมน์บนแท็บเล็ต, 4 คอลัมน์บนเดสก์ท็อป */}
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
                {/* แถวบน: ชื่อสถิติ และป้ายแจ้งเตือน +1 เมื่อตัวเลขขยับ */}
                <div className="flex items-center justify-between min-h-[20px]">
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </span>
                  {/* ป้าย +1 กระโดดแจ้งเตือนเมื่อมีการอัปเดตแบบ Realtime */}
                  {isHighlighted && (
                    <span className="animate-bounce text-[11px] font-bold text-primary">
                      +1
                    </span>
                  )}
                </div>

                {/* แถวกลาง: ตัวเลขสถิติและหน่วยนับ */}
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

                {/* แถวล่าง: คำอธิบายประกอบสถิติ */}
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
