'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Navigation,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// โหลดคอมโพเนนต์แผนที่จริงแบบ Dynamic Import (SSR: false)
const RealLeafletMap = dynamic(
  () => import('@/components/map/RealLeafletMap'),
  { ssr: false }
);

const GoogleMapsEmbed = dynamic(
  () => import('@/components/map/GoogleMapsEmbed'),
  { ssr: false }
);

// ข้อมูลจำลองรายการสัตว์เลี้ยงหายและพบในระยะใกล้เคียง (Nearby Pet Cases)
const NEARBY_PET_CASES = [
  {
    id: 'mock-1',
    name: 'น้องส้มส้ม',
    breed: 'แมวไทย สีส้มลายเสือ',
    type: 'LOST' as const,
    distance: '1.2 กม.',
    location: 'อ่อนนุช 46, กทม.',
    imageUrl:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 'mock-2',
    name: 'ไซบีเรียนเพศผู้',
    breed: 'ไซบีเรียน ฮัสกี้',
    type: 'FOUND' as const,
    distance: '2.5 กม.',
    location: 'ถ.งามวงศ์วาน, นนทบุรี',
    imageUrl:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 'mock-3',
    name: 'ช็อกโก้',
    breed: 'พุดเดิ้ลทอย สีน้ำตาล',
    type: 'LOST' as const,
    distance: '3.8 กม.',
    location: 'ลาดพร้าว 101, กทม.',
    imageUrl:
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=200&auto=format&fit=crop',
  },
];

/**
 * MapTeaserSection Component (Client Component)
 * - ส่วนแสดงแผนที่จริงของประเทศไทย (Interactive Real Map Teaser)
 * - แก้ไขปัญหา React DevTools Suspense Cleanup Error ด้วยการครอบ Suspense Boundary ที่ชัดเจน
 * - การ์ดแจ้งเตือนจุดเสี่ยงและ List รายการในระยะใกล้ สามารถ "กดย่อ-ขยาย (Collapse / Expand)" ได้ เพื่อไม่ให้บดบังแผนที่
 * - รองรับการสลับระหว่าง OpenStreetMap (Leaflet) และ Google Maps
 */
