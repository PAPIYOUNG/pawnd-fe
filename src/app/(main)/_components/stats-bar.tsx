'use client';

import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

import { Card } from '@/components/ui/card';
import { SummaryStats } from '@/types/home';
import { cn } from '@/lib/utils';

interface StatsBarProps {
  stats: SummaryStats;
  socketUrl?: string;
}

/**
 * StatsBar Component (Client Component)
 * - แสดงแถบตัวเลขสถิติ 4 ช่อง (กำลังตามหา, แจ้งพบ, พากลับบ้านสำเร็จ, สมาชิกชุมชน)
 * - ตัวเลขและหัวข้อขนาดใหญ่ ชัดเจน โดดเด่น มองเห็นง่าย
 * - แสดงค่ายอดรวมจริงจาก Backend ผ่าน Props ตั้งต้น
 * - เชื่อมต่อ WebSocket กับ Backend (/home namespace) เพื่อรับ Event stats_update แบบ Realtime แท้จริง
 * - นำ Mock ticker simulation ที่สุ่มขยับตัวเลขออกทั้งหมด 100%
 */
export function StatsBar({ stats: initialStats, socketUrl }: StatsBarProps) {
  // State เก็บตัวเลขสถิติที่แสดงผลแบบ Realtime จาก Database จริง
  const [liveStats, setLiveStats] = useState(initialStats);
  // State เก็บ Index ของการ์ดที่กำลังได้รับการ Highlight เมื่อมีตัวเลขอัปเดตจริงจาก Socket
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  // ซิงค์ liveStats เมื่อ initialStats อัปเดตจาก Server ตามคำแนะนำของ React
  const [prevInitialStats, setPrevInitialStats] = useState(initialStats);
  if (initialStats !== prevInitialStats) {
    setPrevInitialStats(initialStats);
    setLiveStats(initialStats);
  }

  // เชื่อมต่อ WebSocket จริงกับ Backend HomeGateway (namespace: /home)
  useEffect(() => {
    const baseUrl =
      socketUrl ||
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:8000';

    const namespaceUrl = `${baseUrl.replace(/\/$/, '')}/home`;
    let socket: Socket | null = null;

    try {
      socket = io(namespaceUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
      });

      // เมื่อเชื่อมต่อสำเร็จ ส่งคำขอ subscribe ข้อมูลล่าสุด
      socket.on('connect', () => {
        socket?.emit('subscribe');
      });

      // รับ Event stats_update ข้อมูลสถิติจริงจากเซิร์ฟเวอร์
      socket.on('stats_update', (newStats: SummaryStats) => {
        if (!newStats) return;

        // ตรวจสอบว่ามีช่องไหนที่มีตัวเลขเปลี่ยนแปลงจริงเพื่อทำแอนิเมชัน Highlight
        setLiveStats((prev) => {
          if (newStats.totalLost > prev.totalLost) setHighlightedIndex(0);
          else if (newStats.totalFound > prev.totalFound) setHighlightedIndex(1);
          else if (newStats.totalReunited > prev.totalReunited) setHighlightedIndex(2);
          else if (newStats.totalUsers > prev.totalUsers) setHighlightedIndex(3);
          return newStats;
        });

        // ปลดสถานะ Highlight หลังแสดงผล 1.5 วินาที
        const timeout = setTimeout(() => {
          setHighlightedIndex(null);
        }, 1500);
        return () => clearTimeout(timeout);
      });
    } catch {
      // หากเชื่อมต่อ socket ไม่สำเร็จ จะใช้ข้อมูลจริงจาก HTTP SSR ต่อไป
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socketUrl]);


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
    <section className="w-full py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Grid Responsive: 1 คอลัมน์บนมือถือ, 2 คอลัมน์บนแท็บเล็ต, 4 คอลัมน์บนเดสก์ท็อป */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statItems.map((item, index) => {
            const isHighlighted = highlightedIndex === index;

            return (
              <Card
                key={index}
                className={cn(
                  'relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/70 bg-card p-6 sm:p-7 shadow-xs transition-all duration-500 hover:shadow-md hover:-translate-y-0.5',
                  isHighlighted && 'ring-2 ring-primary/50 bg-primary/5 scale-[1.02] shadow-lg'
                )}
              >
                {/* แถวบน: ชื่อสถิติ (ขนาดใหญ่ขึ้น ชัดเจน) และป้ายแจ้งเตือน +1 */}
                <div className="flex items-center justify-between min-h-[24px]">
                  <span className="text-sm sm:text-base font-bold text-foreground/85">
                    {item.label}
                  </span>
                  {/* ป้าย +1 กระโดดแจ้งเตือนเมื่อมีการอัปเดตแบบ Realtime */}
                  {isHighlighted && (
                    <span className="animate-bounce rounded-full bg-primary/10 px-2 py-0.5 text-xs font-extrabold text-primary shadow-xs">
                      +1
                    </span>
                  )}
                </div>

                {/* แถวกลาง: ตัวเลขสถิติขนาดใหญ่พิเศษ (text-4xl ถึง text-5xl) และหน่วยนับ */}
                <div className="my-3 flex items-baseline gap-2">
                  <span
                    className={cn(
                      'text-4xl sm:text-5xl font-black tracking-tight transition-all duration-300',
                      item.valueColor,
                      isHighlighted && 'scale-105'
                    )}
                  >
                    {item.value}
                  </span>
                  <span className={cn('text-base sm:text-lg font-bold', item.valueColor)}>
                    {item.unit}
                  </span>
                </div>

                {/* แถวล่าง: คำอธิบายประกอบสถิติ ตัวหนังสือชัดเจนขึ้น */}
                <div className="text-xs sm:text-sm font-medium text-muted-foreground">
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
