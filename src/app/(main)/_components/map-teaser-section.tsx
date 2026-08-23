import Link from 'next/link';
import { MapPin, Navigation } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * MapTeaserSection Component
 * - ส่วนแสดงตัวอย่างแผนที่ตำแหน่งสัตว์เลี้ยงหายและพบสัตว์พลัดหลง (Interactive Map Teaser)
 * - ใช้ภาพกราฟิกเวกเตอร์ SVG จำลองแผนที่เมือง แม่น้ำ สะพาน และหมุดพิกัด (Pins)
 * - มีหมุดสีแดง (สัตว์หาย) และหมุดสีเขียว (พบสัตว์พลัดหลง) พร้อมแอนิเมชันคลื่นกระจาย (Ping Animation)
 * - มีการ์ดข้อมูลลอยตัว (Floating Info Card) บอกจุดเสี่ยงในพิกัด 5 กิโลเมตร
 * - มีปุ่ม CTA "ดูแผนที่เต็มจอ" เชื่อมโยงไปยังหน้าแผนที่หลัก (/map)
 */
export function MapTeaserSection() {
  return (
    <section className="w-full py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* หัวข้อประจำ Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            สำรวจพื้นที่ผ่านแผนที่สัตว์เลี้ยงหาย
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            ดูตำแหน่งสัตว์ที่หายและพบในพื้นที่ของคุณ เพื่อช่วยระวังภัยและค้นหาเบาะแสได้ไวขึ้น
          </p>
        </div>

        {/* กรอบแสดงแผนที่จำลอง (Map Container) */}
        <div className="relative mt-8 overflow-hidden rounded-3xl border border-border/80 bg-[#FDF9F3] shadow-md dark:border-border/60 dark:bg-[#121B17]">
          {/* เวกเตอร์กราฟิกจำลองแผนที่เมืองและแม่น้ำ */}
          <div className="relative h-[320px] w-full sm:h-[400px]">
            <svg
              viewBox="0 0 1000 500"
              className="h-full w-full object-cover"
              preserveAspectRatio="xMidYMid slice"
              aria-label="แผนที่จำลองตำแหน่งสัตว์เลี้ยง"
            >
              {/* พื้นดินแผนที่ */}
              <rect width="1000" height="500" fill="#FBF5EB" className="dark:fill-[#14261F]" />

              {/* บล็อกอาคารและแปลงที่ดิน */}
              <path
                d="M50 40h120v70H50zM220 30h160v60H220zM420 50h140v80H420zM620 30h180v70H620zM840 40h120v90H840z"
                fill="#F4ECE1"
                className="dark:fill-[#1B332A]"
              />
              <path
                d="M60 220h140v90H60zM250 250h110v80H250zM400 360h160v100H400zM600 340h150v90H600zM800 330h140v120H800z"
                fill="#F4ECE1"
                className="dark:fill-[#1B332A]"
              />
              <path
                d="M100 360h120v90H100zM700 220h120v60H700zM860 180h100v80H860z"
                fill="#EAE0D2"
                className="dark:fill-[#224035]"
              />

              {/* เส้นทางถนนสายหลัก */}
              <path
                d="M0 160 Q 250 140, 500 180 T 1000 150"
                fill="none"
                stroke="#FFFFFF"
                className="dark:stroke-[#2F5244]"
                strokeWidth="18"
              />
              <path
                d="M0 320 Q 300 350, 600 310 T 1000 340"
                fill="none"
                stroke="#FFFFFF"
                className="dark:stroke-[#2F5244]"
                strokeWidth="14"
              />
              <path
                d="M200 0 Q 180 250, 220 500"
                fill="none"
                stroke="#FFFFFF"
                className="dark:stroke-[#2F5244]"
                strokeWidth="14"
              />
              <path
                d="M580 0 Q 560 250, 600 500"
                fill="none"
                stroke="#FFFFFF"
                className="dark:stroke-[#2F5244]"
                strokeWidth="14"
              />
              <path
                d="M820 0 Q 850 250, 800 500"
                fill="none"
                stroke="#FFFFFF"
                className="dark:stroke-[#2F5244]"
                strokeWidth="12"
              />

              {/* สายน้ำ / แม่น้ำหลัก */}
              <path
                d="M0 240 C 200 270, 300 190, 480 230 C 650 270, 780 180, 1000 220 L 1000 265 C 780 225, 650 315, 480 275 C 300 235, 200 315, 0 285 Z"
                fill="#A6D5D8"
                className="dark:fill-[#20606B]"
                opacity="0.85"
              />

              {/* สะพานข้ามแม่น้ำ */}
              <rect x="195" y="240" width="24" height="48" fill="#FFFFFF" className="dark:fill-[#386655]" rx="2" />
              <rect x="575" y="248" width="24" height="48" fill="#FFFFFF" className="dark:fill-[#386655]" rx="2" />

              {/* หมุดแสดงตำแหน่งสัตว์หาย (สีแดง - Lost Pin) */}
              <g transform="translate(480, 220)">
                <circle cx="0" cy="0" r="16" fill="#EF4444" opacity="0.25" className="animate-ping" />
                <circle cx="0" cy="0" r="12" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
              </g>

              {/* หมุดแสดงตำแหน่งพบสัตว์พลัดหลง (สีเขียว - Found Pin) */}
              <g transform="translate(640, 290)">
                <circle cx="0" cy="0" r="16" fill="#10B981" opacity="0.25" className="animate-ping" />
                <circle cx="0" cy="0" r="12" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
              </g>

              {/* หมุดสัตว์หายเพิ่มเติม */}
              <g transform="translate(780, 150)">
                <circle cx="0" cy="0" r="10" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />
              </g>

              {/* หมุดพบสัตว์เพิ่มเติม */}
              <g transform="translate(320, 170)">
                <circle cx="0" cy="0" r="10" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />
              </g>
            </svg>

            {/* การ์ดข้อมูลจำลองจุดเสี่ยงลอยตัวอยู่มุมบนซ้าย */}
            <div className="absolute top-4 left-4 z-10 max-w-[260px] rounded-2xl border border-border/80 bg-white/95 p-4 shadow-md backdrop-blur-xs sm:top-6 sm:left-6 sm:max-w-xs dark:bg-card/95 dark:border-border">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground sm:text-sm">
                <Navigation className="size-4 text-primary" />
                <span>จุดเสี่ยงในพิกัดของคุณ</span>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                พบประวัติสัตว์เลี้ยงหาย 6 รายการ และมีการแจ้งพบสัตว์ 3 รายการ ในระยะ 5 กิโลเมตร รอบตัวคุณ
              </p>
            </div>
          </div>
        </div>

        {/* ปุ่มสำหรับกดเปิดดูหน้าแผนที่แบบเต็มจอ */}
        <div className="mt-6 flex justify-center">
          <Link
            href="/map"
            className={cn(
              buttonVariants({ variant: 'default', size: 'lg' }),
              'rounded-2xl bg-primary px-7 py-6 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-105 hover:bg-primary/90'
            )}
          >
            <MapPin className="size-4.5" />
            <span>ดูแผนที่เต็มจอ</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