export function MapTeaserSection() {
  // State ตรวจสอบการ Mount ฝั่ง Client ป้องกัน Hydration และ Suspense DevTools Mismatch
  const [isMounted, setIsMounted] = useState(false);

  // State สลับผู้ให้บริการแผนที่: 'leaflet' (OpenStreetMap) หรือ 'google' (Google Maps)
  const [mapProvider, setMapProvider] = useState<'leaflet' | 'google'>('leaflet');

  // State ย่อ/ขยายการ์ดแจ้งเตือนจุดเสี่ยงรอบตัว (Collapsible Nearby Panel)
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section className="w-full py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 1. ส่วนหัวของ Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            สำรวจพื้นที่ผ่านแผนที่สัตว์เลี้ยงหาย
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            ดูตำแหน่งสัตว์ที่หายและพบในพื้นที่ของคุณแบบ Realtime เพื่อช่วยระวังภัยและค้นหาเบาะแสได้ไวขึ้น
          </p>
        </div>

        {/* 2. กรอบแสดงแผนที่จริง (Real Map Container) */}
        <div className="relative mt-8 overflow-hidden rounded-3xl border border-border/80 bg-card shadow-md dark:border-border/60">
          {/* เรนเดอร์แผนที่ด้วย Suspense Boundary */}
          <Suspense
            fallback={
              <div className="flex h-[440px] w-full items-center justify-center rounded-3xl bg-muted/60 sm:h-[520px]">
                <div className="flex flex-col items-center gap-3">
                  <Skeleton className="size-12 rounded-full" />
                  <span className="text-sm font-medium text-muted-foreground">
                    กำลังโหลดแผนที่ดาวเทียมและพิกัดสัตว์เลี้ยง...
                  </span>
                </div>
              </div>
            }
          >
            {isMounted ? (
              mapProvider === 'leaflet' ? (
                <RealLeafletMap heightClass="h-[440px] sm:h-[520px]" />
              ) : (
                <GoogleMapsEmbed heightClass="h-[440px] sm:h-[520px]" />
              )
            ) : (
              <div className="flex h-[440px] w-full items-center justify-center rounded-3xl bg-muted/60 sm:h-[520px]">
                <span className="text-sm font-medium text-muted-foreground">
                  กำลังเตรียมแผนที่...
                </span>
              </div>
            )}
          </Suspense>

          {/* 3. การ์ดข้อมูลลอยตัวพร้อมฟังก์ชัน "ย่อ-ขยายได้ (Collapsible Nearby Panel)"
              วางไว้ที่ top-16 ไม่บังปุ่มซูมเข้าซูมออก (+ / -) มุมบนซ้าย */}
          <div className="absolute top-16 left-3.5 z-[400] transition-all duration-300 ease-in-out sm:top-20 sm:left-6">
            {isPanelExpanded ? (
              /* การ์ดแบบขยายเต็ม (Expanded View) */
              <div className="w-[280px] sm:w-[310px] rounded-2xl border border-border/80 bg-white/95 p-3.5 shadow-lg backdrop-blur-md transition-all sm:p-4 dark:bg-card/95 dark:border-border">
                {/* ส่วนหัวการ์ด พร้อมปุ่มกดย่อการ์ด */}
                <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground sm:text-sm">
                    <Navigation className="size-4 text-primary" />
                    <span>จุดเสี่ยงในพิกัดของคุณ</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                      6 เคส
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsPanelExpanded(false)}
                      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="ย่อการ์ดแจ้งเตือนจุดเสี่ยง"
                      title="ย่อการ์ดเพื่อดูแผนที่เต็มตา"
                    >
                      <ChevronUp className="size-4" />
                    </button>
                  </div>
                </div>

                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                  พบสัตว์เลี้ยงหาย 6 รายการ และแจ้งพบ 3 รายการ ในระยะ 5 กม. รอบตัวคุณ
                </p>

                {/* List รายการสัตว์เลี้ยงในระยะใกล้ (Nearby Items List) */}
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      เคสล่าสุดใกล้คุณ
                    </span>
                    <span className="text-[10px] text-primary font-semibold">
                      ในระยะ 5 กม.
                    </span>
                  </div>

                  {NEARBY_PET_CASES.map((pet) => (
                    <Link
                      key={pet.id}
                      href={`/posts/${pet.id}`}
                      className="group flex items-center gap-2.5 rounded-xl border border-border/60 bg-background/80 p-2 transition-all hover:border-primary/50 hover:bg-muted/60"
                    >
                      {/* รูปสัตว์เลี้ยงขนาดย่อ */}
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={pet.imageUrl}
                          alt={pet.name}
                          fill
                          sizes="40px"
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>

                      {/* ข้อมูลสัตว์เลี้ยงและระยะทาง */}
                      <div className="flex flex-1 flex-col overflow-hidden">
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate text-xs font-bold text-foreground">
                            {pet.name}
                          </span>
                          <span
                            className={cn(
                              'shrink-0 rounded-[4px] px-1.5 py-0.2 text-[9px] font-bold',
                              pet.type === 'LOST'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            )}
                          >
                            {pet.type === 'LOST' ? 'หาย' : 'พบ'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="truncate">{pet.location}</span>
                          <span className="shrink-0 font-bold text-primary">
                            {pet.distance}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              /* การ์ดแบบย่อขนาดกะทัดรัด (Collapsed Pill Button) */
              <button
                type="button"
                onClick={() => setIsPanelExpanded(true)}
                className="group flex items-center gap-2 rounded-2xl border border-border/80 bg-white/95 px-3.5 py-2 text-xs font-bold text-foreground shadow-md backdrop-blur-md transition-all hover:scale-105 hover:bg-muted/90 dark:bg-card/95 dark:border-border"
                aria-label="ขยายการ์ดแจ้งเตือนจุดเสี่ยง"
              >
                <div className="flex size-6 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <AlertTriangle className="size-3.5" />
                </div>
                <span>จุดเสี่ยงพิกัดคุณ (6 เคส)</span>
                <span className="flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform group-hover:text-foreground">
                  <ChevronDown className="size-3.5" />
                </span>
              </button>
            )}
          </div>

          {/* 4. ปุ่มเครื่องมือสลับเวอร์ชันแผนที่ (Provider Switcher) มุมบนขวา */}
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

        {/* 5. ปุ่ม CTA เปิดดูแผนที่เต็มจอ */}
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
