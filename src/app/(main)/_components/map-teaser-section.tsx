'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MapPin, Navigation, Layers } from 'lucide-react';
import { useState } from 'react';

import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// โหลดคอมโพเนนต์แผนที่จริงแบบ Dynamic Import (SSR: false) เพื่อรองรับ Leaflet และ Google Maps บนเบราว์เซอร์
const RealLeafletMap = dynamic(
  () => import('@/components/map/RealLeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] w-full items-center justify-center rounded-3xl bg-muted/60 sm:h-[450px]">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="size-12 rounded-full" />
          <span className="text-sm font-medium text-muted-foreground">
            กำลังโหลดแผนที่ดาวเทียมและพิกัดสัตว์เลี้ยง...
          </span>
        </div>
      </div>
    ),
  }
);

const GoogleMapsEmbed = dynamic(
  () => import('@/components/map/GoogleMapsEmbed'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] w-full items-center justify-center rounded-3xl bg-muted/60 sm:h-[450px]">
        <span className="text-sm font-medium text-muted-foreground">
          กำลังโหลด Google Maps...
        </span>
      </div>
    ),
  }
);

/**
 * MapTeaserSection Component
 * - ส่วนแสดงแผนที่จริงของประเทศไทย (Interactive Real Map Teaser)
 * - ค่าเริ่มต้น (Default): Version 1 — OpenStreetMap (Leaflet) พิกัดจริง พร้อมหมุดสัตว์หาย/พบสัตว์ และ Pop-up รูปภาพ
 * - ทางเลือกสำรอง (Alternative): Version 2 — Google Maps Embed
 * - มีปุ่มสลับประเภทแผนที่ (Map Provider Switcher) สำหรับให้ทีมงานทดสอบเปรียบเทียบทั้ง 2 เวอร์ชัน
 * - มีการ์ดข้อมูลลอยตัว (Floating Info Card) แจ้งเตือนจุดเสี่ยงรอบตัวในระยะ 5 กิโลเมตร
 */
export function MapTeaserSection() {
  // State สลับผู้ให้บริการแผนที่: 'leaflet' (OpenStreetMap) หรือ 'google' (Google Maps)
  const [mapProvider, setMapProvider] = useState<'leaflet' | 'google'>('leaflet');

  return (
    <section className="w-full py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ส่วนหัวของ Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            สำรวจพื้นที่ผ่านแผนที่สัตว์เลี้ยงหาย
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            ดูตำแหน่งสัตว์ที่หายและพบในพื้นที่ของคุณแบบ Realtime เพื่อช่วยระวังภัยและค้นหาเบาะแสได้ไวขึ้น
          </p>
        </div>

        {/* กรอบแสดงแผนที่จริง (Real Map Container) */}
        <div className="relative mt-8 overflow-hidden rounded-3xl border border-border/80 bg-card shadow-md dark:border-border/60">
          {/* เรนเดอร์แผนที่ตาม Provider ที่เลือก (Default: Leaflet / OpenStreetMap) */}
          {mapProvider === 'leaflet' ? (
            <RealLeafletMap heightClass="h-[360px] sm:h-[450px]" />
          ) : (
            <GoogleMapsEmbed heightClass="h-[360px] sm:h-[450px]" />
          )}

          {/* การ์ดข้อมูลลอยตัวแจ้งเตือนจุดเสี่ยง (Floating Info Overlay Card) มุมบนซ้าย */}
          <div className="pointer-events-none absolute top-4 left-4 z-[400] max-w-[260px] rounded-2xl border border-border/80 bg-white/95 p-4 shadow-md backdrop-blur-xs sm:top-6 sm:left-6 sm:max-w-xs dark:bg-card/95 dark:border-border">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground sm:text-sm">
              <Navigation className="size-4 text-primary" />
              <span>จุดเสี่ยงในพิกัดของคุณ</span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
              พบประวัติสัตว์เลี้ยงหาย 6 รายการ และมีการแจ้งพบสัตว์ 3 รายการ ในระยะ 5 กิโลเมตร รอบตัวคุณ
            </p>
          </div>

          {/* ปุ่มเครื่องมือสลับเวอร์ชันแผนที่ (Provider Switcher: OpenStreetMap vs Google Maps) มุมบนขวา */}
          <div className="absolute top-4 right-4 z-[400] flex items-center gap-1 rounded-2xl border border-border/70 bg-white/90 p-1 shadow-sm backdrop-blur-xs dark:bg-card/90">
            <button
              type="button"
              onClick={() => setMapProvider('leaflet')}
              className={cn(
                'flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-medium transition-colors',
                mapProvider === 'leaflet'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Layers className="size-3.5" />
              <span>OpenStreetMap</span>
            </button>
            <button
              type="button"
              onClick={() => setMapProvider('google')}
              className={cn(
                'flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-medium transition-colors',
                mapProvider === 'google'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>Google Maps</span>
            </button>
          </div>
        </div>

        {/* ปุ่ม CTA เปิดดูแผนที่เต็มจอ */}
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
